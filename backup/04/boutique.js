/* ============================================================
   MUSEUM BOUTIQUE INTERACTION SYSTEM
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initProducts();
  initCategoryFilters();
});

// 상품 데이터
const products = [
  {
    id: 'moon-jar',
    name: 'Dalhangari Moon Jar (Large)',
    category: 'ceramics',
    desc: 'Timeless pure white porcelain representing the round form of the full moon.',
    price: '₩ 350,000',
    src: 'design/art_5.png'
  },
  {
    id: 'incense-burner',
    name: 'Gilt-Bronze Incense Burner Replica',
    category: 'miniatures treasures',
    desc: 'Baekje incense burner replica reflecting the harmony of heaven and earth.',
    price: '₩ 4,500,000',
    src: 'design/art_11.png'
  },
  {
    id: 'celadon-teacup',
    name: 'Celadon Korean Teacup Set',
    category: 'ceramics',
    desc: 'Exquisite Goryeo celadon cups with delicate jade green glaze.',
    price: '₩ 180,000',
    src: 'design/art_3.png'
  },
  {
    id: 'pensive-bodhisattva-mini',
    name: 'Pensive Bodhisattva Statue',
    category: 'miniatures treasures',
    desc: '83rd National Treasure, mini statue representing eternal thoughts.',
    price: '₩ 250,000',
    src: 'design/art_1.jpg'
  },
  {
    id: 'royal-seal',
    name: 'Joseon Royal Seal Replica',
    category: 'treasures',
    desc: 'Gold-plated replica of the royal state seal of the Joseon Dynasty.',
    price: '₩ 650,000',
    src: 'design/art_8.png'
  },
  {
    id: 'silk-scarf',
    name: 'Heritage Silk Scarf',
    category: 'fashion',
    desc: 'Premium silk scarf patterned with traditional Korean mural motifs.',
    price: '₩ 95,000',
    src: 'design/art_2.png'
  },
  {
    id: 'lacquerware-box',
    name: 'Lacquerware Mother of Pearl Box',
    category: 'living',
    desc: 'Elegant storage box hand-crafted with iridescent nacre overlays.',
    price: '₩ 220,000',
    src: 'design/art_10.png'
  },
  {
    id: 'incense-burner-compact',
    name: 'Gilt-Bronze Burner (Compact)',
    category: 'treasures miniatures',
    desc: 'Compact desktop edition of Baekje\'s gilt-bronze masterpiece.',
    price: '₩ 380,000',
    src: 'design/art_11.png'
  }
];

// 상품 목록 동적 생성 및 3D Tilt 효과 바인딩
function initProducts(filter = 'all') {
  const grid = document.getElementById('boutiqueGrid');
  if (!grid) return;

  grid.innerHTML = '';

  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => p.category.includes(filter));

  filteredProducts.forEach((p, idx) => {
    const card = document.createElement('div');
    card.className = 'product-card fade-out';
    card.setAttribute('data-category', p.category);

    card.innerHTML = `
      <div class="product-card__img-wrap">
        <img src="${p.src}" alt="${p.name}">
      </div>
      <div class="product-card__info">
        <span class="product-card__meta">${p.category.split(' ')[0]}</span>
        <h3 class="product-card__name">${p.name}</h3>
        <p class="product-card__price">${p.price}</p>
        <button class="product-card__btn" type="button">VIEW DETAILS</button>
      </div>
    `;

    // 3D Tilt & Gold Reflection 효과 리스너 연결
    bind3DTilt(card);

    grid.appendChild(card);

    // Staggered Reveal 딜레이 적용
    setTimeout(() => {
      card.classList.remove('fade-out');
      card.classList.add('fade-in');
    }, idx * 80 + 50);
  });
}

// 3D Tilt 마이크로 인터랙션
function bind3DTilt(card) {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 최대 기울기 8도 조절
    const rotateX = ((centerY - y) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `translateY(-8px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) scale(1) rotateX(0deg) rotateY(0deg)';
  });
}

// 카테고리 필터 스위칭
function initCategoryFilters() {
  const container = document.getElementById('boutiqueFilters');
  if (!container) return;

  const pills = container.querySelectorAll('.filter-pill');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');

      const filterVal = pill.getAttribute('data-filter');

      // 1. 기존 카드들 서서히 Fade out
      const cards = document.querySelectorAll('.product-card');
      cards.forEach(card => {
        card.classList.remove('fade-in');
        card.classList.add('fade-out');
      });

      // 2. 300ms 딜레이 후 필터링 리스트 리빌드 (Fade in 및 Scale Re-entry)
      setTimeout(() => {
        initProducts(filterVal);
      }, 300);
    });
  });
}
