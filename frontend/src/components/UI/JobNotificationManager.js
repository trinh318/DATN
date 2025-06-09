import React, { useState, useEffect } from "react";
import { FaRegEnvelope, FaEnvelopeOpenText, FaTrashAlt } from "react-icons/fa";
import { FaEnvelope, FaEnvelopeOpen, FaCheckDouble, FaTrash, FaStream } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { PiListChecksBold } from "react-icons/pi";
import { getId } from '../../libs/isAuth';
import axios from 'axios';
import { useNotifications } from "../../libs/NotificationContext";
import { useSearchParams } from "react-router-dom";

const JobNotificationManager = () => {
  const [searchParams] = useSearchParams();
  const notificationId = searchParams.get("notificationId");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const { notifications, setNotifications, refreshNotifications } = useNotifications();
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState("all");
  const userId = getId();

  useEffect(() => {
  if (notificationId && notifications.length > 0) {
    const matchedNotification = notifications.find(n => n._id === notificationId);
    if (matchedNotification) {
      setSelectedNotification(matchedNotification);
      if (!matchedNotification.read_status) {
        toggleReadStatus(notificationId);
      }
    }
  }
}, [notificationId, notifications]);

  const filteredNotifications = notifications
    .filter((notification) => {
      if (filter === "unread") return !notification.read_status;
      if (filter === "read") return notification.read_status;
      return true;
    })
    .filter((notification) => {
      return (
        (notification.message &&
          notification.message.toLowerCase().includes(search.toLowerCase())) ||
        (notification.created_at &&
          notification.created_at.toLowerCase().includes(search.toLowerCase()))
      );
    });

  const sortedNotifications = [...filteredNotifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const formatTime = (timestamp) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffMins < 60 * 24) return `${Math.floor(diffMins / 60)} giờ trước`;
    return created.toLocaleDateString('vi-VN');
  };

  const toggleReadStatus = async (id) => {
    try {
      const notification = notifications.find((n) => n._id === id);
      const updatedStatus = !notification.read_status;

      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {
        read_status: updatedStatus
      });

      await refreshNotifications();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái thông báo: ", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`);
      await refreshNotifications();
    } catch (error) {
      console.error("Lỗi khi xóa thông báo: ", error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await Promise.all(
        notifications.map((n) =>
          axios.delete(`http://localhost:5000/api/notifications/${n._id}`)
        )
      );
      await refreshNotifications();
    } catch (error) {
      console.error("Lỗi khi xóa tất cả thông báo: ", error);
    }
  };

  const markAllAsReadHandler = async () => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${userId}/read-all`);
      await refreshNotifications();
    } catch (error) {
      console.error("Lỗi khi đánh dấu tất cả là đã đọc: ", error);
    }
  };

  useEffect(() => {
  if (notificationId && notifications.length > 0) {
    const matchedNotification = notifications.find(n => n._id === notificationId);
    if (matchedNotification) {
      setSelectedNotification(matchedNotification);
      if (!matchedNotification.read_status) {
        toggleReadStatus(notificationId);
      }
    }
  }
}, [notificationId, notifications]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-5 w-full">
        <div className='flex gap-5 pb-3'>
          <FaStream className="w-3 text-gray-700" />
          <p className="font-semibold text-sm text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>Notifications</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-6"></div>
      </div>
      <div className="w-full flex flex-col gap-5 rounded-lg bg-white">
        <div className="relative flex flex-col p-5 max-w-full">
          {/* Tabs */}
          <div className="flex justify-start border-b-2 border-gray-200">
            {/* Search */}
            <div className="flex items-center rounded-lg w-72 mr-2">
              <FiSearch className="mr-2 text-gray-600" />
              <input
                type="text"
                placeholder="Tìm kiếm thông báo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm bg-transparent border-none focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="ml-auto flex gap-2">
              <button
                title="Tất cả"
                className={`bg-none px-[10px] py-[6px] rounded-lg flex items-center text-[#333] transition cursor-pointer hover:bg-gray-200 ${filter === "all" ? "bg-gray-500 text-white" : ""}`}
                onClick={() => setFilter("all")}
              >
                <FaEnvelopeOpenText />
              </button>
              <button
                title="Chưa đọc"
                className={`bg-none px-2 py-2 rounded-lg flex items-center text-[#333] transition cursor-pointer hover:bg-gray-200 ${filter === "unread" ? "bg-gray-500 text-white" : ""}`}
                onClick={() => setFilter("unread")}
              >
                <FaEnvelope />
              </button>
              <button
                title="Đã đọc"
                className={`bg-none px-2 py-2 rounded-lg flex items-center text-[#333] transition cursor-pointer hover:bg-gray-200 ${filter === "read" ? "bg-gray-500 text-white" : ""}`}
                onClick={() => setFilter("read")}
              >
                <FaEnvelopeOpen />
              </button>
              <button
                title="Đánh dấu tất cả là đã đọc"
                className="bg-none px-2 py-2 rounded-lg flex items-center text-[#333] transition cursor-pointer hover:bg-gray-200"
                onClick={markAllAsReadHandler}
              >
                <PiListChecksBold />
              </button>
              <button
                title="Xóa tất cả"
                className="bg-none px-2 py-2 rounded-lg flex items-center text-[#333] transition cursor-pointer hover:bg-gray-200"
                onClick={handleDeleteAll}
              >
                <FaTrash />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="bg-gray-100">
            <div className={`flex flex-col font-sans ${darkMode ? "bg-[#121212] text-gray-200" : ""}`}>
              <div className="flex flex-1 overflow-hidden max-h-[calc(100vh-225px)]">
                {/* Inbox list */}
                <div className={`flex-1 overflow-y-auto pr-2 border-r ${darkMode ? "border-gray-700 bg-[#1e1e1e]" : "border-gray-200"}`}>
                  {sortedNotifications.length > 0 ? (
                    sortedNotifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`group bg-white p-4 mb-px shadow transition cursor-pointer ${!notification.read_status ? "font-semibold" : ""
                          } ${selectedNotification?._id === notification._id
                            ? "border-l-4 border-blue-500 bg-blue-50"
                            : ""
                          } hover:bg-blue-100 hover:shadow-md`}
                        onClick={() => {
                          setSelectedNotification(notification);
                          if (!notification.read_status) {
                            toggleReadStatus(notification._id);
                          }
                        }}
                      >
                        <div className="relative flex justify-between items-start mb-1">
                          <h3 className="text-base font-semibold m-0">
                            {notification.title || "Thông Báo"}
                          </h3>

                          {/* Ngày giờ: ẩn khi hover */}
                          <span className="text-sm font-normal text-gray-500 transition-opacity group-hover:opacity-0">
                            {formatTime(notification.created_at)}
                          </span>

                          {/* Nút thao tác: hiện khi hover */}
                          <div className="absolute right-0 flex gap-3 opacity-0 group-hover:opacity-100 transition pointer-events-auto">
                            <button
                              className="text-gray-600 hover:text-black"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleReadStatus(notification._id);
                              }}
                            >
                              {notification.read_status ? <FaEnvelopeOpenText /> : <FaRegEnvelope />}
                            </button>
                            <button
                              className="text-gray-600 hover:text-black"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification._id);
                              }}
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 truncate">
                          {notification.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="p-5 text-center text-gray-500">Không có thông báo nào.</p>
                  )}
                </div>

                {/* Detail */}
                <div className={`w-[60%] p-6 overflow-y-auto bg-white ${darkMode ? "bg-[#1a1a1a] text-gray-300" : ""}`}>
                  {selectedNotification ? (
                    <>
                      <h3 className="text-2xl font-semibold mb-2">{selectedNotification.title || "Chi Tiết Thông Báo"}</h3>
                      <p className="text-sm text-gray-500 mb-4">{new Date(selectedNotification.created_at).toLocaleString()}</p>
                      <div className="text-base leading-relaxed">
                        {selectedNotification.message}
                      </div>
                    </>
                  ) : (
                    <div className="p-5 text-center text-gray-500">Chọn một thông báo để xem chi tiết</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobNotificationManager;
