const CART_KEY = "fandy_cart_v1";

async function loadCatalog() {
  try {
    const res = await fetch('../menu/products.html');
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const cards = doc.querySelectorAll('.product-card');

    const catalog = [];
    cards.forEach(card => {
      const id       = card.id;
      const name     = card.querySelector('h3')?.textContent || '';
      const desc     = card.querySelector('p')?.textContent || '';
      const price    = parseInt(card.querySelector('.price')?.textContent.replace(/\D/g, '') || '0');
      const oldPrice = parseInt(card.querySelector('.old-price')?.textContent.replace(/\D/g, '') || price);
      const image    = card.querySelector('img')?.getAttribute('src') || '';
      if (id && name) catalog.push({ id, name, desc, price, oldPrice, image });
    });
    return catalog;
  } catch {
    return [];
  }
}

function addToCart(productId) {
  const raw = localStorage.getItem(CART_KEY);
  const cart = raw ? JSON.parse(raw) : {};
  const current = Number(cart[productId]?.qty ?? 0);
  cart[productId] = { qty: Math.min(99, current + 1) };
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

async function renderBestSeller() {
  const catalog = await loadCatalog();

  const grid = document.getElementById('suggest-grid');
  if (!grid) return;

  // Lấy 6 món random, bỏ thức uống
  const items = [...catalog]
    .filter(p => p.id.startsWith('combo') || p.id.startsWith('ga'))
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);

  grid.innerHTML = items.map(p => {
    const hasSale = p.oldPrice > p.price;
    const discount = hasSale ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    return `
      <div class="product-card" style="position:relative;">
        ${hasSale ? `<span class="discount-badge">-${discount}%</span>` : ''}
        <img src="../menu/${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <p class="price">${p.price.toLocaleString('vi-VN')}đ</p>
        ${hasSale ? `<p class="old-price">${p.oldPrice.toLocaleString('vi-VN')}đ</p>` : ''}
        <button class="btn-add-cart" data-id="${p.id}">Thêm sản phẩm</button>
      </div>
    `;
  }).join('');

  // Xử lý nút thêm vào giỏ
  grid.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart(btn.dataset.id);
      const orig = btn.textContent;
      btn.textContent = 'Đã thêm';
      btn.style.background = '#28a745';
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
      }, 1500);
    });
  });
 grid.querySelectorAll('.product-card').forEach((card, index) => {
    const p = items[index];
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-add-cart')) return;

      localStorage.setItem('currentTarget', JSON.stringify({
        name: p.name,
        subtext: p.desc,
        price: p.price.toLocaleString('vi-VN') + 'đ',
        oldPrice: p.oldPrice > p.price ? p.oldPrice.toLocaleString('vi-VN') + 'đ' : '',
        image: '../menu/' + p.image,
      }));

      location.href = `../detail/detail.html?id=${p.id}`;
    });
  });
}  // ← đóng hàm renderBestSeller

document.addEventListener('DOMContentLoaded', renderBestSeller);
// ================================================
// TÌM KIẾM - Chuyển sang menu khi nhấn Enter
// ================================================
function setupSearch() {
  const inputs = document.querySelectorAll('.navbar-search input, .drawer-search input');
  inputs.forEach(input => {
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      const keyword = this.value.trim();
      this.blur();
      // Đóng drawer trên mobile
      if (window.innerWidth <= 1024) {
        document.getElementById('nav-mobile-input').checked = false;
      }
      // Chuyển sang trang menu và tìm kiếm
      if (keyword) {
        location.href = `../menu/products.html?search=${encodeURIComponent(keyword)}`;
      }
    });
  });
}
setupSearch();