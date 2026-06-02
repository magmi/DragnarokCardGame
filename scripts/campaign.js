/* ═══════════════════════════════════════════════════════════
   CAMPAIGN & MAP
   ═══════════════════════════════════════════════════════════ */

function showStartScreen() {
  renderMap();
  document.getElementById('map-overlay').classList.add('show');
  if (!localStorage.getItem('tutorial_seen')) {
    showTutorial();
  }
  setTimeout(scrollToActiveNode, 0);
}

function scrollToActiveNode() {
  const mapList = document.getElementById('map-list');
  if (!mapList) return;
  const activeNodes = mapList.querySelectorAll('.map-node.unlocked, .encounter-node.available');
  if (activeNodes.length > 0) {
    activeNodes[activeNodes.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function hideStartScreen() {
  document.getElementById('map-overlay').classList.remove('show');
}

function startGame() {
  startSelectedEnemy();
}

function rollRunEnemies() {
  return ENEMY_STAGES.map(stage => stage[Math.floor(Math.random() * stage.length)]);
}

function resetCampaign() {
  document.getElementById('end-turn-btn').disabled = false;
  ENEMIES = rollRunEnemies();
  campaignProgress = ENEMIES.map((enemy, index) => ({
    id: enemy.id,
    unlocked: index === 0,
    beaten: false,
  }));

  selectedEnemyIndex = 0;

  gs = {
    player: {
      hp: getPlayerMaxHp(), 
      maxHp: getPlayerMaxHp(),
      block: 0,
      nextAttackMultiplier: 1,
      repelNextAttack: 0,
      vulnerable: 0,
      weak: 0 },
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
  resetEncounters();
  hideUnlockOverlay();
  renderMap();
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

function renderMap() {
  renderMapPlayerHeader();

  const mapList = document.getElementById('map-list');
  if (!mapList) return;

  mapList.innerHTML = '';

  ENEMIES.forEach((enemy, index) => {
    const progress = campaignProgress[index];

    if (index > 0) {
      const makeArrow = (lit) => {
        const arrow = document.createElement('span');
        arrow.className = 'map-arrow material-symbols-outlined';
        arrow.style.opacity = lit ? '1' : '0.3';
        arrow.innerHTML = 'arrow_downward';
        return arrow;
      };

      // Encounter slot sits in the gap between enemy (index - 1) and enemy index.
      const encounterNode = renderEncounterNode(index - 1);
      if (encounterNode) {
        // Arrow into the encounter lights up once the previous enemy is cleared.
        mapList.appendChild(makeArrow(!!campaignProgress[index - 1]?.beaten));
        mapList.appendChild(encounterNode);
        // Arrow into the enemy lights up once that enemy unlocks (encounter resolved).
        mapList.appendChild(makeArrow(progress.unlocked));
      } else {
        mapList.appendChild(makeArrow(progress.unlocked));
      }
    }

    const node = document.createElement('button');
    node.type = 'button';
    node.className = `map-node ${progress.unlocked ? 'unlocked' : 'locked'}${progress.unlocked && index === selectedEnemyIndex ? ' selected' : ''}`;
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
      // The next enemy stays locked until the encounter in the gap is resolved.
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
