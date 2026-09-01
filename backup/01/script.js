/* ============================================================
   National Museum of Korea — Main Page
   script.js
   (main.js 진입점 역할. 추후 heroScrub.js / scrollAnimation.js /
    artifact3D.js 등으로 모듈 분리 예정 — 현재는 단일 파일로 통합)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initScrollReveal();
  initCategoryTags();
  initStoryNav();
});

/* ---------- Header: 스크롤 시 배경 전환 ---------- */
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const THRESHOLD = 60;
  let ticking = false;

  function update() {
    header.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}

/* ---------- Scroll Reveal: IntersectionObserver 공통 처리 ---------- */
function initScrollReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.18,
    rootMargin: '0px 0px -60px 0px'
  });

  targets.forEach(el => observer.observe(el));
}

/* ---------- Discover Our Legacy: 카테고리 태그 토글 ---------- */
function initCategoryTags() {
  const wrap = document.getElementById('categoryTags');
  if (!wrap) return;

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    wrap.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    // TODO: data.js 연동 시 선택된 카테고리에 맞춰 artifact-showcase 갱신
  });
}

/* ---------- Every Object Holds a Story: 좌우 화살표 (단일 슬라이드 자리표시) ---------- */
function initStoryNav() {
  const prev = document.getElementById('storyPrev');
  const next = document.getElementById('storyNext');
  if (!prev || !next) return;

  // TODO: data.js의 Masterpieces 배열이 준비되면 실제 슬라이드 전환 로직 연결
  [prev, next].forEach(btn => {
    btn.addEventListener('click', () => {
      const overlay = document.querySelector('.story-media__overlay');
      if (!overlay) return;
      overlay.style.transition = 'opacity .3s ease';
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.style.opacity = '1'; }, 300);
    });
  });
}
