// ================================================
// CATEGORY NAV - Highlight link đang active
// ================================================

// Lấy tất cả link trong thanh danh mục và tất cả section có id
const navLinks = document.querySelectorAll('.category-nav a');
const sections = document.querySelectorAll('section[id]');

navLinks.forEach(link => {
    link.addEventListener('click', function () {
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');

        // Reset lại tất cả section và card khi bấm vào danh mục
        document.querySelectorAll('section').forEach(s => s.style.display = '');
        document.querySelectorAll('.product-card').forEach(c => c.style.display = '');

        // Xóa từ khóa trong ô tìm kiếm
        document.querySelectorAll('.navbar-search input, .drawer-search input').forEach(input => {
            input.value = '';
        });

        // Ẩn thông báo "Không tìm thấy" nếu có
        const noResult = document.getElementById('no-result');
        if (noResult) noResult.style.display = 'none';
    });
});

// Map section con → section cha trên category nav
// Ví dụ: khi scroll đến #ga thì highlight "Món chính" (#com)
const sectionParentMap = {
    'ga':     'com',   // Gà thuộc Món chính
    'burger': 'com',   // Burger thuộc Món chính
    'mi-y':   'mi-y',  // Mỳ ý thuộc Khác
    'pizza':  'mi-y',  // Pizza thuộc Khác
    'hotdog': 'mi-y'   // Hotdog thuộc Khác
};

// Scroll: tự động highlight link tương ứng với section đang hiển thị
window.addEventListener('scroll', () => {
    let current = '';

    // Tìm section nào đang hiện trên màn hình (dựa theo vị trí scroll)
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150; // trừ 150px cho fixed navbar
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    // Nếu section hiện tại là con (vd: ga, burger) thì đổi sang id cha (com)
    if (sectionParentMap[current]) {
        current = sectionParentMap[current];
    }

    // Bỏ active tất cả, rồi active link khớp với section hiện tại
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});


// ================================================
// TÌM KIẾM - Lọc sản phẩm theo từ khóa
// ================================================

function setupSearch() {
    // Lấy cả 2 ô input: trên navbar desktop và trong drawer mobile
    const inputs = document.querySelectorAll('.navbar-search input, .drawer-search input');

    inputs.forEach(input => {
        input.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter') return;
            const keyword = this.value.trim().toLowerCase();
            this.blur();
                if (window.innerWidth <= 1024) {
                document.getElementById('nav-mobile-input').checked = false;
            }
            // Đồng bộ nội dung giữa 2 ô tìm kiếm
            inputs.forEach(i => { if (i !== this) i.value = this.value; });

            const sections = document.querySelectorAll('section');

            // Duyệt từng section, ẩn/hiện card sản phẩm theo từ khóa
            sections.forEach(section => {
                const cards = section.querySelectorAll('.product-card');
                let hasVisible = false;

                cards.forEach(card => {
                    const text = card.innerText.toLowerCase();

                    if (!keyword || text.includes(keyword)) {
                        // Hiện card nếu khớp từ khóa (hoặc ô tìm kiếm trống)
                        card.style.display = '';
                        hasVisible = true;
                    } else {
                        // Ẩn card không khớp
                        card.style.display = 'none';
                    }
                });

                // Ẩn cả section nếu không có card nào khớp
                section.style.display = hasVisible || !keyword ? '' : 'none';
            });

            // Kiểm tra toàn bộ section có bị ẩn hết không
            const allHidden = [...document.querySelectorAll('section')].every(s => s.style.display === 'none');

            // Tạo thông báo "Không tìm thấy" nếu chưa có, rồi ẩn/hiện tùy kết quả
            let noResult = document.getElementById('no-result');
            if (!noResult) {
                noResult = document.createElement('p');
                noResult.id = 'no-result';
                noResult.textContent = 'Không tìm thấy món ăn phù hợp.';
                noResult.style.cssText = 'text-align:center; color:#aaa; font-size:18px; margin:60px auto;';
                // Chèn thông báo vào trước footer
                document.querySelector('footer').insertAdjacentElement('beforebegin', noResult);
            }

            noResult.style.display = allHidden ? 'block' : 'none';
        });
    });
}

// Khởi chạy chức năng tìm kiếm
setupSearch();


// ================================================
// DROPDOWN MOBILE - Toggle bằng tap thay vì hover
// ================================================

// Tap vào link có dropdown trên mobile/tablet thì toggle dropdown
document.querySelectorAll('.has-dropdown > a').forEach(link => {
    link.addEventListener('click', function (e) {
        if (window.innerWidth > 1024) return; // desktop thì dùng hover CSS, bỏ qua

        e.preventDefault(); // ngăn chuyển trang
        const dropdown = this.parentElement.querySelector('.dropdown');
        const isOpen = dropdown.style.display === 'block';

        // Đóng tất cả dropdown đang mở
        document.querySelectorAll('.has-dropdown .dropdown').forEach(d => {
            d.style.display = 'none';
        });

        // Nếu chưa mở thì mở, nếu đã mở thì đóng (trả quyền lại CSS)
        dropdown.style.display = isOpen ? '' : 'block';
    });
});

// Tap ra ngoài dropdown thì đóng lại (chỉ trên mobile/tablet)
document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-dropdown')) {
        document.querySelectorAll('.has-dropdown .dropdown').forEach(d => {
            if (window.innerWidth <= 1024) {
                d.style.display = ''; // trả quyền lại cho CSS hover
            }
        });
    }
});

// Tap vào item trong dropdown thì đóng dropdown, trả quyền lại CSS hover
document.querySelectorAll('.has-dropdown .dropdown a').forEach(link => {
    link.addEventListener('click', function () {
        document.querySelectorAll('.has-dropdown .dropdown').forEach(d => {
            d.style.display = ''; // dùng '' thay 'none' để hover desktop vẫn hoạt động
        });
    });
});


// ================================================
// BADGE GIẢM GIÁ & NÚT THÊM VÀO GIỎ HÀNG
// ================================================

document.querySelectorAll('.product-card').forEach(card => {

    // --- Tính % giảm và thêm badge ---
    const priceEl    = card.querySelector('.price');
    const oldPriceEl = card.querySelector('.old-price');

    // Chỉ tính khi card có cả giá mới lẫn giá cũ
    if (priceEl && oldPriceEl) {
        const price    = parseInt(priceEl.textContent.replace(/\D/g, '')); // lấy số từ "129.000đ"
        const oldPrice = parseInt(oldPriceEl.textContent.replace(/\D/g, ''));

        if (oldPrice > price) {
            // Tính phần trăm giảm và làm tròn
            const pct = Math.round((1 - price / oldPrice) * 100);

            // Tạo badge và chèn vào đầu card
            const badge = document.createElement('span');
            badge.className = 'discount-badge';
            badge.textContent = `-${pct}%`;
            card.prepend(badge);
        }
    }

    // --- Thêm nút Thêm vào giỏ hàng ---
    const btn = document.createElement('button');
    btn.className = 'btn-add-cart';
    btn.textContent = 'Thêm sản phẩm';

    btn.addEventListener('click', () => {
    const CART_KEY = "fandy_cart_v1";
    const id = card.id; // lấy id của card, vd: "combo1", "ga-gion"

    // Đọc giỏ hàng hiện tại
    let cart = {};
    try {
        const raw = localStorage.getItem(CART_KEY);
        cart = raw ? JSON.parse(raw) : {};
    } catch { cart = {}; }

    // Tăng số lượng nếu đã có, thêm mới nếu chưa có
    const current = Number(cart[id]?.qty ?? 0);
    cart[id] = { qty: Math.min(99, current + 1) };

    // Lưu lại
    localStorage.setItem(CART_KEY, JSON.stringify(cart));

    // Hiệu ứng nút
    btn.textContent = 'Đã thêm';
    btn.style.background = '#28a745';
    setTimeout(() => {
        btn.textContent = 'Thêm sản phẩm';
        btn.style.background = '';
    }, 1500);
});

    // Chèn nút vào cuối card
    card.appendChild(btn);

});
// ================================================
// ĐỌC TỪ KHÓA TỪ URL - Khi được chuyển từ trang giỏ hàng
// ================================================

window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get('search');
    if (!keyword) return;

    // Điền từ khóa vào ô tìm kiếm
    document.querySelectorAll('.navbar-search input, .drawer-search input').forEach(input => {
        input.value = keyword;
    });

    // Kích hoạt tìm kiếm
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    document.querySelector('.navbar-search input').dispatchEvent(enterEvent);
    // Xóa ?search=... khỏi URL sau khi tìm kiếm xong (F5 sẽ không tìm lại)
    history.replaceState(null, '', window.location.pathname);
});
// Bấm "Sản phẩm" trên navbar thì reset tìm kiếm
document.querySelectorAll('.navbar-menu a, .drawer-menu a').forEach(link => {
    link.addEventListener('click', function () {
        if (this.textContent.trim() === 'Sản phẩm') {
            // Reset lại tất cả section và card
            document.querySelectorAll('section').forEach(s => s.style.display = '');
            document.querySelectorAll('.product-card').forEach(c => c.style.display = '');

            // Xóa từ khóa trong ô tìm kiếm
            document.querySelectorAll('.navbar-search input, .drawer-search input').forEach(input => {
                input.value = '';
            });

            // Ẩn thông báo "Không tìm thấy" nếu có
            const noResult = document.getElementById('no-result');
            if (noResult) noResult.style.display = 'none';
        }
    });
});