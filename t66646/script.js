(() => {
  const FRAME_COUNT = 120;
  const FRAME_PATH = i => `frames/frame_${String(i).padStart(4, '0')}.jpg`;

  const canvas   = document.getElementById('scrubCanvas');
  const ctx      = canvas.getContext('2d');
  const stage    = document.getElementById('stage');
  const loader   = document.getElementById('loader');
  const loaderFill = document.getElementById('loaderFill');
  const loaderPct  = document.getElementById('loaderPct');
  const railFill   = document.getElementById('railFill');
  const scrollcue  = document.getElementById('scrollcue');
  const beats      = Array.from(document.querySelectorAll('.beat'));

  const images = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let currentFrame = -1;
  let latestProgress = 0;
  let ticking = false;

  function updateLoaderUI() {
    const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
    loaderFill.style.width = pct + '%';
    loaderPct.textContent = pct;
  }

  function preload() {
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.onload = img.onerror = () => {
        loadedCount++;
        updateLoaderUI();
        if (i === 1) drawFrame(1); // paint something as soon as possible
        if (loadedCount === FRAME_COUNT) {
          loader.classList.add('hidden');
          window.addEventListener('scroll', onScroll, { passive: true });
          onScroll();
        }
      };
      img.src = FRAME_PATH(i);
      images[i - 1] = img;
    }
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
    canvas.height = window.innerHeight * Math.min(window.devicePixelRatio || 1, 2);
    if (currentFrame > -1) drawFrame(currentFrame, true);
  }

  function drawFrame(frameNumber, force) {
    if (frameNumber === currentFrame && !force) return;
    const img = images[frameNumber - 1];
    if (!img || !img.complete || !img.naturalWidth) return;
    currentFrame = frameNumber;

    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const canvasRatio = cw / ch;
    const imgRatio = iw / ih;

    let sx, sy, sw, sh;
    if (imgRatio > canvasRatio) {
      sh = ih;
      sw = ih * canvasRatio;
      sx = (iw - sw) / 2;
      sy = 0;
    } else {
      sw = iw;
      sh = iw / canvasRatio;
      sx = 0;
      sy = (ih - sh) / 2;
    }

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  }

  function ease(t) {
    return t < 0 ? 0 : t > 1 ? 1 : t;
  }

  function render() {
    ticking = false;
    const progress = latestProgress;

    const frameNumber = Math.min(
      FRAME_COUNT,
      Math.max(1, Math.round(progress * (FRAME_COUNT - 1)) + 1)
    );
    drawFrame(frameNumber);

    railFill.style.height = (progress * 100) + '%';
    scrollcue.style.opacity = progress < 0.03 ? 1 : 0;

    beats.forEach(beat => {
      const inStart = parseFloat(beat.dataset.in);
      const outEnd  = parseFloat(beat.dataset.out);
      const fadeSpan = 0.035;
      let opacity;
      if (progress < inStart - fadeSpan) {
        opacity = 0;
      } else if (progress < inStart) {
        opacity = ease((progress - (inStart - fadeSpan)) / fadeSpan);
      } else if (progress < outEnd - fadeSpan) {
        opacity = 1;
      } else if (progress < outEnd) {
        opacity = ease((outEnd - progress) / fadeSpan);
      } else {
        opacity = 0;
      }
      beat.style.opacity = opacity;
      beat.style.transform = `translateY(${(1 - opacity) * 14}px)`;
    });
  }

  function onScroll() {
    const rect = stage.getBoundingClientRect();
    const scrollableHeight = stage.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    latestProgress = ease(scrolled / scrollableHeight);

    if (!ticking) {
      requestAnimationFrame(render);
      ticking = true;
    }
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    onScroll();
  });

  resizeCanvas();
  preload();
})();
