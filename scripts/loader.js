/* ═══════════════════════════════════════════════════════════
   LOADING SCREEN
   Preloads image assets behind an opaque cover and drives a
   progress bar, so the game appears in one piece instead of
   popping in image-by-image.
   ═══════════════════════════════════════════════════════════ */

(function () {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;

  const bar = document.getElementById('loading-bar-fill');
  const percentText = document.getElementById('loading-percent');

  // Gather every image URL the game will need up front.
  const assets = new Set();
  const add = url => { if (url) assets.add(url); };

  [
    'resources/ui/DragnarokLogo.png',
    'resources/ui/map.jpg',
    'resources/ui/gameOver.png',
    'resources/ui/gameWon.png',
    'resources/ui/levelCleared.png',
    'resources/player/player.png',
  ].forEach(add);

  if (typeof CARD_DEFS !== 'undefined') {
    Object.values(CARD_DEFS).forEach(def => add(def.img));
  }
  if (typeof ENEMY_STAGES !== 'undefined') {
    ENEMY_STAGES.flat().forEach(enemy => { add(enemy.sprite); add(enemy.thumb); });
  }
  if (typeof ENCOUNTERS !== 'undefined') {
    ENCOUNTERS.forEach(enc => add(enc.img));
  }

  const urls = Array.from(assets);
  const total = urls.length;
  let loaded = 0;

  function update() {
    const percent = total === 0 ? 100 : Math.round((loaded / total) * 100);
    if (bar) bar.style.width = percent + '%';
    if (percentText) percentText.textContent = percent + '%';
  }

  function finish() {
    overlay.classList.add('loaded');
    setTimeout(() => overlay.remove(), 600); // remove after the fade-out
  }

  update();

  if (total === 0) { finish(); return; }

  const startTime = Date.now();
  const MIN_VISIBLE_MS = 400; // avoid a jarring instant flash on fast loads

  function countOne() {
    loaded++;
    update();
    if (loaded >= total) {
      const elapsed = Date.now() - startTime;
      setTimeout(finish, Math.max(0, MIN_VISIBLE_MS - elapsed));
    }
  }

  urls.forEach(url => {
    const img = new Image();
    img.onload = countOne;
    img.onerror = countOne; // count failures too so a missing file can't hang the bar
    img.src = url;
  });

  // Safety net: never trap the player behind the loader if something stalls.
  setTimeout(() => { if (loaded < total) finish(); }, 8000);
})();
