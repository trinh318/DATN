// Lưu trữ thông tin người dùng vào localStorage khi đăng nhập thành công
export const login = (token, userRole, userId) => {
  localStorage.setItem("token", token); // Lưu token
  localStorage.setItem("role", userRole); // Lưu loại người dùng
  localStorage.setItem("id", userId); // Lưu ID người dùng

  localStorage.setItem("user", JSON.stringify({ _id: userId, userRole }));
  window.dispatchEvent(new Event("userChanged"));
};

// Kiểm tra người dùng đã đăng nhập chưa (kiểm tra token)
export const isAuth = () => {
  return localStorage.getItem("token") !== null;
};

// Lấy loại người dùng (recruiter, job-seeker...)
export const userType = () => {
  return localStorage.getItem("role");
};

// Lấy ID người dùng
export const getId = () => {
  return localStorage.getItem("id");
};

// Đăng xuất người dùng (xóa thông tin xác thực khỏi localStorage)
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("id");

  localStorage.removeItem("user");
  window.dispatchEvent(new Event("userChanged"));
};
