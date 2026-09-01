/* ============================================================
   National Museum of Korea — Main Page
   script.js
   (main.js 진입점 역할. 추후 heroScrub.js / scrollAnimation.js /
    artifact3D.js 등으로 모듈 분리 예정 — 현재는 단일 파일로 통합)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeroScrub();
  initHeaderScroll();
  initScrollReveal();
  initCategoryTags();
  initStoryNav();
});

/* ---------- Header: 스크롤 시 배경 전환 ---------- */
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  const hero = document.getElementById('hero');
  if (!header) return;

  let ticking = false;

  function update() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    let threshold = 60;

    if (hero) {
      const rect = hero.getBoundingClientRect();
      const heroTop = rect.top + scrollTop;
      // The scroll point where Hero scrubbing ends and sticky state releases
      const heroEnd = heroTop + rect.height - window.innerHeight;
      threshold = Math.max(60, heroEnd);
    }

    header.classList.toggle('is-scrolled', scrollTop > threshold);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
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

/* ---------- Hero: 프레임 시퀀스 스크러빙 ---------- */
function initHeroScrub() {
  const wrapper = document.getElementById('hero');
  const canvas = document.getElementById('heroCanvas');
  if (!wrapper || !canvas) return;

  const ctx = canvas.getContext('2d');
  const frameCount = 120;
  const images = [];
  let loadedCount = 0;

  let targetFrame = 1;
  let currentFrame = 1;

  // 원본 이미지 해상도 (1280x720)
  const imgW = 1280;
  const imgH = 720;

  const pad = (num) => String(num).padStart(4, '0');
  const getFramePath = (idx) => `frames/frames/frame_${pad(idx)}.jpg`;

  // 첫 번째 프레임을 먼저 로드하고 즉시 렌더링하여 빈 화면 방지
  const firstImg = new Image();
  firstImg.src = getFramePath(1);
  firstImg.onload = () => {
    images[1] = firstImg;
    loadedCount++;
    drawFrame(1);

    // 나머지 프레임 순차 로드
    for (let i = 2; i <= frameCount; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        images[i] = img;
        loadedCount++;
      };
    }
  };

  function drawFrame(frameIndex) {
    const img = images[frameIndex];
    if (!img) return;

    const canvasW = canvas.width;
    const canvasH = canvas.height;

    ctx.clearRect(0, 0, canvasW, canvasH);

    const imgRatio = imgW / imgH;
    const canvasRatio = canvasW / canvasH;

    let drawW, drawH, drawX, drawY;

    if (canvasRatio > imgRatio) {
      // 캔버스 비율이 이미지 비율보다 가로로 넓은 경우 (가로에 맞춤)
      drawW = canvasW;
      drawH = canvasW / imgRatio;
      drawX = 0;
      drawY = (canvasH - drawH) / 2;
    } else {
      // 캔버스 비율이 이미지 비율보다 세로로 긴 경우 (세로에 맞춤)
      drawW = canvasH * imgRatio;
      drawH = canvasH;
      drawX = (canvasW - drawW) / 2;
      drawY = 0;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  // 리사이즈 대처
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawFrame(Math.round(currentFrame));
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas(); // 첫 설정

  // 스크롤 진행률 계산
  function updateScroll() {
    const rect = wrapper.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const wrapperTop = rect.top + scrollTop;
    const scrollRange = rect.height - window.innerHeight;

    let progress = (scrollTop - wrapperTop) / scrollRange;
    progress = Math.max(0, Math.min(1, progress));

    targetFrame = Math.round(progress * (frameCount - 1)) + 1;
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll(); // 첫 설정

  // requestAnimationFrame 루프
  function tick() {
    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.01) {
      currentFrame += diff * 0.09; // 부드러운 스크러빙 Lerp 적용 (감쇠 계수 0.09)
      drawFrame(Math.round(currentFrame));
    } else if (currentFrame !== targetFrame) {
      currentFrame = targetFrame;
      drawFrame(Math.round(currentFrame));
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
