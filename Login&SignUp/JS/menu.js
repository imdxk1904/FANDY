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
