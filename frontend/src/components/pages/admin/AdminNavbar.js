import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBuilding, faBriefcase, faBell, faCogs, faSignOutAlt, faQuestionCircle, faComments } from '@fortawesome/free-solid-svg-icons';
import { logout } from "../../../libs/isAuth";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getId } from '../../../libs/isAuth';

export default function AdminNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null); // Lưu trữ dữ liệu người dùng
    const [profile, setProfile] = useState(null); // Lưu trữ dữ liệu người dùng
    const [error, setError] = useState(null); // Lưu trữ lỗi (nếu có)
    const [loading, setLoading] = useState(true);

    const userId = getId();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token'); // Lấy token từ localStorage

                // Kiểm tra nếu không có token
                if (!token) {
                    setError('Token is missing, please login again.');
                    setLoading(false);
                    return;
                }

                const responseUser = await axios.get('http://localhost:5000/api/users/me', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Gửi token trong header
                    },
                });

                const responseProfile = await axios.get(`http://localhost:5000/api/profiles/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Gửi token trong header
                    },
                });

                setUser(responseUser.data); // Lưu dữ liệu người dùng

                // Kiểm tra nếu profile không tồn tại
                if (responseProfile.data.profile === null) {
                    setProfile({ first_name: 'Chưa cập nhật', last_name: '' });
                } else {
                    setProfile(responseProfile.data);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to fetch user data.');
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const navigate = useNavigate();

    const handleLogoutClick = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex relative gap-2 recruiter-profile">
            {/* Notification Buttons */}
            {/**<div className="flex gap-2 recruiter-notification-buttons">
                <button className="w-[50px] h-[50px] rounded-full bg-[#ecf5f3] flex items-center justify-center border-none cursor-pointer hover:bg-[#cceaea] recruiter-notification-button">
                    <FontAwesomeIcon icon={faBell} className="text-[#0A7075] text-xl" />
                </button>
                <button className="w-[50px] h-[50px] rounded-full bg-[#ecf5f3] flex items-center justify-center border-none cursor-pointer hover:bg-[#cceaea] recruiter-notification-button">
                    <FontAwesomeIcon icon={faComments} className="text-[#0A7075] text-xl" />
                </button>
            </div> */}

            {/* User Icon */}
            <div className="cursor-pointer recruiter-icon" onClick={toggleMenu}>
                <img
                    src="user.png"
                    alt="User Icon"
                    className="w-[50px] h-[50px] rounded-full bg-gray-600 recruiter-image"
                />
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div className="absolute top-[60px] right-0 w-[350px] bg-white shadow-lg rounded-lg p-4 z-[1000] recruiter-menu">
                    {/* User Info */}
                    <div className="flex items-center justify-between mb-4 recruiter-info">
                        <div className="flex flex-col recruiter-info-detail">
                            <h4 className="text-base font-bold recruiter-name">
                                {profile?.first_name} {profile?.last_name || ''}
                            </h4>
                            <p className="text-sm text-gray-600 recruiter-email">{user?.email}</p>
                        </div>
                        <button className="border border-[#ff5722] text-[#ff5722] px-3 py-1 rounded-full text-sm bg-transparent cursor-pointer recruiter-update-button">
                            Cập nhật hồ sơ
                        </button>
                    </div>

                    {/* Menu Items */}
                    <div className="flex flex-col mt-2 recruiter-menu-items">
                        <Link to="">
                            <button className="flex items-center text-left px-3 py-2 text-base text-gray-800 hover:bg-gray-100 rounded-md recruiter-menu-item">
                                <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-800 recruiter-menu-icon" />
                                Danh mục quản lý
                            </button>
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogoutClick}
                            className="flex items-center text-left px-3 py-2 text-base text-gray-800 hover:bg-gray-100 rounded-md recruiter-menu-item"
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 text-gray-800 recruiter-menu-icon" />
                            Thoát
                        </button>
                    </div>

                    {/* Help Section */}
                    <div className="mt-4 text-left recruiter-help">
                        <a
                            href="#"
                            className="text-sm text-[#0073e6] no-underline flex items-center recruiter-help-link"
                        >
                            <FontAwesomeIcon icon={faQuestionCircle} className="mr-1 recruiter-help-icon" />
                            Tham khảo những câu hỏi thường gặp
                        </a>
                    </div>
                </div>
            )}
        </div>

    );
}
