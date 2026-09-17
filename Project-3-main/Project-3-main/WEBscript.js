// Mobile nav toggle
document.getElementById('navToggle').addEventListener('click', function () {
  document.getElementById('mainNav').classList.toggle('open');
});

let currentSlide = 0;
const totalSlides = 4;

function updateSlider() {
  const slides = document.querySelectorAll('.slide');
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === currentSlide);
  });

  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}

function moveSlide(direction) {
  currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
  updateSlider();
}

function goToSlide(index) {
  currentSlide = index;
  updateSlider();
}

// ===================================================== //
// LOADING SCREEN — hides once the page has fully loaded  //
// ===================================================== //
window.addEventListener('load', function () {
  const loader = document.getElementById('loadingScreen');
  if (loader) loader.classList.add('hidden');
});

// ===================================================== //
// DARK MODE TOGGLE — remembers the choice per browser    //
// ===================================================== //
const darkToggle = document.getElementById('darkToggle');
const storedTheme = localStorage.getItem('dlsjbc-theme');

if (storedTheme === 'dark') {
  document.body.classList.add('dark-mode');
  if (darkToggle) darkToggle.textContent = '☀️';
}

if (darkToggle) {
  darkToggle.addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('dlsjbc-theme', isDark ? 'dark' : 'light');
    darkToggle.textContent = isDark ? '☀️' : '🌙';
  });
}