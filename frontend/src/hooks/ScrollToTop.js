/**
 * ScrollToTop Component (Thành phần Cuộn lên Đầu trang)
Thành phần này được thiết kế cho React và sử dụng react-router-dom để tự động cuộn lên đầu trang mỗi khi đường dẫn URL thay đổi. Cách hoạt động như sau:

useLocation cung cấp đối tượng vị trí hiện tại, bao gồm pathname (đường dẫn).
useEffect giám sát thay đổi của pathname. Mỗi khi pathname thay đổi, window.scrollTo(0, 0); sẽ cuộn trang lên đầu.
 */


import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
