//Khai báo các phần tử DOM cần thiết
const form = document.getElementById('form');
const email = document.getElementById('email-input');
const password = document.getElementById('password-input');
const username = document.getElementById('username-input');
const inputContainers = document.querySelectorAll('.input-container');

// Chuyển NodeList thành Array để dễ xử lý
let arrInputContainers = Array.from(inputContainers);

//Tạo thẻ <small> hiển thị thông báo cho từng input
arrInputContainers.forEach(item => {
  let inputSmall = document.createElement("small");
  inputSmall.className = "validate-text";
  inputSmall.innerText = "NA";
  item.appendChild(inputSmall);
})

// Đánh dấu những input hợp lệ và hiển thị message
function setSuccess(input, message){
  const inputParent = input.parentElement
  if(inputParent.classList.contains('incorrect')){
    inputParent.classList.remove('incorrect');
    inputParent.classList.add('correct');
  }
  else inputParent.classList.add('correct');
  inputParent.querySelector('.validate-text').textContent = message;
}

// Đánh dấu những input lỗi và hiển thị message
function setError(input, message){
  const inputParent = input.parentElement
  if(inputParent.classList.contains('correct')){
    inputParent.classList.remove('correct');
    inputParent.classList.add('incorrect');
  }
  else inputParent.classList.add('incorrect');
  inputParent.querySelector('.validate-text').textContent = message;
}

// Hàm kiểm tra định dạng Email bằng Regex
function isValidEmail(emailVal) {
    const regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regexEmail.test(String(emailVal).toLowerCase());
}

// Kiểm tra sự hợp lệ của Email
function validateEmail() {
  if(!email.value){
    setError(email, 'Vui lòng nhập email!');
  }
  else if(!isValidEmail(email.value)){
    setError(email, 'Email không hợp lệ!');
  }
  else setSuccess(email, 'Thành công!');
}

// Kiểm tra sự hợp lệ của Tên người dùng
function validateUsername() {
  if(username){
    if(!username.value){
      setError(username, 'Vui lòng nhập tên người dùng!');
    }
    else if(username.value.length < 5){
      setError(username, 'Tên người dùng phải có ít nhất 5 kí tự!');
    }
    else setSuccess(username, 'Thành công!');
  }
}

// Kiểm tra sự hợp lệ của Mật khẩu
function validatePassword() {
  if(!password.value){
    setError(password, 'Vui lòng nhập mật khẩu!');
  }
  else if(password.value.length < 8){
    setError(password, 'Mật khẩu có ít nhất 8 ký tự!');
  }
  else setSuccess(password, 'Thành công!');
}

// Kiểm tra ngay khi người dùng rời khỏi ô input
if(username) username.addEventListener('blur', validateUsername, false);
email.addEventListener('blur', validateEmail, false);
password.addEventListener('blur', validatePassword, false);

// Xử lý khi nhấn nút Gửi Form (Submit)
form.addEventListener('submit', (e) => {
    // Xác định trang chuyển hướng
  var targetURL;
  var notification;
  if(username){
    targetURL = 'login.html';
    notification = "Form đã được gửi thành công! Chuyển hướng đến trang đăng nhập!";
  }
  else {
    targetURL = '../index/index.html';
    notification = "Form đã được gửi thành công! Chuyển hướng đến trang chủ!";
  }

  // Kiểm tra tất cả input có đạt trạng thái correct không
  var valid = true;
  arrInputContainers.forEach(item => {
    if(!item.classList.contains('correct')) valid = false;
  }
  );

  // Nếu hợp lệ → submit + chuyển trang
  if(valid) {
    e.preventDefault();
    alert(notification);
    setTimeout(() => {
      window.location.href = targetURL;
    }, 500);
  } else {
    e.preventDefault();
      alert("Form vẫn còn trống!");
    }
})