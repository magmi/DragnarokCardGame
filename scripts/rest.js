/* ═══════════════════════════════════════════════════════════
   REST SITES
   ═══════════════════════════════════════════════════════════ */

const REST_HEAL_FRACTION = 0.5; // heals 50% of max HP

let restProgress = [];

function resetRestSites() {
  restProgress = ENEMIES.slice(1).map(() => ({ used: false }));
}

function isRestAvailable(gapIndex) {
  return !!campaignProgress[gapIndex]?.beaten && !isGapDecided(gapIndex);
}

function useRestSite(gapIndex) {
  if (!isRestAvailable(gapIndex) || !gs?.player) return;

  const maxHp = getPlayerMaxHp();
  gs.player.maxHp = maxHp;
  const heal = Math.round(maxHp * REST_HEAL_FRACTION);
  const healed = Math.min(maxHp, gs.player.hp + heal) - gs.player.hp;
  gs.player.hp += healed;

  restProgress[gapIndex].used = true;

  const nextEnemyIndex = gapIndex + 1;
  if (campaignProgress[nextEnemyIndex]) {
    campaignProgress[nextEnemyIndex].unlocked = true;
    selectedEnemyIndex = nextEnemyIndex;
  }

  renderMap();
  if (healed > 0) showFloatNum('#map-player-header', `+${healed} HP`, '#66bb6a');
  scrollToActiveNode();
}

function renderRestNode(gapIndex) {
  if (gapIndex < 0 || gapIndex >= restProgress.length) return null;

  const used = restProgress[gapIndex].used;
  const available = isRestAvailable(gapIndex);
  
  const skipped = !used && isGapDecided(gapIndex);
  const state = used ? 'used' : skipped ? 'skipped' : available ? 'available' : 'locked';

  const node = document.createElement('button');
  node.type = 'button';
  node.className = `rest-node ${state}`;
  node.disabled = !available;

  const pct = Math.round(REST_HEAL_FRACTION * 100);
  const icon = used ? 'check' : skipped ? 'block' : 'bedtime';
  const label = used ? 'Rested' : skipped ? 'Skipped' : available ? `Rest · +${pct}% HP` : 'Locked';
  node.innerHTML = `
    <span class="rest-node-icon material-symbols-outlined">${icon}</span>
    <span class="rest-node-label">${label}</span>
  `;

  if (available) node.addEventListener('click', () => useRestSite(gapIndex));
  return node;
}
