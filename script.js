/* ============================================================
   National Museum of Korea — Main Page
   script.js
   (main.js 진입점 역할. 추후 heroScrub.js / scrollAnimation.js /
    artifact3D.js 등으로 모듈 분리 예정 — 현재는 단일 파일로 통합)
   ============================================================ */

// 새로고침 및 페이지 리로드 시 스크롤 위치 최상단 강제 초기화
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function resetScrollToTop() {
  window.scrollTo(0, 0);
}

// 브라우저의 자동 위치 복원을 선제 차단하고 스크롤 좌표 0으로 동기화
resetScrollToTop();
window.addEventListener('beforeunload', resetScrollToTop);
window.addEventListener('load', resetScrollToTop);
window.addEventListener('pageshow', resetScrollToTop);

document.addEventListener('DOMContentLoaded', () => {
  resetScrollToTop();
  initSplashScreen();
  initCustomCursor();
  initHeroScrub();
  initHeaderScroll();
  initScrollReveal();
  initCategoryTags();
  initStoryNav();
  initHeroQuickNavTilt();
  initSearchPulse();
  initMouseHighlight();
  initCinematicMuseumExperience();
  initSearchPopup();
  initHeritageSlider();
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

  const buttons = wrap.querySelectorAll('button');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });
}

/* ---------- Every Object Holds a Story: 좌우 화살표 (단일 슬라이드 자리표시) ---------- */
function initStoryNav() {
  const prev = document.getElementById('storyPrev');
  const next = document.getElementById('storyNext');
  const slides = document.getElementById('storySlides');
  if (!prev || !next || !slides) return;

  const overlay = document.querySelector('.story-media__overlay');
  const titleEl = overlay ? overlay.querySelector('h3') : null;
  const descEl = overlay ? overlay.querySelector('p') : null;

  const storyData = [
    {
      title: "The Masterpieces",
      description: "Timeless masterpieces shaped by skilled artisans. Discover the beauty of Korean heritage."
    },
    {
      title: "Immersed in Korean Heritage",
      description: "Step inside history through breathtaking digital art."
    },
    {
      title: "A Museum for Young Minds",
      description: "Where young visitors discover, learn, and experience Korean heritage."
    },
    {
      title: "A Walk Through Nature",
      description: "Discover peaceful moments around the museum’s gardens, pond, and hidden waterfall."
    },
    {
      title: "Tradition Reimagined",
      description: "Experience timeless Korean art through immersive technology."
    },
    {
      title: "Living with Heritage",
      description: "Experience the timeless beauty of Korean heritage in your own space."
    },
    {
      title: "Timeless Treasures",
      description: "Discover the stories and beauty preserved within Korea’s cultural heritage."
    }
  ];

  const totalSlides = storyData.length;
  let currentIndex = 0;

  if (titleEl && descEl) {
    titleEl.style.transition = 'opacity 0.2s ease';
    descEl.style.transition = 'opacity 0.2s ease';
  }

  function updateSlides(newIndex) {
    currentIndex = newIndex;
    slides.style.transform = `translateX(-${(currentIndex * 100) / totalSlides}%)`;

    if (titleEl && descEl) {
      titleEl.style.opacity = '0';
      descEl.style.opacity = '0';

      setTimeout(() => {
        titleEl.textContent = storyData[currentIndex].title;
        descEl.textContent = storyData[currentIndex].description;
        titleEl.style.opacity = '1';
        descEl.style.opacity = '1';
      }, 200);
    }
  }

  prev.addEventListener('click', () => {
    const nextIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateSlides(nextIndex);
  });

  next.addEventListener('click', () => {
    const nextIndex = (currentIndex + 1) % totalSlides;
    updateSlides(nextIndex);
  });
}

/* ---------- Hero: 프레임 시퀀스 스크러빙 ---------- */
function initHeroScrub() {
  const wrapper = document.getElementById('hero');
  const canvas = document.getElementById('heroCanvas');
  if (!wrapper || !canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.style.transition = 'opacity 0.35s cubic-bezier(0.19, 1, 0.22, 1)';

  // 3개 Hero 순환 리스트
  const heroList = ['baekje', 'bangasayusang', 'sillaCrown'];
  const STORAGE_KEY = 'nmHeroVariant';
  let variant = localStorage.getItem(STORAGE_KEY);

  // 새로고침 시 순차적 순환
  if (!variant) {
    variant = 'baekje';
  } else if (variant === 'baekje') {
    variant = 'bangasayusang';
  } else if (variant === 'bangasayusang') {
    variant = 'sillaCrown';
  } else {
    variant = 'baekje';
  }
  localStorage.setItem(STORAGE_KEY, variant);

  let currentHeroIndex = heroList.indexOf(variant);
  if (currentHeroIndex === -1) currentHeroIndex = 0;

  // 프레임 캐시 풀
  const frameCache = {
    baekje: [],
    bangasayusang: [],
    sillaCrown: []
  };

  // 각 Hero의 개별 설정
  const heroConfigs = {
    baekje: {
      path: "frames/frames",
      frameCount: 120,
      imgW: 1280,
      imgH: 720,
      text: {
        title: "The Scent of Baekje,<br>A Thousand Years in Time",
        kr: "백제금동대향로",
        caption: "Gilt-Bronze Incense Burner of Baekje"
      }
    },
    bangasayusang: {
      path: "frames/frames_2",
      frameCount: 120,
      imgW: 1920,
      imgH: 1080,
      text: {
        title: "Lost in Thought,<br>Beyond a Thousand Years",
        kr: "반가사유상",
        caption: "Pensive Bodhisattva"
      }
    },
    sillaCrown: {
      path: "frames/frames_3",
      frameCount: 120,
      imgW: 1920,
      imgH: 1080,
      text: {
        title: "Golden Radiance of Silla,<br>A Thousand Years in Time",
        kr: "신라 금관",
        caption: "Gold Crown of Silla"
      }
    }
  };

  let targetFrame = 1;
  let currentFrame = 1;
  let isTransitioning = false;

  // UI 텍스트 및 자산들 교체 함수
  function switchHeroUI(v) {
    const cfg = heroConfigs[v];
    if (!cfg) return;

    // Hero 텍스트 내용 동적 교체
    const heroTitleEl = document.querySelector('.hero-copy__title');
    const heroKrEl = document.querySelector('.hero-copy__kr');
    const heroCaptionEl = document.querySelector('.hero-copy__caption');

    if (heroTitleEl && heroKrEl && heroCaptionEl && cfg.text) {
      heroTitleEl.innerHTML = cfg.text.title;
      heroKrEl.textContent = cfg.text.kr;
      heroCaptionEl.textContent = cfg.text.caption;
    }

    // Discover Our Legacy 메인 이미지 동적 교체
    const discoverImgEl = document.querySelector('.artifact-image');
    if (discoverImgEl) {
      if (v === 'baekje') {
        discoverImgEl.src = 'design/art_11.png';
        discoverImgEl.alt = 'Gilt-Bronze Incense Burner of Baekje';
      } else if (v === 'bangasayusang') {
        discoverImgEl.src = 'design/art_1.jpg';
        discoverImgEl.alt = 'Gilt-bronze Pensive Bodhisattva';
      } else {
        discoverImgEl.src = 'design/art_12.png';
        discoverImgEl.alt = 'Gold Crown of Silla';
      }
    }

    // Discover Our Legacy 우측 유물 정보 텍스트 동적 교체
    const discoverTitleEl = document.querySelector('.artifact-caption__title');
    const discoverMetaEl = document.querySelector('.artifact-caption__meta');
    if (discoverTitleEl && discoverMetaEl) {
      if (v === 'baekje') {
        discoverTitleEl.textContent = 'Gilt-bronze Incense Burner of Baekje';
        discoverMetaEl.textContent = 'Baekje Period, 6th Century';
      } else if (v === 'bangasayusang') {
        discoverTitleEl.textContent = 'Gilt-bronze Pensive Bodhisattva';
        discoverMetaEl.textContent = 'Three Kingdoms Period, 7th Century';
      } else {
        discoverTitleEl.textContent = 'Gold Crown of Silla';
        discoverMetaEl.textContent = 'Three Kingdoms Period, 5th-6th Century';
      }
    }

    // 03. Final CTA 및 Archive UI 리셋을 위한 setup content 트리거
    if (typeof setupArchiveContent === 'function') {
      lastVariant = null;
      setupArchiveContent(v);
    }
  }

  // 특정 Hero의 프레임 로딩 및 렌더링 함수
  const pad = (num) => String(num).padStart(4, '0');
  const getFramePath = (v, idx) => `${heroConfigs[v].path}/frame_${pad(idx)}.jpg`;

  function loadAndDrawHero(v, onFirstFrameLoaded) {
    const cache = frameCache[v];

    // 첫 번째 프레임이 이미 캐싱되어 있는 경우 즉시 그리기
    if (cache[1]) {
      drawFrame(1);
      if (onFirstFrameLoaded) onFirstFrameLoaded();
      preloadRemainingFrames(v);
      return;
    }

    const firstImg = new Image();
    firstImg.src = getFramePath(v, 1);
    firstImg.onload = () => {
      cache[1] = firstImg;
      drawFrame(1);
      if (onFirstFrameLoaded) onFirstFrameLoaded();
      preloadRemainingFrames(v);
    };
    firstImg.onerror = () => {
      console.warn(`[Hero Nav] Failed to load first image of ${v} at: ${firstImg.src}`);
    };
  }

  // 나머지 프레임들을 백그라운드 프리로드하는 함수
  function preloadRemainingFrames(v) {
    const cfg = heroConfigs[v];
    const cache = frameCache[v];
    const frameCount = cfg.frameCount;

    for (let i = 2; i <= frameCount; i++) {
      if (cache[i]) continue;
      const img = new Image();
      img.src = getFramePath(v, i);
      img.onload = () => {
        cache[i] = img;
      };
      img.onerror = () => {
        console.warn(`[Hero Nav] Failed to load image of ${v} at: ${img.src}`);
      };
    }
  }

  function drawFrame(frameIndex) {
    const cache = frameCache[variant];
    const img = cache[frameIndex];
    if (!img) return;

    const canvasW = canvas.width;
    const canvasH = canvas.height;
    ctx.clearRect(0, 0, canvasW, canvasH);

    const cfg = heroConfigs[variant];
    const imgRatio = cfg.imgW / cfg.imgH;
    const canvasRatio = canvasW / canvasH;

    let drawW, drawH, drawX, drawY;

    if (canvasRatio > imgRatio) {
      drawW = canvasW;
      drawH = canvasW / imgRatio;
      drawX = 0;
      drawY = (canvasH - drawH) / 2;
    } else {
      drawW = canvasH * imgRatio;
      drawH = canvasH;
      drawX = (canvasW - drawW) / 2;
      drawY = 0;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  // 리사이즈 대처
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const displayW = window.innerWidth;
    const displayH = window.innerHeight;

    canvas.style.width = displayW + 'px';
    canvas.style.height = displayH + 'px';

    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;

    drawFrame(Math.round(currentFrame));
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // 스크롤 계산
  function updateScroll() {
    if (isTransitioning) return;
    const rect = wrapper.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const wrapperTop = rect.top + scrollTop;
    const scrollRange = rect.height - window.innerHeight;

    let progress = (scrollTop - wrapperTop) / scrollRange;
    progress = Math.max(0, Math.min(1, progress));

    const cfg = heroConfigs[variant];
    targetFrame = Math.round(progress * (cfg.frameCount - 1)) + 1;
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // requestAnimationFrame 루프
  function tick() {
    const cfg = heroConfigs[variant];
    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.01) {
      currentFrame += diff * 0.09;
      drawFrame(Math.round(currentFrame));
    } else if (currentFrame !== targetFrame) {
      currentFrame = targetFrame;
      drawFrame(Math.round(currentFrame));
    }

    const currentProgress = (currentFrame - 1) / (cfg.frameCount - 1);
    if (typeof updateArchiveOverlay === 'function') {
      updateArchiveOverlay(currentProgress, variant);
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // 초기 1단계 기동 (baekje로 셋업)
  switchHeroUI(variant);
  loadAndDrawHero(variant);

  // ============================================================
  // HERO NAVIGATION CLICK HANDLERS (이전 / 다음 화살표 클릭)
  // ============================================================
  const prevBtn = document.getElementById('heroPrevBtn');
  const nextBtn = document.getElementById('heroNextBtn');

  function transitionHero(direction) {
    if (isTransitioning) return;
    isTransitioning = true;

    // 1. 스크롤 위치 초기화 (스무스하게 스크롤업 하여 자연스럽게 리셋)
    window.scrollTo({ top: 0, behavior: 'auto' });
    targetFrame = 1;
    currentFrame = 1;

    // 2. 아웃 페이드 아웃 시작
    canvas.style.opacity = 0;
    const heroCopyEl = document.querySelector('.hero-copy');
    if (heroCopyEl) {
      heroCopyEl.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
      heroCopyEl.style.opacity = 0;
      heroCopyEl.style.transform = 'translateY(-8px)';
    }

    // 3. 인덱스 계산
    if (direction === 'next') {
      currentHeroIndex = (currentHeroIndex + 1) % heroList.length;
    } else {
      currentHeroIndex = (currentHeroIndex - 1 + heroList.length) % heroList.length;
    }
    const nextVariant = heroList[currentHeroIndex];

    setTimeout(() => {
      // 4. Variant 교환 및 UI 업데이트
      variant = nextVariant;
      localStorage.setItem(STORAGE_KEY, variant);
      switchHeroUI(variant);

      // 5. 첫 번째 프레임 로드 및 렌더링
      loadAndDrawHero(variant, () => {
        // 6. 렌더 완료 후 인 페이드 인 시작
        canvas.style.opacity = 1;
        if (heroCopyEl) {
          heroCopyEl.style.opacity = 1;
          heroCopyEl.style.transform = 'translateY(0)';
        }
        // 7. 진행 상태 강제 업데이트
        updateScroll();
        isTransitioning = false;
      });
    }, 350); // CSS opacity 트랜지션 타임라인에 맞춤 (0.35초)
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      transitionHero('prev');
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      transitionHero('next');
    });
  }
}

/* ---------- Hero Quick Nav: 3D Tilt Effect ---------- */
function initHeroQuickNavTilt() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  const cards = document.querySelectorAll('.hero-quick-nav__item, .hero-quick-nav__video');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      const angleX = (yc - y) / 12; // max ~5deg
      const angleY = (x - xc) / 12; // max ~5deg
      card.style.transform = `perspective(800px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ---------- Search Bar/Button: Click Pulse Effect ---------- */
function initSearchPulse() {
  const targets = document.querySelectorAll('.hero-search__field, .legacy-search, button[aria-label="검색"]');
  targets.forEach(el => {
    el.addEventListener('click', () => {
      const svg = el.querySelector('svg');
      if (!svg) return;
      svg.classList.remove('click-pulse');
      void svg.offsetWidth; // trigger reflow
      svg.classList.add('click-pulse');
      setTimeout(() => {
        svg.classList.remove('click-pulse');
      }, 300);
    });
  });
}

/* ---------- Buttons/Cards: Mouse Spotlight (Highlight) Tracker ---------- */
function initMouseHighlight() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  const targets = document.querySelectorAll('.btn-outline-gold, .hero-quick-nav__item, .hero-quick-nav__video, .story-nav button, .story-search-icon, .hero-search__field');
  targets.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      btn.style.setProperty('--mouse-x', `${x}px`);
      btn.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ---------- Discover Cinematic Museum Experience: Reveal & Parallax ---------- */
function initCinematicMuseumExperience() {
  const sections = ['legacy', 'story', 'heritage', 'info'];

  // 1. IntersectionObserver 등록
  if ('IntersectionObserver' in window) {
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            el.classList.add('animate-active');
            observer.unobserve(el);
          }
        });
      }, {
        threshold: window.matchMedia('(max-width: 768px)').matches ? 0.05 : 0.15
      });
      observer.observe(el);
    });
  } else {
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('animate-active');
    });
  }

  // 2. Parallax 스크롤 리스너 (모바일에선 성능을 고려해 해제)
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (!isReduced && !isMobile) {
    window.addEventListener('scroll', () => {
      const viewHeight = window.innerHeight;

      sections.forEach(id => {
        const section = document.getElementById(id);
        if (!section) return;

        const rect = section.getBoundingClientRect();
        if (rect.top < viewHeight && rect.bottom > 0) {
          const totalScroll = rect.height + viewHeight;
          const scrolled = viewHeight - rect.top;
          const progress = scrolled / totalScroll; // 0.0 ~ 1.0
          const shift = (progress - 0.5);

          if (id === 'legacy') {
            const showcase = section.querySelector('.artifact-showcase');
            const content = section.querySelector('.legacy-grid > div:first-child');
            if (showcase) showcase.style.transform = `translateY(${shift * -36}px)`;
            if (content) content.style.transform = `translateY(${shift * -12}px)`;
          } else if (id === 'story') {
            const media = section.querySelector('.story-media');
            const head = section.querySelector('.story-head');
            if (media) media.style.transform = `translateY(${shift * -28}px)`;
            if (head) head.style.transform = `translateY(${shift * -8}px)`;
          } else if (id === 'heritage') {
            const img = section.querySelector('.heritage-image');
            const text = section.querySelector('.heritage-text');
            if (img) img.style.transform = `translateY(${shift * -32}px)`;
            if (text) text.style.transform = `translateY(${shift * -12}px)`;
          } else if (id === 'info') {
            const img = section.querySelector('.museum-building-image');
            const links = section.querySelector('.info-links');
            if (img) img.style.transform = `translateY(${shift * -34}px)`;
            if (links) links.style.transform = `translateY(${shift * -10}px)`;
          }
        }
      });
    }, { passive: true });
  }
}

/* ---------- Full Screen Search Popup & Interactive Map ---------- */
function initSearchPopup() {
  const popup = document.getElementById('searchPopup');
  const closeBtn = document.getElementById('searchPopupClose');
  const searchInput = document.getElementById('popupSearchInput');
  const searchList = document.getElementById('popupSearchList');
  const mapPin = document.getElementById('mapPin');
  const mapPinPulse = document.getElementById('mapPinPulse');
  const mapTooltip = document.getElementById('mapTooltip');
  const tooltipText = document.getElementById('tooltipText');

  if (!popup || !closeBtn || !searchInput || !searchList) return;

  // 유물 검색/매핑 데이터셋
  const artifactData = [
    {
      id: 'moon-jar',
      title: 'White Porcelain Moon Jar',
      meta: 'Joseon Dynasty',
      src: 'design/art_5.png',
      room: 'WHITE PORCELAIN GALLERY | 3F',
      pin: { x: 380, y: 150 }
    },
    {
      id: 'pensive-bodhisattva',
      title: 'Pensive Bodhisattva',
      meta: 'Three Kingdoms Period',
      src: 'design/art_1.jpg',
      room: 'ROOM OF QUIET CONTEMPLATION | 2F',
      pin: { x: 250, y: 150 }
    },
    {
      id: 'incense-burner',
      title: 'Gilt-Bronze Incense Burner',
      meta: 'Baekje Period',
      src: 'design/art_11.png',
      room: 'BAEKJE DAEHYANGNO HALL | 2F',
      pin: { x: 120, y: 150 }
    },
    {
      id: 'celadon-ewer',
      title: 'Celadon Ewer in Bamboo Shape',
      meta: 'Goryeo Dynasty',
      src: 'design/art_3.png',
      room: 'GORYEO CELADON GALLERY | 2F',
      pin: { x: 340, y: 65 }
    },
    {
      id: 'silla-crown',
      title: 'Gold Crown of Silla',
      meta: 'Three Kingdoms Period',
      src: 'design/art_12.png',
      room: 'SILLA GOLD GALLERY | 1F',
      pin: { x: 75, y: 65 }
    },
    {
      id: 'lacquerware-box',
      title: 'Lacquerware Mother of Pearl Box',
      meta: 'Joseon Dynasty',
      src: 'design/art_10.png',
      room: 'JOSEON LACQUERWARE HALL | 3F',
      pin: { x: 425, y: 232 }
    },
    {
      id: 'incense-burner-compact',
      title: 'Gilt-Bronze Incense Burner (Compact)',
      meta: 'Baekje Period',
      src: 'design/art_11.png',
      room: 'BAEKJE ANCIENT GALLERY | 2F',
      pin: { x: 155, y: 232 }
    }
  ];

  let activeArtifact = artifactData[1]; // Pensive Bodhisattva 디폴트 활성화

  // 팝업 열기
  function openPopup() {
    popup.classList.add('is-active');
    popup.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // 스크롤 잠금

    // 검색어 리셋 및 필터링 렌더링
    searchInput.value = '';
    renderList(artifactData);
    selectArtifact(activeArtifact.id);

    setTimeout(() => {
      searchInput.focus();
    }, 100);
  }

  // 팝업 닫기
  function closePopup() {
    popup.classList.remove('is-active');
    popup.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // 스크롤 복구
  }

  // Hero 검색창 클릭 리스너 연결 (기존 폼 제출/동작 훼손 없이 트리거)
  const heroSearchInput = document.querySelector('.hero-search__field input');
  if (heroSearchInput) {
    heroSearchInput.addEventListener('focus', (e) => {
      e.preventDefault();
      heroSearchInput.blur();
      openPopup();
    });
  }

  // Close 리스너
  closeBtn.addEventListener('click', closePopup);
  popup.querySelector('.search-popup__backdrop').addEventListener('click', closePopup);

  // ESC 키 리스너
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('is-active')) {
      closePopup();
    }
  });

  // 리스트 렌더링
  function renderList(list) {
    searchList.innerHTML = '';
    if (!list.length) {
      searchList.innerHTML = '<p class="search-popup__label" style="text-align:center; margin-top:2rem;">No artifacts found</p>';
      return;
    }

    list.forEach(item => {
      const div = document.createElement('div');
      div.className = `search-item ${item.id === activeArtifact.id ? 'is-active' : ''}`;
      div.setAttribute('data-id', item.id);

      div.innerHTML = `
        <div class="search-item__thumb">
          <img src="${item.src}" alt="${item.title}">
        </div>
        <div class="search-item__info">
          <span class="search-item__meta">${item.meta}</span>
          <span class="search-item__title">${item.title}</span>
        </div>
      `;

      div.addEventListener('click', () => {
        selectArtifact(item.id);
      });

      searchList.appendChild(div);
    });
  }

  // 유물 선택 처리 (핀 이동 및 툴팁 갱신)
  function selectArtifact(id) {
    const selected = artifactData.find(item => item.id === id);
    if (!selected) return;

    activeArtifact = selected;

    // 좌측 리스트의 Active 클래스 갱신
    searchList.querySelectorAll('.search-item').forEach(el => {
      el.classList.toggle('is-active', el.getAttribute('data-id') === id);
    });

    // 우측 맵 룸 활성화 강조 갱신
    popup.querySelectorAll('.map-room').forEach(rm => {
      rm.classList.remove('is-active');
    });
    const targetRoom = popup.querySelector(`#room-${id}`);
    if (targetRoom) {
      targetRoom.classList.add('is-active');
    }

    // 우측 맵 핀 좌표 백분율 동기화 (반응형 완벽 지원)
    if (mapPin && mapPinPulse && mapTooltip && tooltipText) {
      mapPin.setAttribute('cx', selected.pin.x);
      mapPin.setAttribute('cy', selected.pin.y);
      mapPinPulse.setAttribute('cx', selected.pin.x);
      mapPinPulse.setAttribute('cy', selected.pin.y);

      // 툴팁 텍스트 갱신
      tooltipText.textContent = selected.room;

      // SVG 좌표계(500x300) 내 비율 계산 후 툴팁 배치
      const pctX = (selected.pin.x / 500) * 100;
      const pctY = (selected.pin.y / 300) * 100;
      mapTooltip.style.left = `${pctX}%`;
      mapTooltip.style.top = `${pctY}%`;
    }
  }

  // 검색어 실시간 필터링
  searchInput.addEventListener('input', () => {
    const val = searchInput.value.toLowerCase().trim();

    const filtered = artifactData.filter(item =>
      item.title.toLowerCase().includes(val) ||
      item.meta.toLowerCase().includes(val)
    );

    renderList(filtered);

    // 필터링된 첫 항목이 있다면 자동으로 활성화
    if (filtered.length) {
      const remainsActive = filtered.some(
        item => item.id === activeArtifact.id
      );

      if (!remainsActive) {
        selectArtifact(filtered[0].id);
      }
    }
  });
}

/* ============================================================
   INTERACTIVE MUSEUM ARCHIVE OVERLAY LOGIC
   ============================================================ */
const archiveConfigs = {
  baekje: {
    num: "01",
    era: "BAEKJE",
    century: "6TH CENTURY",
    markers: [
      { label: "PHOENIX", top: "32%", left: "28%" },
      { label: "MOUNTAIN-SHAPED LID", top: "54%", left: "70%" },
      { label: "LOTUS BASE", top: "68%", left: "25%" }
    ],
    finalTag: "01 / GOODS",
    finalText: "DISCOVER MU:DS",
    finalSupport: "Explore Korean heritage beyond the museum.",
    finalLink: "boutique.html"
  },
  bangasayusang: {
    num: "02",
    era: "THREE KINGDOMS PERIOD",
    century: "7TH CENTURY",
    markers: [
      { label: "PENSIVE POSE", top: "45%", left: "20%" },
      { label: "SERENE EXPRESSION", top: "25%", left: "68%" },
      { label: "FLOWING ROBE", top: "67%", left: "65%" }
    ],
    finalTag: "02 / ARTIFACT",
    finalText: "EXPLORE THE ARTIFACT",
    finalSupport: "Observe timeless thoughts transcending thousands of years.",
    finalLink: "artifact.html"
  },
  sillaCrown: {
    num: "03",
    era: "SILLA",
    century: "5TH–6TH CENTURY",
    markers: [
      { label: "TREE-SHAPED ORNAMENT", top: "28%", left: "30%" },
      { label: "JADE PENDANT", top: "58%", left: "72%" },
      { label: "GOLD DANGLE", top: "69%", left: "26%" }
    ],
    finalTag: "03 / EXHIBITION",
    finalText: "VIEW EXHIBITIONS",
    finalSupport: "Discover the golden glory and aesthetic of ancient Silla.",
    finalLink: "exhibitions.html"
  }
};

let lastVariant = null;

function setupArchiveContent(variant) {
  if (lastVariant === variant) return;
  lastVariant = variant;
  const cfg = archiveConfigs[variant];
  if (!cfg) return;

  // 01. Era
  const eraNum = document.getElementById('eraNum');
  const eraTitle = document.getElementById('eraTitle');
  const eraMeta = document.getElementById('eraMeta');
  if (eraNum) eraNum.textContent = cfg.num;
  if (eraTitle) eraTitle.textContent = cfg.era;
  if (eraMeta) eraMeta.textContent = cfg.century;

  // 02. Markers
  const m1 = document.getElementById('detailMarker1');
  const m2 = document.getElementById('detailMarker2');
  const m3 = document.getElementById('detailMarker3');
  const l1 = document.getElementById('detailLabel1');
  const l2 = document.getElementById('detailLabel2');
  const l3 = document.getElementById('detailLabel3');
  if (m1 && m2 && m3 && l1 && l2 && l3) {
    m1.style.top = cfg.markers[0].top;
    m1.style.left = cfg.markers[0].left;
    l1.textContent = cfg.markers[0].label;

    m2.style.top = cfg.markers[1].top;
    m2.style.left = cfg.markers[1].left;
    l2.textContent = cfg.markers[1].label;

    m3.style.top = cfg.markers[2].top;
    m3.style.left = cfg.markers[2].left;
    l3.textContent = cfg.markers[2].label;
  }

  // 03. Final CTA
  const fnlTag = document.getElementById('finalCtaTag');
  const fnlText = document.getElementById('finalCtaText');
  const fnlSupport = document.getElementById('finalCtaSupport');
  const fnlLink = document.getElementById('finalCtaLink');
  if (fnlTag) fnlTag.textContent = cfg.finalTag;
  if (fnlText) {
    fnlText.textContent = cfg.finalText;
    fnlText.setAttribute('data-text', cfg.finalText);
  }
  if (fnlSupport) fnlSupport.textContent = cfg.finalSupport;
  if (fnlLink) fnlLink.setAttribute('href', cfg.finalLink);
}

function updateArchiveOverlay(progress, variant) {
  setupArchiveContent(variant);

  // 기존 Hero 텍스트(.hero-copy) 스크롤 페이드 연동
  const heroCopyEl = document.querySelector('.hero-copy');
  if (heroCopyEl) {
    let textOpacity = 1;
    let textTranslateY = 0;

    if (progress <= 0.03) {
      textOpacity = 1;
      textTranslateY = 0;
    } else if (progress > 0.03 && progress <= 0.12) {
      const ratio = (progress - 0.03) / (0.12 - 0.03); // 0 -> 1
      textOpacity = 1 - ratio;
      textTranslateY = -8 * ratio;
    } else {
      textOpacity = 0;
      textTranslateY = -8;
    }

    heroCopyEl.style.opacity = textOpacity;
    heroCopyEl.style.transform = `translateY(${textTranslateY}px)`;
    heroCopyEl.style.transition = 'none'; // 스크롤 동적 반응에 영향 주는 transition 배제
  }

  const stepEra = document.getElementById('stepEra');
  const stepDetail = document.getElementById('stepDetail');
  const stepFinal = document.getElementById('stepFinal');

  if (!stepEra || !stepDetail || !stepFinal) return;

  // 1단계 (Era Info): 0.05 ~ 0.35
  const eraStart = 0.05, eraPeakStart = 0.12, eraPeakEnd = 0.28, eraEnd = 0.35;
  if (progress >= eraStart && progress < eraEnd) {
    stepEra.classList.add('is-active');
    stepEra.classList.remove('exit-active');
    // exit-active 처리
    if (progress > eraPeakEnd) {
      const outRatio = (progress - eraPeakEnd) / (eraEnd - eraPeakEnd);
      stepEra.style.opacity = 1 - outRatio;
      stepEra.style.transform = `translateY(${-6 * outRatio}px)`;
    } else if (progress < eraPeakStart) {
      const inRatio = (progress - eraStart) / (eraPeakStart - eraStart);
      stepEra.style.opacity = inRatio;
      stepEra.style.transform = `translateY(${8 * (1 - inRatio)}px)`;
    } else {
      stepEra.style.opacity = 1;
      stepEra.style.transform = `translateY(0)`;
    }
  } else {
    stepEra.style.opacity = 0;
    stepEra.classList.remove('is-active');
    if (progress >= eraEnd) {
      stepEra.classList.add('exit-active');
    } else {
      stepEra.classList.remove('exit-active');
    }
  }

  // 2단계 (Detail Markers): 0.32 ~ 0.68
  const detStart = 0.32, detPeakStart = 0.40, detPeakEnd = 0.58, detEnd = 0.68;
  if (progress >= detStart && progress < detEnd) {
    stepDetail.classList.add('is-active');
    stepDetail.classList.remove('exit-active');
    if (progress > detPeakEnd) {
      const outRatio = (progress - detPeakEnd) / (detEnd - detPeakEnd);
      stepDetail.style.opacity = 1 - outRatio;
      stepDetail.style.transform = `translateY(${-6 * outRatio}px)`;
    } else if (progress < detPeakStart) {
      const inRatio = (progress - detStart) / (detPeakStart - detStart);
      stepDetail.style.opacity = inRatio;
      stepDetail.style.transform = `translateY(${8 * (1 - inRatio)}px)`;
    } else {
      stepDetail.style.opacity = 1;
      stepDetail.style.transform = `translateY(0)`;
    }
  } else {
    stepDetail.style.opacity = 0;
    stepDetail.classList.remove('is-active');
    if (progress >= detEnd) {
      stepDetail.classList.add('exit-active');
    } else {
      stepDetail.classList.remove('exit-active');
    }
  }

  // 3단계 (Final CTA): 0.62 ~ 1.00 (사라지지 않음)
  const fnlStart = 0.62, fnlPeakStart = 0.70;

  // Hero 전체에 아주 약한 Cinematic Dark Overlay 적용 (0.62부터 서서히 어두워짐)
  const videoOverlay = document.querySelector('.hero-video-overlay');
  if (videoOverlay) {
    if (progress >= 0.62) {
      const darkRatio = Math.min(1, (progress - 0.62) / (0.72 - 0.62));
      videoOverlay.style.backgroundColor = `rgba(0, 0, 0, ${darkRatio * 0.22})`;
    } else {
      videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    }
  }

  if (progress >= fnlStart) {
    stepFinal.classList.add('is-active');
    stepFinal.classList.remove('exit-active');
    const fContainer = stepFinal.querySelector('.final-cta-container');
    if (progress < fnlPeakStart) {
      const inRatio = (progress - fnlStart) / (fnlPeakStart - fnlStart);
      stepFinal.style.opacity = inRatio;
      if (fContainer) {
        fContainer.style.transform = `translateY(${12 * (1 - inRatio)}px)`;
      }
    } else {
      stepFinal.style.opacity = 1;
      if (fContainer) {
        fContainer.style.transform = 'translateY(0)';
      }
    }
  } else {
    stepFinal.style.opacity = 0;
    stepFinal.classList.remove('is-active');
    stepFinal.classList.remove('exit-active');
    const fContainer = stepFinal.querySelector('.final-cta-container');
    if (fContainer) {
      fContainer.style.transform = '';
    }
  }

  // 4. Subtle Parallax
  if (stepEra.classList.contains('is-active') && progress <= eraPeakEnd) {
    const eraText = stepEra.querySelector('.step-era__info');
    const eraLine = stepEra.querySelector('.step-era__line-wrap');
    const eraNum = stepEra.querySelector('.step-era__num');

    if (eraText) {
      eraText.style.transform =
        `translateY(${(progress - eraStart) * 12}px)`;
    }

    if (eraLine) {
      eraLine.style.transform =
        `translateY(${(progress - eraStart) * 6}px)`;
    }

    if (eraNum) {
      eraNum.style.transform =
        `translateY(${(progress - eraStart) * 18}px)`;
    }
  }

  if (stepDetail.classList.contains('is-active') && progress <= detPeakEnd) {
    const m1 = document.getElementById('detailMarker1');
    const m2 = document.getElementById('detailMarker2');
    const expCta = document.getElementById('exploreCtaWrap');

    if (m1) {
      m1.style.transform =
        `translateY(${(progress - detStart) * 8}px)`;
    }

    if (m2) {
      m2.style.transform =
        `translateY(${(progress - detStart) * 14}px)`;
    }

    if (expCta) {
      expCta.style.transform =
        `translateY(${(progress - detStart) * -10}px)`;
    }
  }

  if (stepFinal.classList.contains('is-active')) {
    const fTag = document.getElementById('finalCtaTag');
    const fText = document.getElementById('finalCtaText');
    const fSup = document.getElementById('finalCtaSupport');

    if (fTag) fTag.style.transform = 'translateY(0)';
    if (fText) fText.style.transform = 'translateY(0)';
    if (fSup) fSup.style.transform = 'translateY(0)';
  }
}

// Page Transition and Premium CTA Effects handler
document.addEventListener('DOMContentLoaded', () => {
  const finalCtaLink = document.getElementById('finalCtaLink');
  const ctaContainer = document.querySelector('.final-cta-container');

  if (ctaContainer && finalCtaLink) {
    // 1. gold dust sparkle particles hover generator
    function createParticles() {
      // 이미 생성된 입자가 있으면 스킵
      if (ctaContainer.querySelector('.cta-particle')) return;

      const rect = finalCtaLink.getBoundingClientRect();
      const containerRect = ctaContainer.getBoundingClientRect();
      const relLeft = rect.left - containerRect.left;
      const relTop = rect.top - containerRect.top;

      const ctaCenterX = relLeft + rect.width / 2;
      const ctaCenterY = relTop + rect.height / 2;

      const goldColors = [
        '#dfb76c', // Warm Gold
        '#c9a15a', // Muted Gold
        '#ebd1a6', // Pale Gold
        '#fcfaf2', // Champagne Gold
        '#f5e6c4'  // Ivory Gold
      ];

      // Helper: 중심 편향 랜덤 좌표 생성 (최대 반경 450px * 300px 타원)
      function getBiasedCoords() {
        const r = Math.pow(Math.random(), 1.4); // 0~1 사이 값, 1.4 제곱으로 중심 밀집 유도
        const angle = Math.random() * Math.PI * 2;
        return {
          x: ctaCenterX + Math.cos(angle) * r * 225 - 2, // 반경 225px
          y: ctaCenterY + Math.sin(angle) * r * 150 - 2  // 반경 150px
        };
      }

      // Layer 1: 작고 어두운 Gold Dust (24개, 1px ~ 2px, 1.5s ~ 4s)
      for (let i = 0; i < 24; i++) {
        const p = document.createElement('div');
        p.className = 'cta-particle cta-particle--dust';
        p.style.width = `${Math.random() * 1.0 + 1}px`;
        p.style.height = p.style.width;

        const coords = getBiasedCoords();
        p.style.left = `${coords.x}px`;
        p.style.top = `${coords.y}px`;
        p.style.background = 'rgba(201, 161, 90, 0.35)';

        const dur = (Math.random() * 2.5 + 1.5).toFixed(2); // 1.5s ~ 4s
        const del = (Math.random() * -4.0).toFixed(2); // 고른 분사를 위한 음수 딜레이
        const animationName = Math.random() < 0.4 ? 'particleFloat' : 'particleTwinkle';
        p.style.animation = `${animationName} ${dur}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${del}s infinite`;
        ctaContainer.appendChild(p);
      }

      // Layer 2: 중간 밝기의 Gold Particle (16개, 3px ~ 5px, 1.5s ~ 4s)
      for (let i = 0; i < 16; i++) {
        const p = document.createElement('div');
        p.className = 'cta-particle cta-particle--gold';
        p.style.width = `${Math.random() * 2.0 + 3.0}px`;
        p.style.height = p.style.width;

        const coords = getBiasedCoords();
        p.style.left = `${coords.x}px`;
        p.style.top = `${coords.y}px`;
        p.style.background = goldColors[Math.floor(Math.random() * goldColors.length)];

        const dur = (Math.random() * 2.5 + 1.5).toFixed(2);
        const del = (Math.random() * -3.5).toFixed(2);
        const animationName = Math.random() < 0.35 ? 'particleFloat' : 'particleTwinkle';
        p.style.animation = `${animationName} ${dur}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${del}s infinite`;
        ctaContainer.appendChild(p);
      }

      // Layer 3: 밝은 4-point Star Sparkle (12개, 5px ~ 10px, 1.5s ~ 4s)
      for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'cta-particle cta-particle--star';
        const size = Math.floor(Math.random() * 6) + 5; // 5px ~ 10px
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;

        const coords = getBiasedCoords();
        p.style.left = `${coords.x}px`;
        p.style.top = `${coords.y}px`;
        p.style.background = goldColors[Math.floor(Math.random() * goldColors.length)];

        const dur = (Math.random() * 2.5 + 1.5).toFixed(2);
        const del = (Math.random() * -3.0).toFixed(2);
        p.style.animation = `particleTwinkle ${dur}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${del}s infinite`;
        ctaContainer.appendChild(p);
      }
    }

    function removeParticles() {
      const particles = ctaContainer.querySelectorAll('.cta-particle');
      particles.forEach(p => {
        p.classList.add('is-fading');
        p.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        p.style.opacity = '0';
        p.style.transform = 'scale(0.3)';
        setTimeout(() => p.remove(), 400);
      });
    }

    finalCtaLink.addEventListener('mouseenter', () => {
      createParticles();
    });

    finalCtaLink.addEventListener('mouseleave', () => {
      removeParticles();
    });

    // 2. Click Premium Transition Link Interaction
    finalCtaLink.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#' || href.startsWith('#')) return;

      e.preventDefault();

      // 입자들 짧게 플래시하며 확장되도록 유도
      const particles = ctaContainer.querySelectorAll('.cta-particle');
      particles.forEach(p => {
        p.style.animationPlayState = 'paused';
        p.style.transition = 'transform 0.45s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.45s ease, filter 0.45s ease';
        p.style.transform = 'scale(1.6)';
        p.style.filter = 'brightness(2.0) drop-shadow(0 0 6px rgba(255,215,0,0.6))';
        p.style.opacity = '0';
      });

      // CTA 전체 컨테이너 페이드 아웃
      ctaContainer.style.transition = 'opacity 0.4s ease';
      ctaContainer.style.opacity = '0';

      // 420ms 후 페이지 전환
      setTimeout(() => {
        window.location.href = href;
      }, 420);
    });
  }
});

/* ---------- Custom Mouse Cursor Implementation (delegated to cursor.js) ---------- */
// initCustomCursor는 cursor.js에서 공통 관리됩니다.

/* ---------- Section 03: Heritage Goods Slider ---------- */
function initHeritageSlider() {
  const imgEl = document.getElementById('heritageImage');
  const eyebrowEl = document.getElementById('heritageEyebrow');
  const descEl = document.getElementById('heritageDesc');
  const prevBtn = document.getElementById('heritagePrev');
  const nextBtn = document.getElementById('heritageNext');
  const textWrap = document.querySelector('#heritage .heritage-text');

  if (!imgEl || !prevBtn || !nextBtn) return;

  const items = [
    {
      src: 'design/art_3.png',
      alt: 'Heritage Ceramic Collection',
      eyebrow: 'Heritage Ceramic Collection',
      desc: 'Inspired by traditional Korean ceramics, this collection brings timeless forms and beauty into contemporary life.'
    },
    {
      src: 'design/good_6.png',
      alt: 'Heritage Ceramic Collection',
      eyebrow: 'Heritage Ceramic Collection',
      desc: 'Inspired by traditional Korean ceramics, this collection brings timeless forms and celadon beauty into contemporary life.'
    },
    {
      src: 'design/good_7.png',
      alt: 'Royal Stationery Edition',
      eyebrow: 'Royal Stationery Edition',
      desc: 'Refined desk accessories featuring intricate traditional motifs crafted with brass and gold leaf.'
    },
    {
      src: 'design/good_8.png',
      alt: 'Traditional Craft & Living',
      eyebrow: 'Traditional Craft & Living',
      desc: 'Handcrafted living objects blending ancient Korean craftsmanship with modern everyday elegance.'
    },
    {
      src: 'design/good_9.png',
      alt: 'National Treasure Keepsake',
      eyebrow: 'National Treasure Keepsake',
      desc: 'Exquisite miniature keepsakes capturing the eternal grace of Korea’s master artisan legacy.'
    },
    {
      src: 'design/good_10.png',
      alt: 'Heritage Pattern Series',
      eyebrow: 'Heritage Pattern Series',
      desc: 'Contemporary lifestyle accessories reinterpreting historical royal geometric patterns.'
    }
  ];

  let currentIndex = 0;
  let isTransitioning = false;

  function updateSlide(index) {
    if (isTransitioning) return;
    isTransitioning = true;

    const currentItem = items[index];

    imgEl.style.transition = 'opacity 0.25s cubic-bezier(0.19, 1, 0.22, 1), transform 0.25s cubic-bezier(0.19, 1, 0.22, 1)';
    imgEl.style.opacity = '0';
    imgEl.style.transform = 'scale(0.97) translateY(8px)';

    if (textWrap) {
      textWrap.style.transition = 'opacity 0.25s cubic-bezier(0.19, 1, 0.22, 1), transform 0.25s cubic-bezier(0.19, 1, 0.22, 1)';
      textWrap.style.opacity = '0';
      textWrap.style.transform = 'translateY(10px)';
    }

    setTimeout(() => {
      imgEl.src = currentItem.src;
      imgEl.alt = currentItem.alt;

      if (eyebrowEl) eyebrowEl.textContent = currentItem.eyebrow;
      if (descEl) descEl.textContent = currentItem.desc;

      imgEl.style.opacity = '1';
      imgEl.style.transform = 'scale(1) translateY(0)';

      if (textWrap) {
        textWrap.style.opacity = '1';
        textWrap.style.transform = 'translateY(0)';
      }

      setTimeout(() => {
        isTransitioning = false;
      }, 250);
    }, 250);
  }

  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    updateSlide(currentIndex);
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % items.length;
    updateSlide(currentIndex);
  });
}

/* ---------- Splash Loading Screen System ---------- */
function initSplashScreen() {
  const splashScreen = document.getElementById('splashScreen');
  const splashPercent = document.getElementById('splashPercent');
  const splashWavePath = document.getElementById('splashWavePath');
  const splashParticles = document.getElementById('splashParticles');
  const statueWrap = document.getElementById('splashStatueWrap');
  const splashLiquidLayer = document.getElementById('splashLiquidLayer');
  const imgSource = document.getElementById('splashImgSource');
  const splashWaveSvg = document.querySelector('.splash-wave-svg');

  if (!splashScreen || !splashWavePath || !imgSource) return;

  // Exact Body Solid Fill + Inner Triangle/Diamond Hole Subtraction Mask Generator
  // 반가사유상 몸체 (머리, 목, 어깨, 팔, 가슴, 몸통, 무릎, 다리, 받침) = SOLID GOLD FILL
  // 팔/가슴/다리 사이의 내부 빈 공간 (Negative Space Hole) = TRANSPARENT
  // 외부 배경 = TRANSPARENT
  function createSolidMask(img, callback) {
    const natW = img.naturalWidth || 240;
    const natH = img.naturalHeight || 340;
    const pad = 12;

    const canvasW = natW + pad * 2;
    const canvasH = natH + pad * 2;

    // 1. 원본 선화 렌더링
    const canvas1 = document.createElement('canvas');
    canvas1.width = canvasW;
    canvas1.height = canvasH;
    const ctx1 = canvas1.getContext('2d');
    ctx1.drawImage(img, pad, pad, natW, natH);

    // 2. 몸체 실루엣 팽창 캔버스 (7.5px Blur)
    const canvas2 = document.createElement('canvas');
    canvas2.width = canvasW;
    canvas2.height = canvasH;
    const ctx2 = canvas2.getContext('2d');

    ctx2.filter = 'blur(7.5px)';
    ctx2.drawImage(canvas1, 0, 0);

    const imgData2 = ctx2.getImageData(0, 0, canvasW, canvasH);
    const data2 = imgData2.data;

    // 3. 임계값(Threshold) 처리: 선화 조밀 영역 (머리, 목, 팔, 가슴, 몸통, 무릎, 다리, 받침) 탐색
    const totalPixels = canvasW * canvasH;
    const isBody = new Uint8Array(totalPixels);

    for (let i = 0; i < totalPixels; i++) {
      if (data2[i * 4 + 3] > 10) {
        isBody[i] = 1;
      }
    }

    // 4. Outer Background Flood Fill (캔버스 가장자리 0 알파 배경 영역 탐색)
    const isOuterBG = new Uint8Array(totalPixels);
    const queue = [];

    for (let x = 0; x < canvasW; x++) {
      if (!isBody[0 * canvasW + x]) queue.push(x, 0);
      if (!isBody[(canvasH - 1) * canvasW + x]) queue.push(x, canvasH - 1);
    }
    for (let y = 0; y < canvasH; y++) {
      if (!isBody[y * canvasW + 0]) queue.push(0, y);
      if (!isBody[y * canvasW + (canvasW - 1)]) queue.push(canvasW - 1, y);
    }

    let head = 0;
    while (head < queue.length) {
      const cx = queue[head++];
      const cy = queue[head++];
      const idx = cy * canvasW + cx;

      if (isOuterBG[idx]) continue;
      isOuterBG[idx] = 1;

      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1]
      ];

      for (let i = 0; i < 4; i++) {
        const nx = neighbors[i][0];
        const ny = neighbors[i][1];
        if (nx >= 0 && nx < canvasW && ny >= 0 && ny < canvasH) {
          const nIdx = ny * canvasW + nx;
          if (!isOuterBG[nIdx] && !isBody[nIdx]) {
            queue.push(nx, ny);
          }
        }
      }
    }

    // 5. 최종 마스크 생성:
    // - 반가사유상 몸체 (머리, 목, 팔, 가슴, 몸통, 무릎, 다리, 받침) -> SOLID WHITE (255, 255, 255, 255)
    // - 팔/가슴/다리 사이의 내부 빈 공간 (Negative Space Hole) & 외부 배경 -> TRANSPARENT (0 Alpha)
    for (let i = 0; i < totalPixels; i++) {
      const pIdx = i * 4;

      if (isBody[i] && !isOuterBG[i]) {
        data2[pIdx] = 255;
        data2[pIdx + 1] = 255;
        data2[pIdx + 2] = 255;
        data2[pIdx + 3] = 255;
      } else {
        data2[pIdx] = 0;
        data2[pIdx + 1] = 0;
        data2[pIdx + 2] = 0;
        data2[pIdx + 3] = 0;
      }
    }

    ctx2.putImageData(imgData2, 0, 0);
    const maskUrl = canvas2.toDataURL();
    callback(maskUrl, canvasW, canvasH);
  }

  function startLoadingAnimation(maskUrl, SVG_W, SVG_H) {
    if (splashWaveSvg) {
      splashWaveSvg.setAttribute('viewBox', `0 0 ${SVG_W} ${SVG_H}`);
    }

    if (splashLiquidLayer) {
      splashLiquidLayer.style.maskImage = `url(${maskUrl})`;
      splashLiquidLayer.style.webkitMaskImage = `url(${maskUrl})`;
      splashLiquidLayer.style.maskSize = 'contain';
      splashLiquidLayer.style.webkitMaskSize = 'contain';
      splashLiquidLayer.style.maskPosition = 'center';
      splashLiquidLayer.style.webkitMaskPosition = 'center';
      splashLiquidLayer.style.maskRepeat = 'no-repeat';
      splashLiquidLayer.style.webkitMaskRepeat = 'no-repeat';
      splashLiquidLayer.style.opacity = '1';
    }

    let progress = 0;
    let phase = 0;
    let animationFrameId = null;

    const amplitude = 3.5;
    const frequency = 0.04;

    function renderFrame() {
      if (progress < 100) {
        progress += 0.85;
        if (progress > 100) progress = 100;
      }

      const currentPercent = Math.floor(progress);
      if (splashPercent) {
        splashPercent.textContent = `${currentPercent}%`;
      }

      const fillY = SVG_H - (progress / 100) * SVG_H;
      phase += 0.06;

      // 95% -> 100% 구간에서 wave 진폭 감소 (100%에서 완전 제거)
      let currentAmplitude = 3.5;
      if (progress > 95) {
        const factor = Math.max(0, (100 - progress) / 5);
        currentAmplitude = 3.5 * factor;
      }

      let pathD = `M 0 ${SVG_H}`;

      if (progress >= 100) {
        // 100% 완료 시 파도 애니메이션 완전 제거 및 solid fill 레이어로 전체 내부 채움
        pathD = `M 0 ${SVG_H} L 0 0 L ${SVG_W} 0 L ${SVG_W} ${SVG_H} Z`;
      } else {
        pathD += ` L 0 ${fillY.toFixed(2)}`;
        const step = 6;
        for (let x = 0; x <= SVG_W; x += step) {
          const waveY = fillY + Math.sin(x * frequency + phase) * currentAmplitude;
          pathD += ` L ${x} ${waveY.toFixed(2)}`;
        }
        pathD += ` L ${SVG_W} ${SVG_H} Z`;
      }

      splashWavePath.setAttribute('d', pathD);

      if (progress > 5 && progress < 95 && Math.random() < 0.35) {
        spawnSplashParticle(fillY);
      }

      if (progress >= 100) {
        onSplashComplete();
        return;
      }

      animationFrameId = requestAnimationFrame(renderFrame);
    }

    function spawnSplashParticle(fillY) {
      if (!splashParticles) return;
      const particle = document.createElement('div');
      particle.className = 'splash-particle-dot';

      const randomX = Math.random() * 70 + 15;
      const randomY = (fillY / SVG_H) * 100 + (Math.random() * 6 - 3);

      particle.style.left = `${randomX}%`;
      particle.style.top = `${randomY}%`;

      splashParticles.appendChild(particle);

      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1200);
    }

    function onSplashComplete() {
      if (statueWrap) {
        statueWrap.style.transition = 'filter 0.5s ease';
        statueWrap.style.filter = 'drop-shadow(0 0 24px rgba(241, 213, 154, 0.95)) brightness(1.15)';
      }

      setTimeout(() => {
        splashScreen.style.opacity = '0';
        splashScreen.style.pointerEvents = 'none';

        setTimeout(() => {
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
          splashScreen.remove();
        }, 850);
      }, 450);
    }

    animationFrameId = requestAnimationFrame(renderFrame);
  }

  if (imgSource.complete && imgSource.naturalWidth !== 0) {
    createSolidMask(imgSource, startLoadingAnimation);
  } else {
    imgSource.onload = () => createSolidMask(imgSource, startLoadingAnimation);
  }
}