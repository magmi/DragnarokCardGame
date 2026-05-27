let tutorialStep = 0;

function showTutorial() {
  tutorialStep = 0;
  renderTutorialSlide();
  document.getElementById('tutorial-overlay').classList.add('show');
}

function hideTutorial() {
  document.getElementById('tutorial-overlay').classList.remove('show');
}

function dismissTutorial() {
  localStorage.setItem('tutorial_seen', '1');
  hideTutorial();
}

function tutorialNav(dir) {
  const total = document.querySelectorAll('.tutorial-slide').length;
  tutorialStep = Math.max(0, Math.min(total - 1, tutorialStep + dir));
  renderTutorialSlide();
}

function renderTutorialSlide() {
  const slides = document.querySelectorAll('.tutorial-slide');
  const isLast = tutorialStep === slides.length - 1;

  slides.forEach((s, i) => s.classList.toggle('active', i === tutorialStep));
  document.querySelectorAll('.tutorial-dot').forEach((d, i) => d.classList.toggle('active', i === tutorialStep));

  document.getElementById('tutorial-prev').style.visibility = tutorialStep === 0 ? 'hidden' : 'visible';
  document.getElementById('tutorial-next').style.visibility = isLast ? 'hidden' : 'visible';
  document.getElementById('tutorial-got-it').style.visibility = isLast ? 'visible' : 'hidden';
}
