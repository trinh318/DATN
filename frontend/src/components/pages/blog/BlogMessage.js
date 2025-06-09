import React, { useState } from "react";
import "../../../styles/bloghome.css";

const Message = () => {
    // State để quản lý tìm kiếm
    const [searchQuery, setSearchQuery] = useState("");
    const [messageShadow, setMessageShadow] = useState(false);

    // Dữ liệu mẫu cho tin nhắn
    const messages = [
        { id: 1, name: "Edem Quist", text: "Just woke up bruh", active: false },
        { id: 2, name: "Daniella Jackson", text: "2 new messages", active: false },
        { id: 3, name: "Chantel Msiza", text: "lol u right", active: true },
        { id: 4, name: "Juliet Makarey", text: "Birthday Tomorrow", active: false },
        { id: 5, name: "Keylie Hadid", text: "5 new messages", active: true },
        { id: 6, name: "Benjamin Dwayne", text: "haha got that!", active: false },
    ];

    // Hàm xử lý tìm kiếm
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    // Hàm xử lý khi click vào mục "Messages"
    const handleMessageClick = () => {
        setMessageShadow(true);
        setTimeout(() => {
            setMessageShadow(false);
        }, 2000);
    };

    return (
        <div className="messages">
            <div className="heading">
                <h4>Messages</h4>
                <i className="uil uil-edit"></i>
            </div>
            <div className="search-bar">
                <i className="uil uil-search"></i>
                <input
                    type="search"
                    placeholder="Search messages"
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>
            <div className="category">
                <h6 className="active">Primary</h6>
                <h6>General</h6>
                <h6 className="message-requests">Requests (7)</h6>
            </div>
            <div
                className={`message-list ${messageShadow ? "shadow" : ""}`}
                onClick={handleMessageClick}
            >
                {messages
                    .filter((message) =>
                        message.name.toLowerCase().includes(searchQuery)
                    )
                    .map((message) => (
                        <div key={message.id} className="message">
                            <div className="profile-photo">
                                <img
                                    src={`../../../assets/blog-images/profile-${message.id}.jpg`}
                                    alt={message.name}
                                />
                                {message.active && <div className="active"></div>}
                            </div>
                            <div className="message-body">
                                <h5>{message.name}</h5>
                                <p className={message.text.includes("new messages") ? "text-bold" : "text-muted"}>
                                    {message.text}
                                </p>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Message;
