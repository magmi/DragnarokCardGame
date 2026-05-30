/* ═══════════════════════════════════════════════════════════
   OVERLAYS
   ═══════════════════════════════════════════════════════════ */

function showUnlockRewardOverlay(candidateIds, buttonText, onCloseAction) {
  const copy = document.getElementById('unlock-overlay-copy');
  const cta = document.getElementById('unlock-overlay-cta');
  const container = document.getElementById('unlock-cards-display');
  container.innerHTML = '';

  pendingUnlockSelection = null;

  if (candidateIds.length === 0) {
    copy.textContent = 'No new cards available.';
    const message = document.createElement('div');
    message.className = 'unlock-empty';
    message.textContent = 'You can return to the map to continue your journey.';
    container.appendChild(message);
    if (cta) cta.disabled = false;
  } else {
    copy.textContent = 'Choose one card to add to your deck!';
    if (cta) cta.disabled = true;

    candidateIds.forEach(cardId => {
      const def = CARD_DEFS[cardId];
      if (!def) return;

      const artHtml = `<img src="${def.img}" alt="${def.name}" class="card-art-img">`;
      const orbsHtml = Array.from({ length: def.cost }, () => `<div class="card-orb"></div>`).join('');

      const card = document.createElement('div');
      card.className = `card ${def.type} selectable`;
      card.innerHTML = `
        <div class="card-art">${artHtml}</div>
        <div class="card-name">${def.name}</div>
        <div class="card-divider"></div>
        <div class="card-desc">${def.desc}</div>
        <div class="card-orbs">${orbsHtml}</div>
      `;
      card.addEventListener('click', () => {
        container.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        pendingUnlockSelection = cardId;
        if (cta) cta.disabled = false;
      });
      container.appendChild(card);
    });
  }

  if (cta) cta.textContent = buttonText || 'Continue';
  rewardOverlayNextAction = typeof onCloseAction === 'function' ? onCloseAction : null;
  document.getElementById('unlock-overlay').classList.add('show');
}

function closeUnlockRewardOverlay() {
  document.getElementById('unlock-overlay').classList.remove('show');
  if (pendingUnlockSelection) {
    const cardId = pendingUnlockSelection;
    pendingUnlockSelection = null;
    CARD_DEFS[cardId].unlocked = true;
    if (!playerDeck.includes(cardId)) playerDeck.push(cardId);
  }
  if (rewardOverlayNextAction) {
    const callback = rewardOverlayNextAction;
    rewardOverlayNextAction = null;
    callback();
  }
}

function hideUnlockOverlay() {
  document.getElementById('unlock-overlay').classList.remove('show');
  rewardOverlayNextAction = null;
  pendingUnlockSelection = null;
}

function returnToMapAfterVictory() {
  closeUnlockRewardOverlay();
}

function returnToEndgameAfterVictory() {
  closeUnlockRewardOverlay();
  endGame(true);
}

function showHowTo() {
  document.getElementById('howto-overlay').classList.add('show');
}

function hideHowTo() {
  document.getElementById('howto-overlay').classList.remove('show');
}

function showUnlockedDeck() {
  const container = document.getElementById('unlocked-deck-display');
  const unlockedIds = Object.values(CARD_DEFS).filter(d => d.unlocked).map(d => d.id);
  renderCards(container, unlockedIds, 'No unlocked cards available.');

  const overlay = document.getElementById('unlocked-deck-overlay');
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('show');
}

function hideUnlockedDeck() {
  const overlay = document.getElementById('unlocked-deck-overlay');
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
}

function showDiscardPile() {
  if (!gs) return;
  const container = document.getElementById('discard-pile-display');
  renderCards(container, gs.discard, 'No cards have been discarded yet.');

  const overlay = document.getElementById('discard-pile-overlay');
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('show');
}

function hideDiscardPile() {
  const overlay = document.getElementById('discard-pile-overlay');
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
}

function showDrawPile() {
  if (!gs) return;
  const container = document.getElementById('draw-pile-display');
  renderCards(container, gs.draw, 'The draw pile is empty.');

  const overlay = document.getElementById('draw-pile-overlay');
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('show');
}

function hideDrawPile() {
  const overlay = document.getElementById('draw-pile-overlay');
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
}
