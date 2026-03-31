// const products = {
//   combo1: {
//     name: "Combo Fandy 1",
//     image: "images/combo1.jpg",
//     price: "129.000đ",
//     oldPrice: "159.000đ",
//     desc: "2 Miếng gà + 1 Burger + 1 Pepsi",
//   },
//   combo2: {
//     name: "Combo Fandy 2",
//     image: "images/combo2.jpg",
//     price: "129.000đ",
//     oldPrice: "159.000đ",
//     desc: "3 Miếng gà + 1 Khoai tây chiên + 1 Coca",
//   },
//   combo3: {
//     name: "Combo Fandy 3",
//     image: "images/combo3.jpg",
//     price: "119.000đ",
//     oldPrice: "140.000đ",
//     desc: "2 Miếng gà + 1 Mỳ ý + 1 Coca",
//   },
//   "combo-capdoi": {
//     name: "Combo Fandy ",
//     image: "images/combo3.jpg",
//     price: "119.000đ",
//     oldPrice: "140.000đ",
//     desc: "2 Miếng gà + 1 Mỳ ý + 1 Coca",
//   },
//   "ga-gion": {
//     name: "Gà Giòn",
//     image: "images/gagion.jpg",
//     price: "29.000đ",
//     desc: "1 Miếng gà rán truyền thống giòn tan.",
//   },
//   "com-sothai": {
//     name: "Cơm gà viên sốt thái",
//     image: "images/gagion.jpg",
//     price: "29.000đ",
//     desc: "1 Miếng gà rán truyền thống giòn tan.",
//   },
//   "ga-gion": {
//     name: "Gà Giòn",
//     image: "images/gagion.jpg",
//     price: "29.000đ",
//     desc: "1 Miếng gà rán truyền thống giòn tan.",
//   },
//   "ga-gion": {
//     name: "Gà Giòn",
//     image: "images/gagion.jpg",
//     price: "29.000đ",
//     desc: "1 Miếng gà rán truyền thống giòn tan.",
//   },
// };

// // Đợi HTML tải xong hoàn toàn mới chạy code bên trong
// window.addEventListener("DOMContentLoaded", () => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const productId = urlParams.get("id");

//   console.log("Sản phẩm ID hiện tại:", productId); // Kiểm tra xem có nhận được ID không

//   if (productId && products[productId]) {
//     const item = products[productId];

//     // Đổ dữ liệu vào HTML
//     const imgElement = document.getElementById("main-product-img");
//     const nameElement = document.querySelector(".product-name");
//     const priceElement = document.querySelector(".detail-price");
//     const oldPriceElement = document.querySelector(".detail-old-price");
//     const descElement = document.querySelector(".product-description p");

//     if (imgElement) imgElement.src = item.image;
//     if (nameElement) nameElement.innerText = item.name;
//     if (priceElement) priceElement.innerText = item.price;
//     if (descElement) descElement.innerText = item.desc;

//     if (item.oldPrice && oldPriceElement) {
//       oldPriceElement.innerText = item.oldPrice;
//       oldPriceElement.style.display = "inline";
//     } else if (oldPriceElement) {
//       oldPriceElement.style.display = "none";
//     }
//   } else {
//     console.error("Không tìm thấy sản phẩm hoặc ID trên URL sai!");
//   }
// });

window.addEventListener("DOMContentLoaded", () => {
  // 1. Lấy dữ liệu từ localStorage
  const data = JSON.parse(localStorage.getItem("currentTarget"));

  if (data) {
    // 2. Đổ dữ liệu vào các thẻ HTML dựa trên class/id của bạn
    document.title = data.name;
    document.getElementById("main-product-img").src = data.image;
    document.querySelector(".product-name").innerText = data.name;
    document.querySelector(".product-subtext").innerText = data.subtext;
    document.querySelector(".detail-price").innerText = data.price;

    // Vì trang danh sách không có mô tả dài, ta tạm dùng subtext cho phần mô tả
    document.querySelector(".product-description p").innerText =
      data.subtext + ". Combo cực ngon, nóng hổi vừa thổi vừa ăn tại FANDY!";

    const oldPriceBtn = document.querySelector(".detail-old-price");
    if (data.oldPrice) {
      oldPriceBtn.innerText = data.oldPrice;
      oldPriceBtn.style.display = "inline";
    } else {
      oldPriceBtn.style.display = "none";
    }
  }

  // 3. Xử lý nút Thêm vào giỏ hàng
  const addCartBtn = document.querySelector(".btn-add-to-cart");
  if (addCartBtn) {
    addCartBtn.addEventListener("click", () => {
  const quantity = parseInt(document.getElementById("qty").value);

  // Lấy id sản phẩm từ URL
  const productId = new URLSearchParams(window.location.search).get("id");

  // Đọc giỏ hàng đúng key và đúng cấu trúc object
  let cart = JSON.parse(localStorage.getItem("fandy_cart_v1")) || {};

  const currentQty = Number(cart[productId]?.qty ?? 0);
  cart[productId] = { qty: Math.min(99, currentQty + quantity) };

  localStorage.setItem("fandy_cart_v1", JSON.stringify(cart));
  alert("Đã thêm vào giỏ hàng");
});
  }
});
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
