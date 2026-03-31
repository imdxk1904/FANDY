/* ================================================
   HẰNG SỐ & BIẾN TOÀN CỤC
   ================================================ */

// Key lưu giỏ hàng trong localStorage
const CART_KEY = "fandy_cart_v1";

// Danh sách sản phẩm, load từ products.html
let CATALOG = [];


/* ================================================
   TIỆN ÍCH - Các hàm dùng chung
   ================================================ */

// Parse JSON an toàn, trả về null nếu lỗi
function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Định dạng số tiền sang VNĐ (vd: 63.000 ₫)
function formatVND(value) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

// Giới hạn số lượng trong khoảng 1 - 99
function clampQty(qty) {
  const n = Number(qty);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(99, Math.round(n)));
}


/* ================================================
   CATALOG - Tải danh sách sản phẩm từ products.html
   ================================================ */

async function loadCatalog() {
  try {
    // Fetch HTML của trang menu
    const res = await fetch('../../menu/products.html');
    const html = await res.text();

    // Parse HTML thành DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Lấy tất cả card sản phẩm
    const cards = doc.querySelectorAll('.product-card');

    const catalog = [];
    cards.forEach(card => {
      const id       = card.id;
      const name     = card.querySelector('h3')?.textContent || '';
      const desc     = card.querySelector('p')?.textContent || '';
      const price    = parseInt(card.querySelector('.price')?.textContent.replace(/\D/g, '') || '0');
      const oldPrice = parseInt(card.querySelector('.old-price')?.textContent.replace(/\D/g, '') || price);
      const image    = card.querySelector('img')?.getAttribute('src') || '';

      // Chỉ thêm vào catalog nếu có id và tên
      if (id && name) {
        catalog.push({
          id,
          name,
          desc,
          price,
          Last_price: oldPrice,
          Discount: Math.round((1 - price / oldPrice) * 100),
          image
        });
      }
    });

    return catalog;
  } catch {
    return [];
  }
}


/* ================================================
   GIỎ HÀNG - Đọc / Ghi localStorage
   ================================================ */

// Đọc giỏ hàng từ localStorage
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

// Ghi giỏ hàng vào localStorage
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}


/* ================================================
   GIỎ HÀNG - Các thao tác CRUD
   ================================================ */

// Tìm sản phẩm theo ID trong CATALOG
function getProductById(id) {
  const targetId = String(id);
  return CATALOG.find((p) => String(p.id) === targetId) || null;
}

// Thêm sản phẩm vào giỏ hoặc tăng số lượng nếu đã có
function addToCart(productId, qty = 1) {
  const product = getProductById(productId);
  if (!product) return;

  const cart = loadCart();
  const currentRaw = Number(cart[productId]?.qty ?? 0);
  const current = Number.isFinite(currentRaw) ? currentRaw : 0;
  const next = clampQty(current + qty);
  cart[productId] = { qty: next };
  saveCart(cart);
  renderAll();
}

// Cập nhật số lượng sản phẩm
function setQty(productId, qty) {
  const cart = loadCart();
  if (!cart[productId]) return;
  cart[productId].qty = clampQty(qty);
  saveCart(cart);
  renderAll();
}

// Xóa một sản phẩm khỏi giỏ
function removeItem(productId) {
  const cart = loadCart();
  if (!cart[productId]) return;
  delete cart[productId];
  saveCart(cart);
  renderAll();
}

// Xóa toàn bộ giỏ hàng
function clearCart() {
  try {
    localStorage.removeItem(CART_KEY);
  } catch {}
  saveCart({});
  renderAll();
}

// Tính tạm tính, phí ship, tổng cộng
function computeTotals(cart) {
  let subtotal = 0;
  const items = [];

  for (const [id, row] of Object.entries(cart)) {
    const product = getProductById(id);
    if (!product) continue;
    const qty = clampQty(row.qty);
    const lineTotal = qty * product.price;
    subtotal += lineTotal;
    items.push({ product, qty, lineTotal });
  }

  const shipping = 0;
  const total = subtotal + shipping;
  return { items, subtotal, shipping, total };
}


/* ================================================
   RENDER - Hiển thị giao diện
   ================================================ */

// Render danh sách sản phẩm trong giỏ + cập nhật tổng tiền
function renderCart() {
  const cartTable  = document.getElementById("cart-table");
  const cartEmpty  = document.getElementById("cart-empty");
  const subtotalEl = document.getElementById("subtotal");
  const shippingEl = document.getElementById("shipping");
  const totalEl    = document.getElementById("total");

  // Kiểm tra DOM đủ phần tử không
  if (!cartTable || !cartEmpty || !subtotalEl || !shippingEl || !totalEl) return;

  const cart = loadCart();
  const { items, subtotal, shipping, total } = computeTotals(cart);

  // Cập nhật số tiền
  subtotalEl.textContent = formatVND(subtotal);
  shippingEl.textContent = formatVND(shipping);
  totalEl.textContent    = formatVND(total);

  // Giỏ hàng trống
  if (items.length === 0) {
    cartEmpty.hidden = false;
    cartEmpty.style.display = "flex";
    cartTable.innerHTML = "";
    return;
  }

  // Giỏ hàng có hàng
  cartEmpty.hidden = true;
  cartEmpty.style.display = "none";

  // Render từng hàng sản phẩm
  cartTable.innerHTML = items.map(({ product, qty, lineTotal }) => `
    <div class="cart-row" data-id="${product.id}">
      <div class="cell-img">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="cell-title">
        <p class="item-title">${product.name}</p>
        <p class="item-meta">${product.desc}</p>
      </div>
      <div class="cell-qty">
        <div class="qty" role="group" aria-label="Số lượng">
          <button type="button" class="qty-btn" data-action="dec" aria-label="Giảm">−</button>
          <input type="text" inputmode="numeric" pattern="[0-9]*" value="${qty}" data-action="input" aria-label="Số lượng">
          <button type="button" class="qty-btn" data-action="inc" aria-label="Tăng">+</button>
        </div>
      </div>
      <div class="cell-total line-total">${formatVND(lineTotal)}</div>
      <div class="cell-remove">
        <button type="button" class="remove" data-action="remove" title="Xóa">✕</button>
      </div>
    </div>
  `).join("");
}

// Render phần gợi ý món ngon từ CATALOG
function renderSuggest() {
  const grid = document.getElementById("suggest-grid");
  if (!grid) return;

  const suggested = [...CATALOG]
  .filter(p => !["nuoc-coca", "nuoc-pepsi", "nuoc-7up"].includes(p.id)) // Lọc bỏ thức uống
  .sort(() => Math.random() - 0.5) // Random ngẫu nhiên
  .slice(0, 6); // Chỉ lấy 6 món

  grid.innerHTML = suggested.map((p) => {
    const hasSale  = p.Last_price > p.price;
    const badgeHTML = hasSale ? `<span class="discount-badge">-${p.Discount}%</span>` : "";

    return `
      <div class="product-card" style="position:relative;">
        ${badgeHTML}
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <p class="price">${formatVND(p.price)}</p>
        ${hasSale ? `<p class="old-price">${formatVND(p.Last_price)}</p>` : ""}
        <button class="btn-add-cart" type="button" data-add="${p.id}">Thêm sản phẩm</button>
      </div>
    `;
  }).join("");
  // Click vào card để sang trang detail
grid.querySelectorAll('.product-card').forEach((card, index) => {
  const p = suggested[index];
  card.style.cursor = 'pointer';
  card.addEventListener('click', (e) => {
    if (e.target.closest('.btn-add-cart')) return;

    localStorage.setItem('currentTarget', JSON.stringify({
      name: p.name,
      subtext: p.desc,
      price: formatVND(p.price),
      oldPrice: p.Last_price > p.price ? formatVND(p.Last_price) : '',
      image: p.image,
    }));

    location.href = `../../detail/detail.html?id=${p.id}`;
  });
});
}

// Gọi lại tất cả hàm render
function renderAll() {
  renderCart();
}


/* ================================================
   SỰ KIỆN - Xử lý tương tác người dùng
   ================================================ */

function bindEvents() {
  // Xử lý các sự kiện click trên toàn trang
  document.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target : e.target?.parentElement;
    if (!target) return;

    // Nút "Xóa hết": hiện confirm trước khi xóa
    const clearBtn = target.closest("#clear-cart-btn");
    if (clearBtn) {
      if (confirm("Xóa tất cả sản phẩm trong giỏ hàng?")) clearCart();
      return;
    }

    // Nút "Đặt hàng": kiểm tra giỏ rồi thông báo
    const checkoutBtn = target.closest("#checkout-btn");
    if (checkoutBtn) {
      const cart = loadCart();
      const { items, total } = computeTotals(cart);
      if (items.length === 0) {
        alert("Giỏ hàng đang trống.");
        return;
      }
      alert(`Đặt hàng thành công (demo).\nTổng tiền: ${formatVND(total)}`);
      return;
    }

    // Nút "Thêm vào giỏ" trong gợi ý: thêm sản phẩm + hiệu ứng "Đã thêm"
    const addBtn = target.closest("[data-add]");
    if (addBtn) {
      addToCart(addBtn.getAttribute("data-add"), 1);
      const origText = addBtn.textContent;
      addBtn.textContent = "Đã thêm";
      addBtn.style.background = "#28a745";
      addBtn.style.color = "#fff";
      setTimeout(() => {
        addBtn.textContent = origText;
        addBtn.style.background = "";
        addBtn.style.color = "";
      }, 1500);
      return;
    }

    // Các nút trong hàng sản phẩm giỏ hàng
    const row = target.closest(".cart-row");
    if (!row) return;

    const id     = row.getAttribute("data-id");
    const action = target.getAttribute("data-action");

    // Nút xóa sản phẩm
    if (action === "remove") {
      removeItem(id);
      return;
    }

    // Nút tăng/giảm số lượng
    if (action === "inc" || action === "dec") {
      const input = row.querySelector('input[data-action="input"]');
      const current = clampQty(input?.value ?? 1);
      setQty(id, current + (action === "inc" ? 1 : -1));
      return;
    }
  });

  // Xử lý nhập số lượng trực tiếp vào ô input
  document.addEventListener("input", (e) => {
    const input = e.target.closest?.('input[data-action="input"]');
    if (!input) return;
    const row = input.closest(".cart-row");
    if (!row) return;
    const id      = row.getAttribute("data-id");
    const cleaned = String(input.value).replace(/[^\d]/g, "");
    input.value   = cleaned;
    const next    = cleaned === "" ? 1 : clampQty(Number(cleaned));
    setQty(id, next);
  });
}

// Đóng drawer khi nhấn Enter trong ô tìm kiếm
function setupSearch() {
  const inputs = document.querySelectorAll('.navbar-search input, .drawer-search input');
  inputs.forEach(input => {
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      const keyword = this.value.trim();
      this.blur();
      if (window.innerWidth <= 1024) {
        document.getElementById('nav-mobile-input').checked = false;
      }
      // Nếu có từ khóa thì chuyển sang menu và tìm kiếm
      if (keyword) {
        location.href = `../../menu/products.html?search=${encodeURIComponent(keyword)}`;
      }
    });
  });
}



/* ================================================
   KHỞI CHẠY - Chạy khi DOM đã load xong
   ================================================ */

async function init() {
  CATALOG = await loadCatalog(); // Load sản phẩm từ products.html
  renderSuggest();               // Render gợi ý món ngon
  bindEvents();                  // Gắn sự kiện
  setupSearch();                 // Khởi chạy tìm kiếm
  renderAll();                   // Render giỏ hàng
}

document.addEventListener("DOMContentLoaded", init);