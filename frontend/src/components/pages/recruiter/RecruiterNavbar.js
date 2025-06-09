import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserTie,
  faBriefcase,
  faMagnifyingGlass,
  faBell,
  faGear,
  faRightFromBracket,
  faFileAlt,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { logout } from "../../../libs/isAuth";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getId } from '../../../libs/isAuth';
import Notification from '../../UI/Notification';

export default function RecruiterNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null); // Lưu trữ dữ liệu người dùng
    const [profile, setProfile] = useState(null); // Lưu trữ dữ liệu người dùng
    const [error, setError] = useState(null); // Lưu trữ lỗi (nếu có)
    const [loading, setLoading] = useState(true);
    const menuRef = useRef(null); // Dùng để tham chiếu đến menu
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
<div className="flex relative gap-2 items-center">
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
      <div className="cursor-pointer" onClick={toggleMenu}>
        <img
          src={user?.avatar || "user.png"}
          alt="User Icon"
          className="w-[50px] h-[50px] rounded-full bg-gray-600"
        />
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute top-[60px] right-0 w-[350px] bg-white shadow-md rounded-lg p-4 z-[1000]"
        >
          {/* User Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <h4 className="text-base font-semibold">
                {profile?.first_name} {profile?.last_name || ""}
              </h4>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <button className="border border-orange-500 text-orange-500 px-3 py-1 rounded-full text-sm hover:bg-orange-50 transition">
              Recruitment Manager
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col mt-2">
            <Link to="/recruiter-page?menu=company_profile">
              <button className="flex items-center px-3 py-2 text-[16px] hover:bg-gray-100 rounded transition text-gray-800 w-full text-left">
                <FontAwesomeIcon icon={faUserTie} className="mr-2 text-gray-800" />
                About Company
              </button>
            </Link>
            <Link to="/recruiter-page?menu=jobs">
              <button className="flex items-center px-3 py-2 text-[16px] hover:bg-gray-100 rounded transition text-gray-800 w-full text-left">
                <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-gray-800" />
                Job Recruitment
              </button>
            </Link>
            <Link to="/recruiter-page?menu=find-applicant">
              <button className="flex items-center px-3 py-2 text-[16px] hover:bg-gray-100 rounded transition text-gray-800 w-full text-left">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2 text-gray-800" />
                Find Applicants
              </button>
            </Link>
            <Link to="/recruiter-page?menu=subscriptions">
              <button className="flex items-center px-3 py-2 text-[16px] hover:bg-gray-100 rounded transition text-gray-800 w-full text-left">
                <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-gray-800" />
                Subscription Plans
              </button>
            </Link>
            <Link to="/recruiter-page?menu=alerts">
              <button className="flex items-center px-3 py-2 text-[16px] hover:bg-gray-100 rounded transition text-gray-800 w-full text-left">
                <FontAwesomeIcon icon={faBell} className="mr-2 text-gray-800" />
                Notifications
              </button>
            </Link>
            <Link to="/recruiter-page?menu=report">
              <button className="flex items-center px-3 py-2 text-[16px] hover:bg-gray-100 rounded transition text-gray-800 w-full text-left">
                <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-gray-800" />
                Reports
              </button>
            </Link>
            <Link to="/recruiter-page?menu=settings">
              <button className="flex items-center px-3 py-2 text-[16px] hover:bg-gray-100 rounded transition text-gray-800 w-full text-left">
                <FontAwesomeIcon icon={faGear} className="mr-2 text-gray-800" />
                Account Settings
              </button>
            </Link>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex items-center px-3 py-2 text-[16px] hover:bg-gray-100 rounded transition text-gray-800 w-full text-left"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="mr-2 text-gray-800" />
              Thoát
            </button>
          </div>
        </div>
      )}
    </div>
    );
}
