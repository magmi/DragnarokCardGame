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
    player: { hp: preservedHp, maxHp, block: 0, nextAttackMultiplier: 1, repelNextAttack: 0, vulnerable: 0, weak: 0, strength: 0 },
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
  const enemy = {
    ...template,
    hp: template.maxHp,
    block: 0,
    moveIndex: 0,
    vulnerable: 0,
    burn: 0,
    weak: 0,
    strength: 0
  };
  enemy.intent = pickIntent(enemy);
  return enemy;
}

function awardEnemyUnlocks(stageIndex) {
  return (UNLOCKS_STAGES[stageIndex] || []).filter(cardId => {
    const def = CARD_DEFS[cardId];
    return def && !def.unlocked;
  });
}

function pickIntent(enemy) {
  let move;
  if (Array.isArray(enemy.path) && enemy.path.length > 0) {
    const moveId = enemy.path[(enemy.moveIndex || 0) % enemy.path.length];
    move = enemy.attacks.find(a => a.id === moveId);
  }
  if (!move) {
    move = enemy.attacks[Math.floor(Math.random() * enemy.attacks.length)];
  }
  let icon;
  if (move.type === 'attack') {
    icon = '<span style="color:#e05020" class="material-symbols-outlined">swords</span>';
  } else if (move.type === 'special') {
    icon = '<span style="color:#c77dff" class="material-symbols-outlined">cyclone</span>';
  } else {
    icon = '<span style="color:#5ba3f5" class="material-symbols-outlined">shield</span>';
  }

  return {
    type: move.type,
    name: move.name,
    value: move.value || 0,
    vulnerable: move.vulnerable || 0,
    weak: move.weak || 0,
    strength: move.strength || 0,
    weakenStrength: move.weakenStrength || 0,
    icon,
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
