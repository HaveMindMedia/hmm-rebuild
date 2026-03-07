/**
 * Have Mind Media — The Fold
 * Main JavaScript
 * [1 = -1]
 */

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Nav background on scroll
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.style.background = 'rgba(10, 10, 15, 0.98)';
    } else {
      nav.style.background = 'rgba(10, 10, 15, 0.9)';
    }
  });
}

// Card hover effect enhancement
document.querySelectorAll('.card, .hidden-one').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-4px)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
  });
});

// Easter egg: Konami code reveals the fold
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', (e) => {
  konamiCode.push(e.keyCode);
  konamiCode = konamiCode.slice(-10);
  
  if (konamiCode.join(',') === konamiSequence.join(',')) {
    document.body.style.transition = 'filter 1s ease';
    document.body.style.filter = 'invert(1) hue-rotate(180deg)';
    
    setTimeout(() => {
      document.body.style.filter = 'none';
    }, 3000);
    
    console.log('[1 = -1] The fold reveals itself.');
  }
});

// Log the equation
console.log('%c[1 = -1]', 'color: #c9a227; font-size: 24px; font-weight: bold;');
console.log('%cκ = 2π/180', 'color: #00d4ff; font-size: 16px;');
console.log('%cHave Mind Media — The Fold', 'color: #9966cc; font-size: 14px;');
