/**
 * game.js
 * Dragon Gods — Chronicle of Ash
 *
 * Sections:
 *   1. Constants & Card Definitions
 *   2. Game State
 *   3. Deck Management
 *   4. Card Play
 *   5. Turn Flow
 *   6. Game Over
 *   7. Rendering
 *   8. VFX Helpers
 *   9. Boot
 */

/* ═══════════════════════════════════════════════════════════
   1. CONSTANTS & CARD DEFINITIONS
   ═══════════════════════════════════════════════════════════ */

const MAX_ENERGY = 3;
const HAND_SIZE = 5;
const PLAYER_MAX_HP = 30;
const ENEMY_MAX_HP = 50;

const CARD_STRIKE = 'strike';
const CARD_DEFEND = 'defend';
const CARD_POWER_UP = 'powerUp';

/**
 * Card definitions. Each card has:
 *   id     — matches key, used as CSS class name
 *   name   — display name
 *   cost   — energy cost
 *   art    — emoji icon fallback
 *   img    — image asset used for card art
 *   desc   — flavour / effect description shown on card
 *   type   — 'attack' | 'defend'
 *   value  — damage dealt or block gained
 */

const CARD_DEFS = {
  strike: {
    id: 'strike', name: 'Strike', cost: 1,
    art: '⚔️', img: 'resources/cardStrike.png', desc: 'Deal 6 damage',
    type: 'attack', value: 6,
    unlocked: true,
  },
  defend: {
    id: 'defend', name: 'Defend', cost: 1,
    art: '🛡️', img: 'resources/cardDefend.png', desc: 'Gain 5 Block',
    type: 'defend', value: 5,
    unlocked: true,
  },
  powerUp: {
    id: 'powerUp', name: 'Power Up', cost: 2,
    art: '⚡', img: 'resources/cardPowerUp.png', desc: 'Double next attack',
    type: 'power', multiplier: 2,
    unlocked: true,
  }
};
const ENEMIES = [
  {
    id: 'kera',
    name: 'Kera The Fire Dragoness',
    maxHp: 10,
    sprite: 'resources/enemy1.png',
    thumb: 'resources/enemy1checkpoint.png',
    attacks: [
      { id: 'flameBreath', name: 'Flame Breath', type: 'attack', value: 6 },
      { id: 'emberShield', name: 'Ember Shield', type: 'defend', value: 6 },
    ],
  },
  {
    id: 'ashling',
    name: 'Ashling Warden',
    maxHp: 44,
    sprite: 'resources/enemy2.png',
    thumb: 'resources/enemy2checkpoint.png',
    attacks: [
      { id: 'emberClaw', name: 'Ember Claw', type: 'attack', value: 5 },
      { id: 'heatBarrier', name: 'Heat Barrier', type: 'defend', value: 8 },
    ],
  },
  {
    id: 'benzo',
    name: 'Benzo The Ice Dragon',
    maxHp: 50,
    sprite: 'resources/enemy3.png',
    thumb: 'resources/enemy3checkpoint.png',
    attacks: [
      { id: 'emberClaw', name: 'Ember Claw', type: 'attack', value: 5 },
      { id: 'heatBarrier', name: 'Heat Barrier', type: 'defend', value: 8 },
    ],
  },
];
/** The player's starting deck (card IDs). */
const STARTING_DECK = [CARD_STRIKE, CARD_STRIKE, CARD_STRIKE, CARD_DEFEND, CARD_DEFEND, CARD_POWER_UP, CARD_POWER_UP];

/* ═══════════════════════════════════════════════════════════
   2. GAME STATE
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
let gs;
let campaignProgress = [];
let selectedEnemyIndex = 0;

/** @global — exposed on window so HTML onclick handlers can call it. */
function initGame(enemyIndex = 0) {
  document.getElementById('gameover').classList.remove('show');

  gs = {
    player: { hp: PLAYER_MAX_HP, maxHp: PLAYER_MAX_HP, block: 0, nextAttackMultiplier: 1 },
    currentEnemyIndex: enemyIndex,
    enemy: spawnEnemy(ENEMIES[enemyIndex]),
    energy: MAX_ENERGY,
    draw: shuffle([...STARTING_DECK]),
    discard: [],
    hand: [],
    phase: 'player',
  };

  dealHand();
  renderAll();
}

/* ═══════════════════════════════════════════════════════════
   3. DECK MANAGEMENT
   ═══════════════════════════════════════════════════════════ */

/** Fisher-Yates in-place shuffle. Returns the same array. */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Draw one card from the draw pile.
 * If the draw pile is empty, shuffle the discard into a new draw pile first.
 * Returns null if both piles are empty.
 */
function drawCard() {
  if (gs.draw.length === 0) {
    if (gs.discard.length === 0) return null;
    gs.draw = shuffle([...gs.discard]);
    gs.discard = [];
  }
  return gs.draw.pop();
}

function spawnEnemy(template) {
  return {
    ...template,
    hp: template.maxHp,
    block: 0,
    intent: pickIntent(template),
  };
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

/** Fill the player's hand up to HAND_SIZE. */
function dealHand() {
  gs.hand = [];
  for (let i = 0; i < HAND_SIZE; i++) {
    const card = drawCard();
    if (card) gs.hand.push(card);
  }
}

/* ═══════════════════════════════════════════════════════════
   4. CARD PLAY
   ═══════════════════════════════════════════════════════════ */

/**
 * Play the card at hand[idx].
 * Validates turn phase and energy, then applies the card effect.
 */
function playCard(idx) {
  if (gs.phase !== 'player') return;

  const cardId = gs.hand[idx];
  const def = CARD_DEFS[cardId];
  if (gs.energy < def.cost) return;

  // Spend energy, remove from hand, move to discard
  gs.energy -= def.cost;
  gs.hand.splice(idx, 1);
  gs.discard.push(cardId);

  if (def.type === 'attack') {
    const damage = def.value * gs.player.nextAttackMultiplier;
    if (gs.player.nextAttackMultiplier > 1) {
      gs.player.nextAttackMultiplier = 1;
      showFloatNum('#player-pane', '⚡ Attack Doubled!', '#ffd166');
    }
    applyAttack(gs.enemy, '#enemy-pane', damage, "You strike the Drake for", "Your blow is absorbed by the Drake's ward!");
  } else if (def.type === 'defend') {
    gs.player.block += def.value;
    showFloatNum('#player-pane', `+${def.value} 🛡`, '#5ba3f5');
  } else if (def.type === 'power') {
    gs.player.nextAttackMultiplier = def.multiplier || 2;
    showFloatNum('#player-pane', '⚡ Next attack doubled!', '#ffd166');
  }

  renderAll();
  if (gs.enemy.hp <= 0) { handleEnemyDefeated(); return; }
}

/**
 * Apply an attack to a target, accounting for their block.
 * @param {object} target     — gs.enemy or gs.player
 * @param {string} paneId     — CSS selector for VFX target
 * @param {number} damage     — raw damage before block
 * @param {string} hitMsg     — log prefix when damage lands
 * @param {string} blockMsg   — log message when fully blocked
 */
function applyAttack(target, paneId, damage, hitMsg, blockMsg) {
  const absorbed = Math.min(target.block, damage);
  target.block -= absorbed;
  const dealt = damage - absorbed;
  target.hp = Math.max(0, target.hp - dealt);

  if (dealt > 0) {
    showFloatNum(paneId, `-${dealt}`, '#ff6040');
    shakeEl(paneId);
  } else {
    showFloatNum(paneId, '🛡', '#5ba3f5');
  }
}

/* ═══════════════════════════════════════════════════════════
   5. TURN FLOW
   ═══════════════════════════════════════════════════════════ */


/** Called by the End Turn button. Discards hand, clears enemy block, and starts the enemy phase. */
function endTurn() {
  if (gs.phase !== 'player') return;
  gs.phase = 'enemy';
  document.getElementById('end-turn-btn').disabled = true;

  // Discard the remaining hand
  gs.discard.push(...gs.hand);
  gs.hand = [];

  // Enemy block expires after the player turn ends
  gs.enemy.block = 0;

  renderAll();

  showBanner('Enemy Turn…', () => enemyTurn());
}

/** Enemy executes its announced intent, then sets up the next player turn. */
function enemyTurn() {
  const { intent } = gs.enemy;

  if (intent.type === 'attack') {
    applyAttack(
      gs.player, '#player-pane', intent.value,
      `${gs.enemy.name} strikes you — you take`,
      `${gs.enemy.name}'s assault is blocked by your ward!`
    );
  } else {
    gs.enemy.block += intent.value;
    showFloatNum('#enemy-pane', `+${intent.value} 🛡`, '#5ba3f5');
  }

  renderAll();
  if (gs.player.hp <= 0) { endGame(false); return; }

  // After a short pause, begin the next player turn
  setTimeout(beginPlayerTurn, 900);
}

/** Resets state for a fresh player turn and re-enables input. */
function beginPlayerTurn() {
  // Player block expires at the start of the next turn
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
   6. GAME OVER
   ═══════════════════════════════════════════════════════════ */

/**
 * Show the victory or defeat overlay.
 * @param {boolean} won — true if the player won
 */
function endGame(won) {
  const overlay = document.getElementById('gameover');
  const title = document.getElementById('go-title');
  const sub = document.getElementById('go-sub');

  if (won) {
    title.textContent = '🏆 Victory!';
    title.className = 'win';
    sub.textContent = 'Kera has fallen. The gods take notice.';
  } else {
    title.textContent = '💀 Defeated';
    title.className = 'lose';
    sub.textContent = "You fall before the dragon's wrath";
  }

  setTimeout(() => overlay.classList.add('show'), 600);
}

/* ═══════════════════════════════════════════════════════════
   7. RENDERING
   ═══════════════════════════════════════════════════════════ */

/** Full re-render of all UI elements from current game state. */
function renderAll() {
  renderEnemyInfo();
  renderHP();
  renderBlockBadges();
  renderEnergyOrbs();
  renderIntent();
  renderHand();
}

function renderEnemyInfo() {
  const nameEl = document.querySelector('#enemy-pane .combatant-name');
  if (nameEl) nameEl.textContent = gs.enemy.name;
  const spriteArea = document.getElementById('enemy-sprite');
  if (spriteArea) {
    spriteArea.innerHTML = `<img src="${gs.enemy.sprite}" alt="${gs.enemy.name}" />`;
  }
}

function renderHP() {
  const { player: p, enemy: e } = gs;

  document.getElementById('player-hp').textContent = p.hp;
  document.getElementById('player-hp-bar').style.width = `${(p.hp / p.maxHp) * 100}%`;
  document.getElementById('enemy-hp').textContent = e.hp;
  document.getElementById('enemy-hp-bar').style.width = `${(e.hp / e.maxHp) * 100}%`;
}

function renderBlockBadges() {
  setBlockBadge('player', gs.player.block);
  setBlockBadge('enemy', gs.enemy.block);
}

function setBlockBadge(who, val) {
  const badge = document.getElementById(`${who}-block-badge`);
  document.getElementById(`${who}-block-val`).textContent = val;
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

/** Re-builds the hand area from gs.hand. */
function renderHand() {
  const area = document.getElementById('hand-area');
  area.innerHTML = '';

  gs.hand.forEach((cardId, idx) => {
    const def = CARD_DEFS[cardId];
    const affordable = gs.energy >= def.cost;
    const artHtml = def.img ? `<img src="${def.img}" alt="${def.name}" class="card-art-img">` : def.art;

    const card = document.createElement('div');
    card.className = `card card-deal ${cardId}${affordable ? '' : ' unaffordable'}`;
    card.style.animationDelay = `${idx * 0.07}s`;

    card.innerHTML = `
      <div class="card-cost">${def.cost}</div>
      <div class="card-art">${artHtml}</div>
      <div class="card-name">${def.name}</div>
      <div class="card-divider"></div>
      <div class="card-desc">${def.desc}</div>
    `;

    // Capture idx in closure so click still works after splice
    if (affordable) {
      const capturedIdx = idx;
      card.addEventListener('click', () => playCard(capturedIdx));
    }

    area.appendChild(card);
  });
}

/* ═══════════════════════════════════════════════════════════
   8. VFX HELPERS
   ═══════════════════════════════════════════════════════════ */

/**
 * Spawn a floating number/icon over a combatant pane.
 * Cleans itself up after the animation finishes.
 */
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

/** Briefly shake a combatant pane (on hit). */
function shakeEl(selector) {
  const el = document.querySelector(selector);
  el.classList.remove('shaking');
  void el.offsetWidth; // force reflow to restart animation
  el.classList.add('shaking');
  setTimeout(() => el.classList.remove('shaking'), 500);
}

/**
 * Show a phase transition banner for ~900ms, then call cb.
 * @param {string}        text — banner message
 * @param {Function|null} cb   — optional callback after banner hides
 */
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
}

function hideStartScreen() {
  document.getElementById('map-overlay').classList.remove('show');
}

function startGame() {
  startSelectedEnemy();
}

function showHowTo() {
  document.getElementById('howto-overlay').classList.add('show');
}

function hideHowTo() {
  document.getElementById('howto-overlay').classList.remove('show');
}

function showUnlockedDeck() {
  const container = document.getElementById('deck-cards-display');
  container.innerHTML = '';

  Object.values(CARD_DEFS).forEach(def => {
    if (!def.unlocked) return;

    const artHtml = def.img ? `<img src="${def.img}" alt="${def.name}" class="card-art-img">` : def.art;

    const card = document.createElement('div');
    card.className = `card ${def.id}`;

    card.innerHTML = `
      <div class="card-cost">${def.cost}</div>
      <div class="card-art">${artHtml}</div>
      <div class="card-name">${def.name}</div>
      <div class="card-divider"></div>
      <div class="card-desc">${def.desc}</div>
    `;

    container.appendChild(card);
  });

  document.getElementById('deck-overlay').classList.add('show');
}

function hideUnlockedDeck() {
  document.getElementById('deck-overlay').classList.remove('show');
}

function resetCampaign() {
  campaignProgress = ENEMIES.map((enemy, index) => ({
    id: enemy.id,
    unlocked: index === 0,
    beaten: false,
  }));
  selectedEnemyIndex = 0;
  renderMap();
}

function renderMap() {
  const mapList = document.getElementById('map-list');
  if (!mapList) return;

  mapList.innerHTML = '';

  ENEMIES.forEach((enemy, index) => {
    const progress = campaignProgress[index];
    const node = document.createElement('button');
    node.type = 'button';
    node.className = `map-node ${progress.unlocked ? 'unlocked' : 'locked'}${index === selectedEnemyIndex ? ' selected' : ''}`;
    node.disabled = !progress.unlocked;
    node.addEventListener('click', () => selectMapNode(index));

    const statusText = progress.beaten ? 'Cleared' : progress.unlocked ? 'Available' : 'Locked';

    node.innerHTML = `
    <img src="${enemy.thumb}" alt="${enemy.name}" class="node-sprite">
      <span class="node-label">Checkpoint ${index + 1}</span>
      <span class="node-name">${enemy.name}</span>
      <span class="node-status">${statusText}</span>
    `;

    mapList.appendChild(node);

    if (index < ENEMIES.length - 1) {
      const arrow = document.createElement('span');
      arrow.className = 'material-symbols-outlined';
      arrow.innerHTML = 'arrow_downward';
      mapList.appendChild(arrow);
    }
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

  const nextIndex = finishedIndex + 1;
  const hasNext = nextIndex < ENEMIES.length;
  if (hasNext) {
    campaignProgress[nextIndex].unlocked = true;
    selectedEnemyIndex = nextIndex;
    renderMap();
    showBanner('Checkpoint Cleared', () => showStartScreen());
  } else {
    endGame(true);
  }
}

function restartCampaign() {
  document.getElementById('gameover').classList.remove('show');
  resetCampaign();
  showStartScreen();
}

/* ═══════════════════════════════════════════════════════════
   9. BOOT
   ═══════════════════════════════════════════════════ */

resetCampaign();
showStartScreen();
