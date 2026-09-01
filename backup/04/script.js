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

  // localStorage를 이용한 Hero 선택 로직
  const STORAGE_KEY = 'nmHeroVariant';
  let variant = localStorage.getItem(STORAGE_KEY);

  // 방문(새로고침)마다 번갈아가며 표시되도록 3단계 순환(백제 -> 반가사유상 -> 신라금관)
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

  // 각 Hero의 개별 설정 (실제 프레임 크기, 경로 및 텍스트)
  const heroConfigs = {
    baekje: {
      path: "frames/frames",
      frameCount: 120, // 백제금동대향로 120개 프레임
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
      frameCount: 120, // 반가사유상 120개 프레임
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
      frameCount: 120, // 신라 금관 120개 프레임
      imgW: 1920,
      imgH: 1080,
      text: {
        title: "Golden Radiance of Silla,<br>A Thousand Years in Time",
        kr: "신라 금관",
        caption: "Gold Crown of Silla"
      }
    }
  };

  const currentConfig = heroConfigs[variant];
  const frameCount = currentConfig.frameCount;
  const imgW = currentConfig.imgW;
  const imgH = currentConfig.imgH;
  const heroFramePath = currentConfig.path;

  // Hero 텍스트 내용 동적 교체
  const titleEl = document.getElementById('discoverImage'); // Placeholder helper or class query
  const heroTitleEl = document.querySelector('.hero-copy__title');
  const heroKrEl = document.querySelector('.hero-copy__kr');
  const heroCaptionEl = document.querySelector('.hero-copy__caption');

  if (heroTitleEl && heroKrEl && heroCaptionEl && currentConfig.text) {
    heroTitleEl.innerHTML = currentConfig.text.title;
    heroKrEl.textContent = currentConfig.text.kr;
    heroCaptionEl.textContent = currentConfig.text.caption;
  }

  // Discover Our Legacy 메인 이미지 동적 교체
  const discoverImgEl = document.querySelector('.artifact-image');
  if (discoverImgEl) {
    if (variant === 'baekje') {
      discoverImgEl.src = 'design/art_11.png';
      discoverImgEl.alt = 'Gilt-Bronze Incense Burner of Baekje';
    } else if (variant === 'bangasayusang') {
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
    if (variant === 'baekje') {
      discoverTitleEl.textContent = 'Gilt-bronze Incense Burner of Baekje';
      discoverMetaEl.textContent = 'Baekje Period, 6th Century';
    } else if (variant === 'bangasayusang') {
      discoverTitleEl.textContent = 'Gilt-bronze Pensive Bodhisattva';
      discoverMetaEl.textContent = 'Three Kingdoms Period, 7th Century';
    } else {
      discoverTitleEl.textContent = 'Gold Crown of Silla';
      discoverMetaEl.textContent = 'Three Kingdoms Period, 5th-6th Century';
    }
  }

  // 디버그용 콘솔 출력
  console.log(`[Hero Switcher] Selected variant: ${variant}`);
  console.log(`[Hero Switcher] Frame path: ${heroFramePath}`);
  console.log(`[Hero Switcher] Frame count: ${frameCount}`);

  const images = [];
  let loadedCount = 0;

  let targetFrame = 1;
  let currentFrame = 1;

  const pad = (num) => String(num).padStart(4, '0');
  const getFramePath = (idx) => `${heroFramePath}/frame_${pad(idx)}.jpg`;

  // 첫 번째 프레임을 먼저 로드하고 즉시 렌더링하여 첫 화면 깜빡임 방지
  const firstImg = new Image();
  firstImg.src = getFramePath(1);
  firstImg.onload = () => {
    images[1] = firstImg;
    loadedCount++;
    drawFrame(1);

    // 나머지 프레임 순차 로드 (선택된 Hero 프레임만 프리로드)
    for (let i = 2; i <= frameCount; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        images[i] = img;
        loadedCount++;
      };
      img.onerror = () => {
        console.warn(`[Hero Switcher] Failed to load image at: ${img.src}`);
      };
    }
  };
  firstImg.onerror = () => {
    console.warn(`[Hero Switcher] Failed to load first image at: ${firstImg.src}`);
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

  // 리사이즈 대처 (DPR 및 고해상도 지원)
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const displayW = window.innerWidth;
    const displayH = window.innerHeight;

    // CSS 크기와 내부 해상도 분리
    canvas.style.width = displayW + 'px';
    canvas.style.height = displayH + 'px';

    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;

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
      const remainsActive = filtered.some(item => item.id === activeArtifact.id);
      if (!remainsActive) {
        selectArtifact(filtered[0].id);
      }
    }
  });
}
