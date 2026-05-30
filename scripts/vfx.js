/* ═══════════════════════════════════════════════════════════
   VFX
   ═══════════════════════════════════════════════════════════ */

function showFloatNum(selector, text, color) {
  const target = document.querySelector(selector);
  const rect = target.getBoundingClientRect();

  const el = document.createElement('div');
  el.className = 'float-num';
  el.textContent = text;
  el.style.color = color;
  el.style.left = `${rect.left + rect.width / 2 - 25}px`;
  el.style.top = `${rect.top + rect.height / 3}px`;

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function shakeEl(selector) {
  const el = document.querySelector(selector);
  el.classList.remove('shaking');
  void el.offsetWidth;
  el.classList.add('shaking');
  setTimeout(() => el.classList.remove('shaking'), 500);
}

function showBanner(text, cb) {
  const banner = document.getElementById('phase-banner');
  document.getElementById('banner-text').textContent = text;
  banner.classList.add('show');

  setTimeout(() => {
    banner.classList.remove('show');
    if (cb) setTimeout(cb, 200);
  }, 900);
}

let _bannerBtnCb = null;

function showLevelCleared(btnLabel, cb) {
  const panel = document.getElementById('level-cleared-banner');
  const btn = document.getElementById('banner-btn');
  btn.textContent = btnLabel;
  _bannerBtnCb = cb;
  panel.classList.add('show');
}

function onBannerBtnClick() {
  const panel = document.getElementById('level-cleared-banner');
  panel.classList.remove('show');
  const cb = _bannerBtnCb;
  _bannerBtnCb = null;
  if (cb) setTimeout(cb, 200);
}
