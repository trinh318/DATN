import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?._id;
  });

  const fetchNotifications = async (uid) => {
    if (!uid) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/${uid}`);
      setNotifications(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
    }
  };

  // Lắng nghe sự kiện thay đổi localStorage
  useEffect(() => {
    const handleUserChanged = () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const newUserId = user?._id || null;
      setUserId(newUserId);
    };
  
    window.addEventListener("userChanged", handleUserChanged);
    return () => window.removeEventListener("userChanged", handleUserChanged);
  }, []);

  // Khi userId thay đổi => gọi lại API
  useEffect(() => {
    if (userId) {
      fetchNotifications(userId);
    } else {
      setNotifications([]); // Clear noti nếu chưa đăng nhập
    }
  }, [userId]);

  const refreshNotifications = () => {
    if (userId) fetchNotifications(userId);
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${userId}/read-all`);
      refreshNotifications();
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, refreshNotifications, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
