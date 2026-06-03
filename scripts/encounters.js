/* ═══════════════════════════════════════════════════════════
   ENCOUNTERS
   ═══════════════════════════════════════════════════════════ */

let encounterProgress = [];
let activeEncounter = null;

function resetEncounters() {
  encounterProgress = ENEMIES.slice(1).map(() => ({ resolved: false }));
  activeEncounter = null;
}

function isGapDecided(gapIndex) {
  return !!encounterProgress[gapIndex]?.resolved || !!restProgress[gapIndex]?.used;
}

function isEncounterAvailable(gapIndex) {
  return !!campaignProgress[gapIndex]?.beaten && !isGapDecided(gapIndex);
}

function getRandomEncounter() {
  return ENCOUNTERS[Math.floor(Math.random() * ENCOUNTERS.length)];
}

function rollOutcome(outcomes) {
  const roll = Math.random();
  let cumulative = 0;
  for (const outcome of outcomes) {
    cumulative += outcome.chance;
    if (roll < cumulative) return outcome;
  }
  return outcomes[outcomes.length - 1];
}

const ENCOUNTER_EFFECTS = {
  hp(amount) {
    if (!gs?.player) return '';
    gs.player.maxHp = getPlayerMaxHp();
    gs.player.hp = Math.max(1, Math.min(gs.player.hp + amount, gs.player.maxHp));
    return `${amount > 0 ? '+' : ''}${amount} HP`;
  },
  maxHp(amount) {
    playerMaxHpBonus += amount;
    if (gs?.player) {
      if (amount > 0) gs.player.hp += amount; // gaining max HP also heals that much
      gs.player.maxHp = getPlayerMaxHp();
      gs.player.hp = Math.max(1, Math.min(gs.player.hp, gs.player.maxHp));
    }
    savePlayerProgress();
    return `${amount > 0 ? '+' : ''}${amount} Max HP`;
  },
  attackBonus(amount) {
    playerAttackBonus += amount;
    savePlayerProgress();
    return `${amount > 0 ? '+' : ''}${amount} ATK`;
  },
  exp(amount) {
    runExpEarned += amount;
    return `${amount > 0 ? '+' : ''}${amount} EXP`;
  },
  addCard(cardId) {
    const def = CARD_DEFS[cardId];
    if (!def) return '';
    def.unlocked = true;
    playerDeck.push(cardId);
    return `Gained ${def.name}`;
  },
  loseRandomCard() {
    if (playerDeck.length <= 1) return 'Your pack is already bare';
    const idx = Math.floor(Math.random() * playerDeck.length);
    const removed = playerDeck.splice(idx, 1)[0];
    return `Lost ${CARD_DEFS[removed]?.name ?? 'a card'}`;
  },
};

function applyEncounterEffects(effects) {
  const details = [];
  (effects || []).forEach(effect => {
    const handler = ENCOUNTER_EFFECTS[effect.type];
    if (!handler) {
      console.warn(`Unknown encounter effect: ${effect.type}`);
      return;
    }
    const payload = effect.amount ?? effect.cardId;
    const text = handler(payload);
    if (text) details.push({ text, tone: getEffectTone(effect) });
  });
  return details;
}

function getEffectTone(effect) {
  if (effect.tone) return effect.tone;
  if (typeof effect.amount === 'number') return effect.amount >= 0 ? 'positive' : 'negative';
  return '';
}

function openEncounter(gapIndex) {
  if (!isEncounterAvailable(gapIndex)) return;
  activeEncounter = { gapIndex, encounter: getRandomEncounter() };
  renderEncounter();

  const overlay = document.getElementById('encounter-overlay');
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('show');
}

function renderEncounter() {
  const { encounter } = activeEncounter;

  document.getElementById('encounter-title').textContent = encounter.title;
  document.getElementById('encounter-desc').textContent = encounter.description;

  const img = document.getElementById('encounter-img');
  img.style.display = '';
  img.src = encounter.img || '';
  img.alt = encounter.title;

  const result = document.getElementById('encounter-result');
  result.innerHTML = '';
  result.classList.remove('show');

  const continueBtn = document.getElementById('encounter-continue');
  continueBtn.style.display = 'none';

  const optionsEl = document.getElementById('encounter-options');
  optionsEl.innerHTML = '';
  encounter.options.forEach((option, idx) => {
    const btn = document.createElement('button');
    btn.className = 'action-btn encounter-option';
    btn.textContent = option.label;
    btn.addEventListener('click', () => chooseEncounterOption(idx));
    optionsEl.appendChild(btn);
  });
}

function chooseEncounterOption(optionIndex) {
  if (!activeEncounter) return;
  const option = activeEncounter.encounter.options[optionIndex];
  const outcome = rollOutcome(option.outcomes);
  const details = applyEncounterEffects(outcome.effects);

  document.querySelectorAll('#encounter-options .encounter-option').forEach(btn => {
    btn.disabled = true;
  });

  showEncounterResult(outcome.message, details);
}

function showEncounterResult(message, details) {
  const result = document.getElementById('encounter-result');
  const detailHtml = (details && details.length)
    ? `<div class="encounter-result-effects">${details.map(d =>
        `<span class="effect-chip${d.tone ? ' ' + d.tone : ''}">${d.text}</span>`
      ).join('')}</div>`
    : '';
  result.innerHTML = `<p class="encounter-result-msg">${message}</p>${detailHtml}`;
  result.classList.add('show');

  const continueBtn = document.getElementById('encounter-continue');
  continueBtn.style.display = '';
}

function closeEncounter() {
  if (activeEncounter) {
    const { gapIndex } = activeEncounter;
    encounterProgress[gapIndex].resolved = true;

    const nextEnemyIndex = gapIndex + 1;
    if (campaignProgress[nextEnemyIndex]) {
      campaignProgress[nextEnemyIndex].unlocked = true;
      selectedEnemyIndex = nextEnemyIndex;
    }
    activeEncounter = null;
  }
  const overlay = document.getElementById('encounter-overlay');
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  renderMap();
  scrollToActiveNode();
}

function renderEncounterNode(gapIndex) {
  if (gapIndex < 0 || gapIndex >= encounterProgress.length) return null;

  const resolved = encounterProgress[gapIndex].resolved;
  const available = isEncounterAvailable(gapIndex);

  const skipped = !resolved && isGapDecided(gapIndex);
  const state = resolved ? 'resolved' : skipped ? 'skipped' : available ? 'available' : 'locked';

  const node = document.createElement('button');
  node.type = 'button';
  node.className = `encounter-node ${state}`;
  node.disabled = !available;

  const icon = resolved ? 'check' : skipped ? 'block' : 'help';
  const label = resolved ? 'Visited' : skipped ? 'Skipped' : available ? 'Encounter' : 'Locked';
  node.innerHTML = `
    <span class="encounter-node-icon material-symbols-outlined">${icon}</span>
    <span class="encounter-node-label">${label}</span>
  `;

  if (available) node.addEventListener('click', () => openEncounter(gapIndex));
  return node;
}
