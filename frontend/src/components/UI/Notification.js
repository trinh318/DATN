import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faMoneyBill, faWrench, faFileContract } from '@fortawesome/free-solid-svg-icons';
import { CheckCheck } from "lucide-react";
import { isAuth, userType } from "../../libs/isAuth";
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../libs/NotificationContext";

const typeIcons = {
    maintenance: faWrench,
    payment: faMoneyBill,
    contract: faFileContract,
};

export default function Notification() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, refreshNotifications, markAllAsRead } = useNotifications();
    const bellRef = useRef(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleOutsideClick = (event) => {
        if (bellRef.current && !bellRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const formatTimeAgo = (dateString) => {
        const diff = Date.now() - new Date(dateString);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        return hours < 1 ? 'Just now' : `${hours}h ago`;
    };

    const navigate = useNavigate();

    const goToNotificationPage = () => {
        const role = userType();
        const url =
            role === "admin"
                ? "/admin-page?menu=alerts"
                : role === "recruiter"
                    ? "/recruiter-page?menu=alerts"
                    : "/applicant-dashboard?menu=alerts";

        navigate(url);
    };

    return (
        <div className="relative cursor-auto" ref={bellRef}>
            <button
                className="w-[50px] h-[50px] rounded-full bg-[#ecf5f3] flex items-center justify-center border-none cursor-pointer transition-colors duration-300"
                onClick={toggleDropdown}
            >
                <FontAwesomeIcon icon={faBell} />
                {notifications.some((n) => !n.read_status) && (
                    <span className="absolute top-[-4px] right-[-4px] w-2 h-2 bg-red-600 rounded-full" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 w-[360px] bg-white rounded-xl shadow-lg z-[100] font-sans">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center font-bold text-base">
                        <span>Notifications</span>
                        <button
                            onClick={markAllAsRead}
                            className="text-[13px] text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1"
                        >
                            <CheckCheck className="pt-[3px] max-w-[16px]" />
                            Mark all as read
                        </button>
                    </div>

                    {/* Today label */}
                    <div className="text-left px-4 py-2 text-sm text-gray-600 bg-gray-200">
                        {notifications.length === 0 ? "No notifications found." : "Today"}
                    </div>

                    {/* Notification items */}
                    <div className='flex flex-col w-full h-80 overflow-y-auto'>
                        {notifications
                            .slice()
                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                            .map((item) => {
                                const handleClick = () => {
                                    const role = userType();
                                    const baseUrl =
                                        role === "admin"
                                            ? "/admin-page?menu=alerts"
                                            : role === "recruiter"
                                                ? "/recruiter-page?menu=alerts"
                                                : "/applicant-dashboard?menu=alerts";

                                    navigate(`${baseUrl}&notificationId=${item._id}`);
                                };

                                return (
                                    <div
                                        key={item._id}
                                        className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-100 hover:shadow-sm transition ${!item.read_status ? "bg-gray-100 font-medium" : ""}`}
                                        onClick={handleClick}
                                    >
                                        <div className="flex items-start">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm text-gray-600 mr-3">
                                                <FontAwesomeIcon icon={typeIcons[item.type] || faFileContract} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <div className="text-left font-semibold text-sm text-gray-900">
                                                        {item.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500 ml-3 whitespace-nowrap">
                                                        {formatTimeAgo(item.created_at)}
                                                    </div>
                                                </div>
                                                <div className="text-left text-[13px] text-gray-700 mt-1">
                                                    {item.message}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 text-center text-sm">
                        <button
                            onClick={goToNotificationPage}
                            className="text-teal-700 hover:text-teal-900 transition"
                        >
                            Xem tất cả thông báo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
