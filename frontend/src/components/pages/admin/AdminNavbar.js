import React, { useState, useEffect } from 'react';
import '../../../styles/recruiternavbar.css';
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
        <div className="recruiter-profile">
            {/* User Icon */}
            <div className="recruiter-notification-buttons">
{/**                <button className="recruiter-notification-button">
                    <FontAwesomeIcon icon={faBell} />
                </button>
                <button className="recruiter-notification-button">
                    <FontAwesomeIcon icon={faComments} />
                </button> */}
            </div>
            <div className="recruiter-icon" onClick={toggleMenu}>
                <img src="https://via.placeholder.com/50" alt="User Icon" className="recruiter-image" />
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div className="recruiter-menu">
                    <div className="recruiter-info">
                        <div className='recruiter-info-detail'>
                            <h4 className="recruiter-name">
                                {profile?.first_name} {profile?.last_name || ''}
                            </h4>
                            <p className="recruiter-email">{user?.email}</p>
                        </div>
                        <button className="recruiter-update-button">Cập nhật hồ sơ</button>
                    </div>
                    <div className="recruiter-menu-items">
                        <Link to=''>
                            <button className="recruiter-menu-item">
                                <FontAwesomeIcon icon={faUser} className="recruiter-menu-icon" />
                                Danh mục quản lý
                            </button>
                        </Link>
                        <button className="recruiter-menu-item" type='button' onClick={handleLogoutClick}>
                            <FontAwesomeIcon icon={faSignOutAlt} className="recruiter-menu-icon" />
                            Thoát
                        </button>
                    </div>
                    <div className="recruiter-help">
                        <a href="#" className="recruiter-help-link">
                            <FontAwesomeIcon icon={faQuestionCircle} className="recruiter-help-icon" />
                            Tham khảo những câu hỏi thường gặp
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
