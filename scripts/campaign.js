/* ═══════════════════════════════════════════════════════════
   CAMPAIGN & MAP
   ═══════════════════════════════════════════════════════════ */

function showStartScreen() {
  renderMap();
  document.getElementById('map-overlay').classList.add('show');
  if (!localStorage.getItem('tutorial_seen')) {
    showTutorial();
  }
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

function resetCampaign() {
  document.getElementById('end-turn-btn').disabled = false;
  campaignProgress = ENEMIES.map((enemy, index) => ({
    id: enemy.id,
    unlocked: index === 0,
    beaten: false,
  }));

  selectedEnemyIndex = 0;

  gs = {
    player: { hp: getPlayerMaxHp(), maxHp: getPlayerMaxHp(), block: 0, nextAttackMultiplier: 1, repelNextAttack: 0 },
    currentEnemyIndex: selectedEnemyIndex,
    enemy: spawnEnemy(ENEMIES[selectedEnemyIndex]),
    energy: MAX_ENERGY,
    draw: shuffle(getDeckForBattle()),
    discard: [],
    hand: [],
    phase: 'player',
  };

  runExpEarned = 0;
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

    if (progress.unlocked) {
      node.innerHTML = `
      <div class="node-content">
        <img src="${enemy.thumb}" alt="${enemy.name}" class="node-sprite">
        <span class="node-label">Level ${index + 1}</span>
        <div class="card-divider"></div>
        <span class="node-name">${enemy.name}</span>
        <span class="node-status">${statusText}</span>
      </div>
    `;
    } else {
      node.innerHTML = `
      <div class="node-content">
        <div class="node-sprite-placeholder"></div>
        <span class="node-label">Level ${index + 1}</span>
        <div class="card-divider"></div>
        <span class="node-status">${statusText}</span>
      </div>
    `;
    }

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
  runExpEarned += ENEMIES[finishedIndex].expValue ?? 0;

  const unlockedCards = awardEnemyUnlocks(ENEMIES[finishedIndex]);
  const nextIndex = finishedIndex + 1;
  const hasNext = nextIndex < ENEMIES.length;

  setTimeout(() => {
    if (hasNext) {
      campaignProgress[nextIndex].unlocked = true;
      selectedEnemyIndex = nextIndex;
      renderMap();
      showLevelCleared('Continue', () => {
        showUnlockRewardOverlay(unlockedCards, 'Return to Map', () => {
          showStartScreen();
        });
      });
    } else {
      showLevelCleared('Continue', () => {
        showUnlockRewardOverlay(unlockedCards, 'Continue', () => {
          endGame(true);
        });
      });
    }
  }, 500);
}

function restartCampaign() {
  document.getElementById('gameover').classList.remove('show');
  resetCampaign();
  showStartScreen();
}
