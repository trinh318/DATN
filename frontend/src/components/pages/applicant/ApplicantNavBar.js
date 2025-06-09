import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBuilding, faBriefcase, faBell, faCogs, faSignOutAlt, faCalendarAlt, faComments } from '@fortawesome/free-solid-svg-icons';
import { logout } from "../../../libs/isAuth";
import { Link, useNavigate } from 'react-router-dom';
import Notification from "../../UI/Notification";
import axios from 'axios';

export default function ApplicantNavBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null); // Lưu trữ dữ liệu người dùng
    const [error, setError] = useState(null); // Lưu trữ lỗi (nếu có)
    const [loading, setLoading] = useState(true);
    const menuRef = useRef(null); // Dùng để tham chiếu đến menu

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

                const response = await axios.get('http://localhost:5000/api/users/me', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Gửi token trong header
                    },
                });

                setUser(response.data); // Lưu dữ liệu người dùng
                setLoading(false);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to fetch user data.');
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const navigate = useNavigate();

    const handleLogoutClick = () => {
        logout();
        navigate('/');
    };

    // Xử lý đóng menu khi nhấn ra ngoài
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        // Thêm listener vào document
        document.addEventListener('mousedown', handleOutsideClick);

        // Dọn dẹp khi component bị unmount
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    return (
        <div className="relative flex gap-2 items-center">
            {/* Notification Buttons */}
            <div className="flex gap-2">
                <button className="w-[50px] h-[50px] rounded-full bg-[#ecf5f3] flex items-center justify-center hover:bg-[#cceaea] transition">
                    <Notification />
                </button>
{/**                <button className="w-[50px] h-[50px] rounded-full bg-[#ecf5f3] flex items-center justify-center hover:bg-[#cceaea] transition">
                    <FontAwesomeIcon icon={faComments} className="text-[#0A7075] text-xl" />
                </button> */}
            </div>

            {/* User Icon */}
            <div className="cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <img
                    src={user?.avatar}
                    alt="User Icon"
                    className="w-[50px] h-[50px] rounded-full bg-gray-600 object-cover"
                />
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div
                    ref={menuRef}
                    className="absolute top-[60px] right-0 w-[350px] bg-white shadow-lg rounded-lg p-4 z-50"
                >
                    {/* User Info */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                            <h4 className="text-base font-bold">{user?.username}</h4>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                        <button className="border border-orange-500 text-orange-500 px-3 py-1 rounded-full text-sm hover:bg-orange-50 transition">
                            My Profile
                        </button>
                    </div>

                    {/* Menu Items */}
                    <div className="flex flex-col space-y-1">
                        <Link to="/applicant-dashboard?menu=profile">
                            <button className="flex items-center w-full text-left px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md transition">
                                <FontAwesomeIcon icon={faUser} className="mr-3 text-gray-700" />
                                My Profile
                            </button>
                        </Link>
                        <Link to="/applicant-dashboard?menu=company">
                            <button className="flex items-center w-full text-left px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md transition">
                                <FontAwesomeIcon icon={faBuilding} className="mr-3 text-gray-700" />
                                My Companies
                            </button>
                        </Link>
                        <Link to="/applicant-dashboard?menu=jobs">
                            <button className="flex items-center w-full text-left px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md transition">
                                <FontAwesomeIcon icon={faBriefcase} className="mr-3 text-gray-700" />
                                My Jobs
                            </button>
                        </Link>
                        <Link to="/applicant-dashboard?menu=alerts">
                            <button className="flex items-center w-full text-left px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md transition">
                                <FontAwesomeIcon icon={faBell} className="mr-3 text-gray-700" />
                                Notifications
                            </button>
                        </Link>
                        <Link to="/applicant-dashboard?menu=appointment">
                            <button className="flex items-center w-full text-left px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md transition">
                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-3 text-gray-700" />
                                Appointment Schedules
                            </button>
                        </Link>
                        <Link to="/applicant-dashboard?menu=settings">
                            <button className="flex items-center w-full text-left px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md transition">
                                <FontAwesomeIcon icon={faCogs} className="mr-3 text-gray-700" />
                                Account Settings
                            </button>
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogoutClick}
                            className="flex items-center w-full text-left px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md transition"
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 text-gray-700" />
                            Thoát
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
