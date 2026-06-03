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
      const damage = (def.value + playerAttackBonus) * gs.player.nextAttackMultiplier;
      if (gs.player.nextAttackMultiplier > 1) {
        gs.player.nextAttackMultiplier = 1;
        showFloatNum('#player-panel', 'Attack Doubled!', '#ffd166');
      }
      applyAttack('player', gs.enemy, '#enemy-panel', damage);

      if (def.burn > 0) {
        gs.enemy.burn = def.burn;
      }
      if (def.vulnerable > 0) {
        gs.enemy.vulnerable = def.vulnerable;
      }
      if (def.weak > 0) {
        gs.enemy.weak = def.weak;
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

// `source` is who is attacking: 'player' or 'enemy' (or null for non-attack
// damage like burn, which has no attacker).
function applyAttack(source, target, paneId, damage) {
  // Vulnerable amplifies the incoming hit BEFORE block absorbs it, so the
  // bonus damage isn't swallowed by block.
  let incoming = damage;

  if (target.vulnerable > 0) {
    incoming = Math.round(incoming * VULNERABLE_MULTIPLIER);
  }

  // Weak reduces the attacker's damage. `source` is the string 'player'/'enemy'
  // (or null for burn), so resolve it to the actual combatant first.
  const attacker = source === 'player' ? gs.player : source === 'enemy' ? gs.enemy : null;
  if (attacker && attacker.weak > 0) {
    incoming = Math.round(incoming * WEAK_MULTIPLIER);
  }

  const absorbed = Math.min(target.block, incoming);
  target.block -= absorbed;
  const dealt = incoming - absorbed;

  target.hp = Math.max(0, target.hp - dealt);

  if (dealt > 0) {
    showFloatNum(paneId, `-${dealt} HP`, '#ff6040');
    shakeEl(paneId);
  } else {
    showFloatNum(paneId, 'Blocked', '#5ba3f5');
  }

  // Repel only reflects when the enemy is the one attacking the player.
  if (source === 'enemy' && gs.player.repelNextAttack > 0) {
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
  if (gs.player.vulnerable > 0) gs.player.vulnerable -= 1;
  if (gs.player.weak > 0) gs.player.weak -= 1;

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
    applyAttack(null, gs.enemy, '#enemy-panel', gs.enemy.burn); // burn has no attacker
    gs.enemy.burn -= 1;
  }
  if (gs.enemy.vulnerable > 0) {
    gs.enemy.vulnerable -= 1;
  }
  if (gs.enemy.weak > 0) {
    gs.enemy.weak -= 1;
  }

  if (gs.enemy.hp <= 0) { renderAll(); handleEnemyDefeated(); return; }

  const { intent } = gs.enemy;

  if (intent.type === 'attack') {
    applyAttack('enemy', gs.player, '#player-panel', intent.value + gs.enemy.strength);
  } else if (intent.type === 'special') {
    if (intent.weak > 0) {
      gs.player.weak += intent.weak;
      showFloatNum('#player-panel', `Weak ${intent.weak}`, '#c77dff');
    }
    if (intent.vulnerable > 0) {
      gs.player.vulnerable += intent.vulnerable;
      showFloatNum('#player-panel', `Vulnerable ${intent.vulnerable}`, '#c77dff');
    }
    if (intent.strength > 0) {
      gs.enemy.strength += intent.strength;
      showFloatNum('#enemy-panel', `Strength +${intent.strength}`, '#ffb38a');
    }
  } else {
    gs.enemy.block += intent.value;
    showFloatNum('#enemy-panel', `+${intent.value} Block`, '#5ba3f5');
  }

  renderAll();
  if (gs.player.hp <= 0) { endGame(false); return; }
  if (gs.enemy.hp <= 0) { handleEnemyDefeated(); return; }

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
  const levelInfo = document.getElementById('go-level-info');
  const expSection = document.getElementById('go-exp-section');
  const img = document.getElementById('go-img');

  if (levelInfo) {
    const maxLevel = LEVEL_THRESHOLDS.length + 1;
    levelInfo.textContent = playerLevel >= maxLevel ? 'MAX LVL REACHED' : '';
  }

  if (won) {
    img.src = 'resources/ui/gameWon.png';
    title.textContent = 'Victory!';
    title.className = 'win';
    sub.textContent = 'Kera has fallen. Play again?';
    if (expSection) expSection.style.display = 'none';
    setTimeout(() => overlay.classList.add('show'), 600);
  } else {
    img.src = 'resources/ui/gameOver.png';
    title.textContent = 'Defeated';
    title.className = 'lose';
    sub.textContent = 'Game over. Play again?';
    setTimeout(() => {
      overlay.classList.add('show');
      setTimeout(startExpAnimation, 400);
    }, 600);
  }
}
