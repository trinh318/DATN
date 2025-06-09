/**
 * useRole Custom Hook (Hook Tùy chỉnh Quyền người dùng)
Hook này xác định quyền của người dùng ("company" hoặc "greeter"). Hiện tại, phần logic xác thực và kiểm tra quyền đã bị ẩn (comment), nên nó chỉ trả về giá trị role rỗng.

Khi bỏ ẩn, mã này sẽ:
Theo dõi thay đổi trong xác thực.
Nếu người dùng đã được xác thực, mã kiểm tra xem người dùng có trong bộ sưu tập companies không.
Dựa trên sự tồn tại, nó sẽ thiết lập role là "company" hoặc "greeter".
 */

import { useState } from "react";

export default function useRole() {
  // Layout.js or App.js
  useEffect(() => {
    const userRole = localStorage.getItem("type");
    if (userRole === "admin") {
      navigate("/admin-dashboard");
    } else if (userRole === "recruiter") {
      navigate("/recruiter-dashboard");
    } else if (userRole === "applicant") {
      navigate("/applicant-dashboard");
    }
  }, []);
  return role;
}
