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
  renderPlayerLevel();
}

function renderMapPlayerHeader() {
  const hpEl = document.getElementById('map-player-hp');
  const atkEl = document.getElementById('map-player-atk');
  if (hpEl) {
    const maxHp = getPlayerMaxHp();
    const hp = gs?.player?.hp ?? maxHp;
    hpEl.textContent = `${hp} / ${maxHp}`;
  }
  if (atkEl) atkEl.textContent = `+${playerAttackBonus}`;
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
  setBadge('player', 'vulnerable', gs.player.vulnerable);
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
  const intent = gs.enemy.intent;
  const intentColor = intent.type === 'attack' ? '#e05020'
    : intent.type === 'special' ? '#c77dff' : '#5ba3f5';

  let html;
  if (intent.type === 'attack') {
    if (gs.player.vulnerable > 0) {
      const boosted = Math.round(intent.value * 1.25);
      html = `${intent.name} for <span style="color:#ffb38a">${boosted}</span>`;
    } else {
      html = `${intent.name} for ${intent.value}`;
    }
  } else if (intent.type === 'special') {
    html = `${intent.name} (+${intent.vulnerable} Vulnerable)`;
  } else {
    html = `${intent.name} for ${intent.value}`;
  }

  document.getElementById('intent-icon').innerHTML = intent.icon;
  document.getElementById('intent-text').innerHTML = html;
  document.getElementById('intent-text').style.color = intentColor;
  document.getElementById('intent-box').style.borderColor = intentColor;
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
        const attackValue = (def.value + playerAttackBonus) * gs.player.nextAttackMultiplier;
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

    const orbsHtml = Array.from({ length: def.cost }, () => `<div class="card-orb"></div>`).join('');
    card.innerHTML = `
      <div class="card-art">${artHtml}</div>
      <div class="card-name">${def.name}</div>
      <div class="card-divider"></div>
      <div class="card-desc"><span>${description}</span></div>
      <div class="card-orbs">${orbsHtml}</div>
    `;

    if (affordable) {
      const capturedIdx = idx;
      card.addEventListener('click', () => playCard(capturedIdx));
    }

    area.appendChild(card);
  });
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

    const orbsHtml = Array.from({ length: def.cost }, () => `<div class="card-orb"></div>`).join('');
    card.innerHTML = `
      <div class="card-art">${artHtml}</div>
      <div class="card-name">${def.name}</div>
      <div class="card-divider"></div>
      <div class="card-desc">${def.desc}</div>
      <div class="card-orbs">${orbsHtml}</div>
    `;

    container.appendChild(card);
  });
}
