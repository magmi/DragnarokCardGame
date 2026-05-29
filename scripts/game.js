document.getElementById('version-badge').textContent = CONFIG.version;

/* ═══════════════════════════════════════════════════════════
   GAME STATE
   ═══════════════════════════════════════════════════════════ */

let playerDeck = [...STARTING_DECK];
let rewardOverlayNextAction = null;
let pendingUnlockSelection = null;
let gs;
let campaignProgress = [];
let selectedEnemyIndex = 0;
let runExpEarned = 0;

function initGame(enemyIndex = 0) {
  document.getElementById('gameover').classList.remove('show');
  hideUnlockOverlay();

  const maxHp = getPlayerMaxHp();
  const preservedHp = gs?.player?.hp > 0 ? Math.min(gs.player.hp, maxHp) : maxHp;

  gs = {
    player: { hp: preservedHp, maxHp, block: 0, nextAttackMultiplier: 1, repelNextAttack: 0 },
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
  return (enemy.unlocks || []).filter(cardId => {
    const def = CARD_DEFS[cardId];
    return def && !def.unlocked;
  });
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
   START
   ═══════════════════════════════════════════════════════════ */

resetCampaign();
showStartScreen();
