/* ============================================================
   National Museum of Korea — Shared Custom Cursor System
   cursor.js (Center Aligned Gold Star & Metallic Spark Trail)
   ============================================================ */

let isCursorInitialized = false;

function initCustomCursor() {
  if (isCursorInitialized) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  isCursorInitialized = true;

  // 커서 DOM 요소가 없을 경우 자동 생성
  let cursor = document.getElementById('customCursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.id = 'customCursor';
    cursor.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 0C12 7 13 11 20 11C13 11 12 15 12 22C12 15 11 11 4 11C11 11 12 7 12 0Z" fill="url(#cursorGoldGrad)"/>
        <defs>
          <radialGradient id="cursorGoldGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#F1D59A"/>
          <stop offset="45%" stop-color="#D4AF6A"/>
          <stop offset="100%" stop-color="#A98242"/>
        </radialGradient>
        </defs>
      </svg>
    `;
    document.body.appendChild(cursor);
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  let lastX = mouseX;
  let lastY = mouseY;
  let lastTime = performance.now();

  const maxSparkles = 90; // DOM 세션 내 최대 유지 파티클 수
  const activeSparkles = [];
  let hoverInterval = null;

  // 마우스 이동 감지 및 스파크 입자 생성
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const now = performance.now();
    const dt = now - lastTime;
    if (dt > 8) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const distance = Math.hypot(dx, dy);
      const speed = distance / dt;

      if (speed > 0.1) {
        const spawnCount = Math.min(5, Math.floor(speed * 2.5));
        for (let i = 0; i < spawnCount; i++) {
          createSparkle(e.clientX, e.clientY, dx, dy, speed, false);
        }
      }

      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;
    }
  });

  // 커서 좌표 렌더링 - translate(-50%, -50%)를 결합하여 (cursorX, cursorY)가 Gold Star의 정확한 visual center가 되도록 보장
  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;

    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%) ${
      cursor.classList.contains('is-hovered') ? 'scale(1.4)' :
      cursor.classList.contains('is-clicked') ? 'scale(0.8)' : 'scale(1)'
    }`;

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // 금빛 스파크 파티클 생성 함수 (모든 파티클은 Gold Star의 정확한 중심점 (x, y)에서 시작)
  function createSparkle(x, y, dx, dy, speed, isHoverBurst = false) {
    if (activeSparkles.length >= maxSparkles) {
      const oldest = activeSparkles.shift();
      if (oldest && oldest.parentNode) {
        oldest.parentNode.removeChild(oldest);
      }
    }

    const sparkle = document.createElement('div');
    sparkle.className = 'cursor-sparkle';

    // 파티클 종류 랜덤 믹싱: spark (긴 불꽃선), streak (짧은 주사선), dust (금가루), star (4각 별)
    const rand = Math.random();
    let type = 'dust';

    if (isHoverBurst) {
      if (rand < 0.40) type = 'spark';
      else if (rand < 0.65) type = 'streak';
      else if (rand < 0.85) type = 'dust';
      else type = 'star';
    } else {
      if (rand < 0.35) type = 'spark';
      else if (rand < 0.60) type = 'streak';
      else if (rand < 0.85) type = 'dust';
      else type = 'star';
    }

    sparkle.classList.add(`cursor-sparkle--${type}`);

    let angle, dist;
    if (isHoverBurst) {
      // Hover 시: 커서 중심에서 360도 전방위 사방 분사
      angle = Math.random() * Math.PI * 2;
      dist = Math.random() * 45 + 15; // 15px ~ 60px 방사
    } else {
      // 일반 이동 시: 관성 기반 분사
      const moveAngle = Math.atan2(-dy, -dx);
      angle = moveAngle + (Math.random() - 0.5) * 1.4;
      dist = Math.min(85, speed * 26 + Math.random() * 30);
    }

    // 각도 변환 (deg)
    const angleDeg = (angle * 180) / Math.PI + 90;
    sparkle.style.setProperty('--rot', `${angleDeg.toFixed(1)}deg`);

    // 이동 offset 계산
    const targetDx = Math.cos(angle) * dist;
    const targetDy = Math.sin(angle) * dist;

    sparkle.style.setProperty('--dx', `${targetDx.toFixed(1)}px`);
    sparkle.style.setProperty('--dy', `${targetDy.toFixed(1)}px`);
    sparkle.style.setProperty('--dist', `${dist.toFixed(1)}px`);

    if (type === 'spark') {
      const sparkW = Math.random() * 1.5 + 1.5;
      const sparkH = Math.random() * 10 + 12;
      sparkle.style.setProperty('--spark-w', `${sparkW.toFixed(1)}px`);
      sparkle.style.setProperty('--spark-h', `${sparkH.toFixed(1)}px`);
    }

    // 애니메이션 지속 시간 (0.3초 ~ 0.65초)
    const dur = type === 'spark' || type === 'streak'
      ? Math.random() * 0.2 + 0.35
      : Math.random() * 0.3 + 0.45;
    sparkle.style.setProperty('--dur', `${dur.toFixed(2)}s`);

    // 모든 파티클의 시작점 = 커서 별의 정확한 visual center (x, y)
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;

    document.body.appendChild(sparkle);
    activeSparkles.push(sparkle);

    setTimeout(() => {
      if (sparkle.parentNode) {
        sparkle.parentNode.removeChild(sparkle);
      }
      const idx = activeSparkles.indexOf(sparkle);
      if (idx > -1) activeSparkles.splice(idx, 1);
    }, dur * 1000);
  }

  // 커서 중앙 Flash 순간 조명 방출
  function createFlashSparkle(x, y) {
    if (activeSparkles.length >= maxSparkles) {
      const oldest = activeSparkles.shift();
      if (oldest && oldest.parentNode) {
        oldest.parentNode.removeChild(oldest);
      }
    }

    const flash = document.createElement('div');
    flash.className = 'cursor-sparkle cursor-sparkle--flash';
    flash.style.left = `${x}px`;
    flash.style.top = `${y}px`;

    const dur = 0.25;
    flash.style.setProperty('--dur', `${dur}s`);

    document.body.appendChild(flash);
    activeSparkles.push(flash);

    setTimeout(() => {
      if (flash.parentNode) {
        flash.parentNode.removeChild(flash);
      }
      const idx = activeSparkles.indexOf(flash);
      if (idx > -1) activeSparkles.splice(idx, 1);
    }, dur * 1000);
  }

  // Hover 상태 지속 시 방사형 강한 스파크 루프
  function startHoverSparkles() {
    if (hoverInterval) return;
    createFlashSparkle(cursorX, cursorY);

    let tickCount = 0;
    hoverInterval = setInterval(() => {
      tickCount++;
      const count = Math.floor(Math.random() * 3) + 3; // 3~5개 방출
      for (let i = 0; i < count; i++) {
        createSparkle(cursorX, cursorY, 0, 0, 0, true);
      }

      if (tickCount % 4 === 0) {
        createFlashSparkle(cursorX, cursorY);
      }
    }, 45);
  }

  function stopHoverSparkles() {
    if (hoverInterval) {
      clearInterval(hoverInterval);
      hoverInterval = null;
    }
  }

  const hoverSelectors = 'a, button, [role="button"], input, select, textarea, .hero-nav-btn, .hero-quick-nav__item, .hero-quick-nav__video, .category-tags button, .product-card, .filter-pill, .artifact-card, .exhibition-card, label, [tabindex]';

  document.addEventListener('mouseover', (e) => {
    if (e.target && e.target.closest && e.target.closest(hoverSelectors)) {
      cursor.classList.add('is-hovered');
      startHoverSparkles();
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target && e.target.closest && e.target.closest(hoverSelectors)) {
      cursor.classList.remove('is-hovered');
      stopHoverSparkles();
    }
  });

  window.addEventListener('mousedown', () => {
    cursor.classList.add('is-clicked');
    createFlashSparkle(cursorX, cursorY);
    for (let i = 0; i < 6; i++) {
      createSparkle(cursorX, cursorY, 0, 0, 0, true);
    }
  });

  window.addEventListener('mouseup', () => {
    cursor.classList.remove('is-clicked');
  });
}

// DOM 로드 시 초기화 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCustomCursor);
} else {
  initCustomCursor();
}
