/* ═══════════════════════════════════════════════════════════
   GAME STATE
   ═══════════════════════════════════════════════════════════ */

/**
 * gs — the single global game state object.
 * Rebuilt fresh by initGame() on each new run.
 *
 * @type {{
 *   player: { hp: number, maxHp: number, block: number },
 *   enemy:  { hp: number, maxHp: number, block: number, intent: Intent },
 *   energy:  number,
 *   draw:    string[],
 *   discard: string[],
 *   hand:    string[],
 *   phase:   'player' | 'enemy'
 * }}
 */

let playerDeck = [...STARTING_DECK];
let rewardOverlayNextAction = null;
let gs;
let campaignProgress = [];
let selectedEnemyIndex = 0;

function initGame(enemyIndex = 0) {
  document.getElementById('gameover').classList.remove('show');
  hideUnlockOverlay();

  const preservedHp = gs?.player?.hp > 0 ? Math.min(gs.player.hp, PLAYER_MAX_HP) : PLAYER_MAX_HP;

  gs = {
    player: { hp: preservedHp, maxHp: PLAYER_MAX_HP, block: 0, nextAttackMultiplier: 1, repelNextAttack: 0 },
    currentEnemyIndex: enemyIndex,
    enemy: spawnEnemy(ENEMIES[enemyIndex]),
    energy: MAX_ENERGY,
    draw: shuffle(getDeckForBattle()),
    discard: [],
    hand: [],
    phase: 'player',
  };

  dealHand();
  renderAll();
}

/* ═══════════════════════════════════════════════════════════
   DECK MANAGEMENT
   ═══════════════════════════════════════════════════════════ */

function renderDrawPileCount() {
  const drawPileCount = document.getElementById('draw-pile-count');
  drawPileCount.textContent = gs.draw.length;
}

function renderDiscardPileCount() {
  const discardPileCount = document.getElementById('discard-pile-count');
  discardPileCount.textContent = gs.discard.length;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function drawCard() {
  if (gs.draw.length === 0) {
    if (gs.discard.length === 0) return null;
    gs.draw = shuffle([...gs.discard]);
    gs.discard = [];
  }
  return gs.draw.pop();
}

function getDeckForBattle() {
  return [...playerDeck];
}

function spawnEnemy(template) {
  return {
    ...template,
    hp: template.maxHp,
    block: 0,
    intent: pickIntent(template),
    vulnerable: 0,
    burn: 0,
  };
}

function awardEnemyUnlocks(enemy) {
  const unlockedIds = (enemy.unlocks || []).filter(cardId => {
    const def = CARD_DEFS[cardId];
    return def && !def.unlocked;
  });

  unlockedIds.forEach(cardId => {
    CARD_DEFS[cardId].unlocked = true;
    if (!playerDeck.includes(cardId)) playerDeck.push(cardId);
  });

  return unlockedIds;
}

function showUnlockRewardOverlay(unlockedIds, buttonText, onCloseAction) {
  const copy = document.getElementById('unlock-overlay-copy');
  const cta = document.getElementById('unlock-overlay-cta');
  const container = document.getElementById('unlock-cards-display');
  container.innerHTML = '';

  if (unlockedIds.length === 0) {
    copy.textContent = 'No new cards were unlocked.';
    const message = document.createElement('div');
    message.className = 'unlock-empty';
    message.textContent = 'You can return to the map to continue your journey.';
    container.appendChild(message);
  } else {
    copy.textContent = 'You have unlocked new cards for your deck!';
    unlockedIds.forEach(cardId => {
      const def = CARD_DEFS[cardId];
      if (!def) return;

      const artHtml = `<img src="${def.img}" alt="${def.name}" class="card-art-img">`;
      const card = document.createElement('div');
      card.className = `card ${def.type}`;
      card.innerHTML = `
        <div class="card-cost">${def.cost}</div>
        <div class="card-art">${artHtml}</div>
        <div class="card-name">${def.name}</div>
        <div class="card-divider"></div>
        <div class="card-desc">${def.desc}</div>
      `;
      container.appendChild(card);
    });
  }

  if (cta) cta.textContent = buttonText || 'Continue';
  rewardOverlayNextAction = typeof onCloseAction === 'function' ? onCloseAction : null;
  document.getElementById('unlock-overlay').classList.add('show');
}

function closeUnlockRewardOverlay() {
  document.getElementById('unlock-overlay').classList.remove('show');
  if (rewardOverlayNextAction) {
    const callback = rewardOverlayNextAction;
    rewardOverlayNextAction = null;
    callback();
  }
}

function hideUnlockOverlay() {
  document.getElementById('unlock-overlay').classList.remove('show');
  rewardOverlayNextAction = null;
}

function returnToMapAfterVictory() {
  closeUnlockRewardOverlay();
}

function returnToEndgameAfterVictory() {
  closeUnlockRewardOverlay();
  endGame(true);
}

function pickIntent(enemy) {
  const move = enemy.attacks[Math.floor(Math.random() * enemy.attacks.length)];
  const icon = move.type === 'attack'
    ? '<span style="color:#e05020" class="material-symbols-outlined">swords</span>'
    : '<span style="color:#5ba3f5" class="material-symbols-outlined">shield</span>';

  return {
    type: move.type,
    value: move.value,
    icon,
    text: `${move.name} for ${move.value}`,
  };
}

function dealHand() {
  gs.hand = [];
  for (let i = 0; i < HAND_SIZE; i++) {
    const card = drawCard();
    if (card) gs.hand.push(card);
  }
  renderDrawPileCount();
  renderDiscardPileCount();
}

/* ═══════════════════════════════════════════════════════════
   CARD PLAY
   ═══════════════════════════════════════════════════════════ */

function playCard(idx) {
  if (gs.phase !== 'player') return;

  const cardId = gs.hand[idx];
  const def = CARD_DEFS[cardId];
  if (gs.energy < def.cost) return;

  gs.energy -= def.cost;
  gs.hand.splice(idx, 1);
  gs.discard.push(cardId);

  switch (def.type) {
    case 'attack':
      const damage = def.value * gs.player.nextAttackMultiplier;
      if (gs.player.nextAttackMultiplier > 1) {
        gs.player.nextAttackMultiplier = 1;
        showFloatNum('#player-panel', 'Attack Doubled!', '#ffd166');
      }
      applyAttack(gs.enemy, '#enemy-panel', damage);

      if (def.burn > 0) {
        gs.enemy.burn = def.burn
      }
      if (def.vulnerable > 0) {
        gs.enemy.vulnerable = def.vulnerable;
      }
      break;
    case 'defend':
      gs.player.block += def.value;
      showFloatNum('#player-panel', `+${def.value} Block`, '#5ba3f5');
      break;
    case 'special':
      switch (def.id) {
        case 'powerUp':
          gs.player.nextAttackMultiplier = def.multiplier || 2;
          showFloatNum('#player-panel', 'Next attack doubled!', '#ffd166');
          break;
        case 'heal':
          const healAmount = def.value;
          gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + healAmount);
          showFloatNum('#player-panel', `+${healAmount} HP`, '#66bb6a');
          break;
        case 'repel':
          gs.player.block += def.value;
          gs.player.repelNextAttack = def.reflect || 0;
          showFloatNum('#player-panel', `+${def.value} Block`, '#5ba3f5');
      }
      break;
    default:
      console.warn(`Unknown card type: ${def.type}`);
  }

  renderAll();
  if (gs.enemy.hp <= 0) { handleEnemyDefeated(); return; }
}

function applyAttack(target, paneId, damage) {
  const absorbed = Math.min(target.block, damage);
  target.block -= absorbed;
  var dealt = damage - absorbed;

  if (target.vulnerable > 0) {
    dealt = Math.round(dealt * 1.25);
  }

  target.hp = Math.max(0, target.hp - dealt);

  if (dealt > 0) {
    showFloatNum(paneId, `-${dealt} HP`, '#ff6040');
    shakeEl(paneId);
  } else {
    showFloatNum(paneId, 'Blocked', '#5ba3f5');
  }

  // Repel attack
  if (gs.player.repelNextAttack > 0) {
    gs.enemy.hp = Math.max(0, gs.enemy.hp - gs.player.repelNextAttack);
    showFloatNum('#enemy-panel', `-${gs.player.repelNextAttack} (reflected)`, '#ff6040');
    gs.player.repelNextAttack = 0;
  }
}

/* ═══════════════════════════════════════════════════════════
   TURN FLOW
   ═══════════════════════════════════════════════════════════ */

function endTurn() {
  if (gs.phase !== 'player') return;
  gs.phase = 'enemy';
  document.getElementById('end-turn-btn').disabled = true;

  gs.discard.push(...gs.hand);
  gs.hand = [];
  gs.enemy.block = 0;

  renderAll();

  showBanner('Enemy Turn…', () => enemyTurn());
}

function enemyTurn() {
  if (gs.enemy.burn > 0) {
    applyAttack(gs.enemy, '#enemy-panel', gs.enemy.burn);
    gs.enemy.burn -= 1;
  }
  if (gs.enemy.vulnerable > 0) {
    gs.enemy.vulnerable -= 1;
  }

  const { intent } = gs.enemy;

  if (intent.type === 'attack') {
    applyAttack(gs.player, '#player-panel', intent.value);
  } else {
    gs.enemy.block += intent.value;
    showFloatNum('#enemy-panel', `+${intent.value} Block`, '#5ba3f5');
  }

  renderAll();
  if (gs.player.hp <= 0) { endGame(false); return; }

  setTimeout(beginPlayerTurn, 900);
}

function beginPlayerTurn() {
  gs.player.block = 0;

  gs.enemy.intent = pickIntent(gs.enemy);
  gs.energy = MAX_ENERGY;
  gs.phase = 'player';

  dealHand();
  renderAll();

  document.getElementById('end-turn-btn').disabled = false;
  showBanner('Your Turn', null);
}

/* ═══════════════════════════════════════════════════════════
   GAME OVER
   ═══════════════════════════════════════════════════════════ */

function endGame(won) {
  const overlay = document.getElementById('gameover');
  const title = document.getElementById('go-title');
  const sub = document.getElementById('go-sub');

  if (won) {
    title.textContent = 'Victory!';
    title.className = 'win';
    sub.textContent = 'Kera has fallen. Play again?';
  } else {
    title.textContent = 'Defeated';
    title.className = 'lose';
    sub.textContent = "Game over. Play again?";
  }

  setTimeout(() => overlay.classList.add('show'), 600);
}

/* ═══════════════════════════════════════════════════════════
   RENDERING
   ═══════════════════════════════════════════════════════════ */

function renderAll() {
  renderEnemyInfo();
  renderHP();
  renderBadges();
  renderEnergyOrbs();
  renderIntent();
  renderHand();
  renderDrawPileCount();
  renderDiscardPileCount();
}

function renderEnemyInfo() {
  const nameEl = document.querySelector('#enemy-panel .combatant-name');
  if (nameEl) nameEl.textContent = gs.enemy.name;
  const spriteArea = document.getElementById('enemy-sprite');
  if (spriteArea) {
    spriteArea.innerHTML = `<img src="${gs.enemy.sprite}" alt="${gs.enemy.name}" />`;
  }
}

function renderHP() {
  const { player: p, enemy: e } = gs;
  document.getElementById('player-hp').textContent = `${p.hp} / ${p.maxHp}`;
  document.getElementById('player-hp-bar').style.width = `${(p.hp / p.maxHp) * 100}%`;
  document.getElementById('enemy-hp').textContent = `${e.hp} / ${e.maxHp}`;
  document.getElementById('enemy-hp-bar').style.width = `${(e.hp / e.maxHp) * 100}%`;
}

function renderBadges() {
  setBadge('player', 'block', gs.player.block);
  setBadge('enemy', 'block', gs.enemy.block);
  setBadge('player', 'repel', gs.player.repelNextAttack);
  setBadge('enemy', 'vulnerable', gs.enemy.vulnerable);
  setBadge('enemy', 'burn', gs.enemy.burn);
}

function setBadge(who, badgeName, val) {
  const badge = document.getElementById(`${who}-${badgeName}-badge`);
  document.getElementById(`${who}-${badgeName}-val`).textContent = val;
  badge.classList.toggle('visible', val > 0);
}

function renderEnergyOrbs() {
  const container = document.getElementById('orbs');
  container.innerHTML = '';
  for (let i = 0; i < MAX_ENERGY; i++) {
    const orb = document.createElement('div');
    orb.className = 'orb' + (i >= gs.energy ? ' spent' : '');
    container.appendChild(orb);
  }
}

function renderIntent() {
  document.getElementById('intent-icon').innerHTML = gs.enemy.intent.icon;
  document.getElementById('intent-text').textContent = gs.enemy.intent.text;
}

function renderHand() {
  const area = document.getElementById('hand-area');
  area.innerHTML = '';

  gs.hand.forEach((cardId, idx) => {
    const def = CARD_DEFS[cardId];
    const affordable = gs.energy >= def.cost;
    const artHtml = `<img src="${def.img}" alt="${def.name}" class="card-art-img">`;

    const card = document.createElement('div');
    card.className = `card card-deal ${def.type}${affordable ? '' : ' unaffordable'}`;
    card.style.animationDelay = `${idx * 0.07}s`;

    var description = '';
    switch (def.type) {
      case 'attack':
        const attackValue = def.value * gs.player.nextAttackMultiplier;
        const attackValueText = gs.player.nextAttackMultiplier > 1
          ? ` <span style="color: #66bb6a;">${attackValue}</span> `
          : attackValue;
        description = `Deal ${attackValueText} damage`;
        if (def.vulnerable > 0) {
          description += ` and apply ${def.vulnerable} vulnerable`;
        }
        if (def.burn > 0) {
          description += ` and apply ${def.burn} burn`;
        }
        break;
      default:
        description = def.desc;
        break;
    }

    const type = def.type === 'attack' ? 'swords' : def.type === 'defend' ? 'shield' : 'airwave';

    card.innerHTML = `
      <div class="card-cost">${def.cost}</div>
      <div class="card-art">${artHtml}</div>
      <div class="card-name">${def.name}</div>
      <div class="card-divider"></div>
      <div class="card-desc"><span>${description}</span></div>
      <div class="card-type"><span class="material-symbols-outlined">${type}</span></div>
    `;

    if (affordable) {
      const capturedIdx = idx;
      card.addEventListener('click', () => playCard(capturedIdx));
    }

    area.appendChild(card);
  });
}

/* ═══════════════════════════════════════════════════════════
   VFX HELPERS
   ═══════════════════════════════════════════════════════════ */

function showFloatNum(selector, text, color) {
  const target = document.querySelector(selector);
  const rect = target.getBoundingClientRect();

  const el = document.createElement('div');
  el.className = 'float-num';
  el.textContent = text;
  el.style.color = color;
  el.style.left = `${rect.left + rect.width / 2 - 25}px`;
  el.style.top = `${rect.top + rect.height / 3}px`;

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function shakeEl(selector) {
  const el = document.querySelector(selector);
  el.classList.remove('shaking');
  void el.offsetWidth; // force reflow to restart animation
  el.classList.add('shaking');
  setTimeout(() => el.classList.remove('shaking'), 500);
}

function showBanner(text, cb) {
  const banner = document.getElementById('phase-banner');
  document.getElementById('banner-text').textContent = text;
  banner.classList.add('show');

  setTimeout(() => {
    banner.classList.remove('show');
    if (cb) setTimeout(cb, 200);
  }, 900);
}

function showStartScreen() {
  renderMap();
  document.getElementById('map-overlay').classList.add('show');
  setTimeout(() => {
    const mapList = document.getElementById('map-list');
    const unlockedNodes = mapList.querySelectorAll('.map-node.unlocked');
    if (unlockedNodes.length > 0) {
      unlockedNodes[unlockedNodes.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 0);
}

function hideStartScreen() {
  document.getElementById('map-overlay').classList.remove('show');
}

function startGame() {
  startSelectedEnemy();
}

function toggleGameMenu() {
  document.getElementById('game-menu').classList.toggle('open');
}

function showHowTo() {
  document.getElementById('howto-overlay').classList.add('show');
}

function hideHowTo() {
  document.getElementById('howto-overlay').classList.remove('show');
}

function showUnlockedDeck() {
  const container = document.getElementById('deck-cards-display');
  const unlockedIds = Object.values(CARD_DEFS).filter(d => d.unlocked).map(d => d.id);
  renderCards(container, unlockedIds, 'No unlocked cards available.');

  const overlay = document.getElementById('deck-overlay');
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('show');
}

function hideUnlockedDeck() {
  const overlay = document.getElementById('deck-overlay');
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
}

function renderCards(container, cardIds, emptyMessage) {
  container.innerHTML = '';

  if (!cardIds || cardIds.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'unlock-empty';
    emptyMsg.textContent = emptyMessage || 'No cards to show.';
    container.appendChild(emptyMsg);
    return;
  }

  cardIds.forEach(cardId => {
    const def = CARD_DEFS[cardId];
    if (!def) return;

    const artHtml = `<img src="${def.img}" alt="${def.name}" class="card-art-img">`;
    const card = document.createElement('div');
    card.className = `card ${def.type}`;
    const type = def.type === 'attack' ? 'swords' : def.type === 'defend' ? 'shield' : 'airwave';

    card.innerHTML = `
      <div class="card-cost">${def.cost}</div>
      <div class="card-art">${artHtml}</div>
      <div class="card-name">${def.name}</div>
      <div class="card-divider"></div>
      <div class="card-desc">${def.desc}</div>      
      <div class="card-type"><span class="material-symbols-outlined">${type}</span></div>
    `;

    container.appendChild(card);
  });
}

function showDiscardPile() {
  if (!gs) return;
  const container = document.getElementById('discard-pile-display');
  renderCards(container, gs.discard, 'No cards have been discarded yet.');

  const overlay = document.getElementById('discard-pile-overlay');
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('show');
}

function hideDiscardPile() {
  const overlay = document.getElementById('discard-pile-overlay');
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
}

function showDrawPile() {
  if (!gs) return;
  const container = document.getElementById('draw-pile-display');
  renderCards(container, gs.draw, 'The draw pile is empty.');

  const overlay = document.getElementById('draw-pile-overlay');
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('show');
}

function hideDrawPile() {
  const overlay = document.getElementById('draw-pile-overlay');
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
}

function resetCampaign() {
  document.getElementById('end-turn-btn').disabled = false;
  campaignProgress = ENEMIES.map((enemy, index) => ({
    id: enemy.id,
    unlocked: index === 0,
    beaten: false,
  }));

  selectedEnemyIndex = 0;

  gs = {
    player: { hp: PLAYER_MAX_HP, maxHp: PLAYER_MAX_HP, block: 0, nextAttackMultiplier: 1, repelNextAttack: 0 },
    currentEnemyIndex: selectedEnemyIndex,
    enemy: spawnEnemy(ENEMIES[selectedEnemyIndex]),
    energy: MAX_ENERGY,
    draw: shuffle(getDeckForBattle()),
    discard: [],
    hand: [],
    phase: 'player',
  };

  playerDeck = [...STARTING_DECK];
  Object.values(CARD_DEFS).forEach(def => {
    def.unlocked = !!def.defaultUnlocked;
  });
  hideUnlockOverlay();
  renderMap();
}

function renderMap() {
  const mapList = document.getElementById('map-list');
  if (!mapList) return;

  mapList.innerHTML = '';

  ENEMIES.forEach((enemy, index) => {
    const progress = campaignProgress[index];

    if (index > 0) {
      const arrow = document.createElement('span');
      arrow.className = 'map-arrow material-symbols-outlined';
      arrow.style.opacity = progress.unlocked ? '1' : '0.3';
      arrow.innerHTML = 'arrow_downward';
      mapList.appendChild(arrow);
    }

    const node = document.createElement('button');
    node.type = 'button';
    node.className = `map-node ${progress.unlocked ? 'unlocked' : 'locked'}${index === selectedEnemyIndex ? ' selected' : ''}`;
    node.disabled = !progress.unlocked;
    node.addEventListener('click', () => selectMapNode(index));

    const statusText = progress.beaten ? 'Cleared' : progress.unlocked ? 'Available' : 'Locked';

    node.innerHTML = `
    <img src="${enemy.thumb}" alt="${enemy.name}" class="node-sprite">
      <span class="node-label">Level ${index + 1}</span>
      <div class="card-divider"></div>
      <span class="node-name">${enemy.name}</span>
      <span class="node-status">${statusText}</span>
    `;

    mapList.appendChild(node);


  });

  const startBtn = document.getElementById('map-start-btn');
  if (startBtn) startBtn.disabled = !campaignProgress[selectedEnemyIndex]?.unlocked;
}

function selectMapNode(index) {
  if (!campaignProgress[index]?.unlocked) return;
  selectedEnemyIndex = index;
  renderMap();
}

function startSelectedEnemy() {
  if (!campaignProgress[selectedEnemyIndex]?.unlocked) return;
  hideStartScreen();
  initGame(selectedEnemyIndex);
}

function handleEnemyDefeated() {
  const finishedIndex = gs.currentEnemyIndex;
  campaignProgress[finishedIndex].beaten = true;

  const unlockedCards = awardEnemyUnlocks(ENEMIES[finishedIndex]);
  const nextIndex = finishedIndex + 1;
  const hasNext = nextIndex < ENEMIES.length;

  if (hasNext) {
    campaignProgress[nextIndex].unlocked = true;
    selectedEnemyIndex = nextIndex;
    renderMap();
    showBanner('Level Cleared', () => {
      showUnlockRewardOverlay(unlockedCards, 'Return to Map', () => {
        showStartScreen();
      });
    });
  } else {
    showBanner('Level Cleared', () => {
      showUnlockRewardOverlay(unlockedCards, 'Continue', () => {
        endGame(true);
      });
    });
  }
}

function restartCampaign() {
  document.getElementById('gameover').classList.remove('show');
  resetCampaign();
  showStartScreen();
}

/* ═══════════════════════════════════════════════════════════
   START
   ═══════════════════════════════════════════════════ */

resetCampaign();
showStartScreen();
