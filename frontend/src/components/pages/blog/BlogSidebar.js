import React, { useState } from "react";
import "../../../styles/bloghome.css";

const Sidebar = () => {
  // State để quản lý mục đang active và trạng thái hiển thị popup
  const [activeItem, setActiveItem] = useState("home");
  const [showNotifications, setShowNotifications] = useState(false);

  // Hàm xử lý khi click vào menu item
  const handleMenuClick = (itemId) => {
    setActiveItem(itemId);
    if (itemId === "notifications") {
      setShowNotifications(true);
    } else {
      setShowNotifications(false);
    }
  };

  return (
    <div className="sidebar">
      <a
        className={`menu-item ${activeItem === "home" ? "active" : ""}`}
        onClick={() => handleMenuClick("home")}
      >
        <span><i className="uil uil-home"></i></span>
        <h3>Home</h3>
      </a>
      
      <a
        className={`menu-item ${activeItem === "explore" ? "active" : ""}`}
        onClick={() => handleMenuClick("explore")}
      >
        <span><i className="uil uil-compass"></i></span>
        <h3>Explore</h3>
      </a>
      
      <a
        className={`menu-item ${activeItem === "notifications" ? "active" : ""}`}
        onClick={() => handleMenuClick("notifications")}
      >
        <span><i className="uil uil-bell"><small className="notification-count">9+</small></i></span>
        <h3>Notification</h3>
        {showNotifications && (
          <div className="notifications-popup">
            <div>
              <div className="profile-photo">
                <img src="../../../assets/blog-images/profile-2.jpg" alt="" />
              </div>
              <div className="notification-body">
                <b>Keke Benjamin</b> accepted your friend request
                <small className="text-muted">2 Days Ago</small>
              </div>
            </div>
            <div>
              <div className="profile-photo">
                <img src="../../../assets/blog-images/profile-3.jpg" alt="" />
              </div>
              <div className="notification-body">
                <b>John Doe</b> commented on your post
                <small className="text-muted">1 Hour Ago</small>
              </div>
            </div>
            {/* Add more notifications as needed */}
          </div>
        )}
      </a>
      
      <a
        className={`menu-item ${activeItem === "messages-notifications" ? "active" : ""}`}
        onClick={() => handleMenuClick("messages-notifications")}
      >
        <span><i className="uil uil-envelope-alt"><small className="notification-count">6</small></i></span>
        <h3>Messages</h3>
      </a>

      <a
        className={`menu-item ${activeItem === "bookmarks" ? "active" : ""}`}
        onClick={() => handleMenuClick("bookmarks")}
      >
        <span><i className="uil uil-bookmark"></i></span>
        <h3>Bookmarks</h3>
      </a>

      <a
        className={`menu-item ${activeItem === "analytics" ? "active" : ""}`}
        onClick={() => handleMenuClick("analytics")}
      >
        <span><i className="uil uil-chart-line"></i></span>
        <h3>Analytics</h3>
      </a>

      <a
        className={`menu-item ${activeItem === "theme" ? "active" : ""}`}
        onClick={() => handleMenuClick("theme")}
      >
        <span><i className="uil uil-palette"></i></span>
        <h3>Theme</h3>
      </a>

      <a
        className={`menu-item ${activeItem === "settings" ? "active" : ""}`}
        onClick={() => handleMenuClick("settings")}
      >
        <span><i className="uil uil-setting"></i></span>
        <h3>Setting</h3>
      </a>
    </div>
  );
};

export default Sidebar;
