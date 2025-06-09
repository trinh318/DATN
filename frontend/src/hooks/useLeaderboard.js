/**
 * useLeaderboard Custom Hook (Hook Tùy chỉnh Bảng Xếp hạng)
Đây là một hook tùy chỉnh của React để lấy dữ liệu cho bảng xếp hạng, có thể hiển thị công việc hoặc dữ liệu liên quan đến công việc. Cách hoạt động:

useState khởi tạo user dưới dạng một mảng rỗng để lưu trữ dữ liệu đã lấy.
useEffect chạy một lần khi thành phần được gắn (do mảng phụ thuộc rỗng) và bao gồm:
Kiểm tra để đảm bảo user là một mảng.
Một lệnh axios.get để lấy dữ liệu từ apiList.jobs, kèm theo header xác thực.
Nếu yêu cầu thành công, setUser(response.data); cập nhật user với dữ liệu từ phản hồi.
Nếu yêu cầu thất bại, lỗi sẽ được ghi lại.
 */

import axios from "axios";
import apiList from "../libs/apiList";
import { useEffect, useState } from "react";

export default function useLeaderboard() {
  const [user, setUser] = useState([]);

  useEffect(() => {
    const validJobs = Array.isArray(user) ? user : [];

    setUser(validJobs);

    let address = apiList.jobs;

    axios
      .get(address, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        setUser(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return user;
}
