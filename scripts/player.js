/* ═══════════════════════════════════════════════════════════
   PLAYER PROGRESS
   ═══════════════════════════════════════════════════════════ */

let playerLevel = 1;
let playerExp = 0;
let playerAttackBonus = 0;
let playerMaxHpBonus = 0;
let playerMaxLevelReached = 1;

function loadPlayerProgress() {
  const saved = null; //localStorage.getItem('player_data');
  if (saved) {
    const data = JSON.parse(saved);
    playerLevel = data.level ?? 1;
    playerExp = data.exp ?? 0;
    playerAttackBonus = data.attackBonus ?? 0;
    playerMaxHpBonus = data.maxHpBonus ?? 0;
    playerMaxLevelReached = data.maxLevelReached ?? playerLevel;
  }
}

function savePlayerProgress() {
  /*localStorage.setItem('player_data', JSON.stringify({
    level: playerLevel, exp: playerExp,
    attackBonus: playerAttackBonus, maxHpBonus: playerMaxHpBonus,
    maxLevelReached: playerMaxLevelReached,
  }));*/
}

function getPlayerMaxHp() {
  return PLAYER_MAX_HP + playerMaxHpBonus;
}

function buildExpSteps(gained) {
  const maxLevel = LEVEL_THRESHOLDS.length + 1;
  const steps = [];
  let tempLevel = playerLevel;
  let tempExp = playerExp;
  let remaining = gained;

  while (remaining > 0 && tempLevel < maxLevel) {
    const threshold = LEVEL_THRESHOLDS[tempLevel - 1];
    const space = threshold - tempExp;
    if (remaining >= space) {
      steps.push({ level: tempLevel, fromExp: tempExp, toExp: threshold, threshold, levelUpAfter: true });
      remaining -= space;
      tempLevel++;
      tempExp = 0;
    } else {
      steps.push({ level: tempLevel, fromExp: tempExp, toExp: tempExp + remaining, threshold, levelUpAfter: false });
      remaining = 0;
    }
  }

  return steps;
}

function startExpAnimation() {
  const gained = runExpEarned;
  const section = document.getElementById('go-exp-section');
  if (!section) return;

  const maxLevel = LEVEL_THRESHOLDS.length + 1;
  if (gained === 0 || playerLevel >= maxLevel) { section.style.display = 'none'; return; }

  const steps = buildExpSteps(gained);
  if (steps.length === 0) { section.style.display = 'none'; return; }

  // Count level-ups and apply all bonuses upfront
  const levelsGained = steps.filter(s => s.levelUpAfter).length;
  let tempLevel = playerLevel;
  let tempExp = playerExp + gained;
  while (tempLevel - 1 < LEVEL_THRESHOLDS.length && tempExp >= LEVEL_THRESHOLDS[tempLevel - 1]) {
    tempExp -= LEVEL_THRESHOLDS[tempLevel - 1];
    tempLevel++;
  }
  if (tempLevel >= maxLevel) tempExp = 0;
  playerLevel = tempLevel;
  playerExp = tempExp;
  playerAttackBonus += levelsGained * LEVELUP_ATK_BONUS;
  playerMaxHpBonus += levelsGained * LEVELUP_HP_BONUS;
  if (playerLevel > playerMaxLevelReached) playerMaxLevelReached = playerLevel;
  savePlayerProgress();
  renderPlayerLevel();

  section.style.display = 'block';
  document.getElementById('go-exp-gained').textContent = `+${gained} EXP`;

  const lvlLabel = document.getElementById('go-exp-lvl-label');
  const barFill = document.getElementById('go-exp-bar-fill');
  const lvlupMsg = document.getElementById('go-lvlup-msg');
  const upgradeInfo = document.getElementById('go-upgrade-info');
  lvlupMsg.textContent = '';
  lvlupMsg.classList.remove('show');
  upgradeInfo.textContent = '';
  upgradeInfo.classList.remove('show');

  let stepIndex = 0;
  let levelsUpSoFar = 0;

  function runStep() {
    if (stepIndex >= steps.length) return;
    const step = steps[stepIndex];
    const pctFrom = (step.fromExp / step.threshold) * 100;
    const pctTo = (step.toExp / step.threshold) * 100;
    const fillDuration = Math.max(0.5, ((pctTo - pctFrom) / 100) * 1.5);

    lvlLabel.textContent = `LVL ${step.level}`;
    barFill.style.transition = 'none';
    barFill.style.width = pctFrom + '%';

    requestAnimationFrame(() => requestAnimationFrame(() => {
      barFill.style.transition = `width ${fillDuration}s ease`;
      barFill.style.width = pctTo + '%';

      if (step.levelUpAfter) {
        setTimeout(() => {
          levelsUpSoFar++;
          lvlupMsg.textContent = 'LEVEL UP!';
          lvlupMsg.classList.add('show');
          upgradeInfo.textContent = `+${LEVELUP_ATK_BONUS * levelsUpSoFar} ATK   +${LEVELUP_HP_BONUS * levelsUpSoFar} MAX HP`;
          upgradeInfo.classList.add('show');
          setTimeout(() => {
            barFill.style.transition = 'none';
            barFill.style.width = '0%';
            stepIndex++;
            setTimeout(runStep, 200);
          }, 900);
        }, fillDuration * 1000 + 100);
      } else {
        stepIndex++;
      }
    }));
  }

  runStep();
}

function renderPlayerLevel() {
  const badge = document.getElementById('player-level-badge');
  const expText = document.getElementById('player-exp-text');
  if (!badge || !expText) return;

  badge.textContent = `${playerLevel}`;

  const maxLevel = LEVEL_THRESHOLDS.length + 1;
  if (playerLevel >= maxLevel) {
    expText.textContent = 'MAX';
  } else {
    expText.textContent = `${playerExp} / ${LEVEL_THRESHOLDS[playerLevel - 1]} EXP`;
  }
}

loadPlayerProgress();
