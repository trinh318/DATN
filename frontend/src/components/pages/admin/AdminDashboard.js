import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserCircle,
    faTachometerAlt,
    faFileAlt,
    faBuilding,
    faBriefcase,
    faBell,
    faCog,
    faPlus,
    faUser,
    faFolder,
    faFontAwesome

} from '@fortawesome/free-solid-svg-icons';
import { FaBuilding, FaEye, FaUsers, FaTimes } from 'react-icons/fa';
import '../../../styles/recruiterdashboard.css';
import axios from 'axios';
import { getId } from '../../../libs/isAuth';
import UserManagement from './UserManagement';
import Report from './Report';
import ContentModerationList from './ContentModerationList';
import CategoryManager from './CategoryManager';
import PackageManager from './PackageManager';

const AdminDashboard = () => {
    const [user, setUser] = useState(null); // Lưu trữ dữ liệu người dùng
    const [profile, setProfile] = useState(null); // Lưu trữ dữ liệu người dùng
    const [error, setError] = useState(null); // Lưu trữ lỗi (nếu có)
    const [loading, setLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('dashboard'); // Trạng thái theo dõi menu đang chọn

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

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

    const renderContent = () => {
        switch (activeMenu) {
            case 'company_profile':
                return <UserManagement />
            case 'content_loderation_list':
                return <ContentModerationList />
            case 'category_manager':
                return <CategoryManager />
            case 'package_manager':
                return <PackageManager />

            default:
                return <Report />;
        }
    };

    return (
        <div className="recruiter-dashboard-container">
            <aside className={`recruiter-dashboard-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className='recruiter-dashboard-profile-toggle'>
                    {!isCollapsed && (
                        <div className="recruiter-dashboard-profile">
                            <div className="recruiter-dashboard-user-info">
                                <img src={user?.avatar} className="recruiter-dashboard-avatar-icon" />
                                <h3 className="recruiter-dashboard-name">{profile?.first_name} {profile?.last_name}</h3>
                                <p className="recruiter-dashboard-role">{user?.email}</p>
                            </div>
                        </div>
                    )}
                    <button
                        className="recruiter-dashboard-toggle"
                        onClick={toggleSidebar}
                        style={{ width: isCollapsed ? '100%' : '20%' }}
                    >
                        {isCollapsed ? '>' : '<'}
                    </button>
                </div>
                <nav className="recruiter-dashboard-menu">
                    <a
                        href="#"
                        className={`recruiter-dashboard-menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('dashboard')}
                    >
                        <FontAwesomeIcon icon={faTachometerAlt} />
                        {!isCollapsed && <span>Tổng Quan</span>}
                    </a>
                    <a
                        href="#"
                        className={`recruiter-dashboard-menu-item ${activeMenu === 'company_profile' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('company_profile')}
                    >
                        <FontAwesomeIcon icon={faUser} />
                        {!isCollapsed && <span>Quản lý người dùng</span>}
                    </a>
                    <a
                        href="#"
                        className={`recruiter-dashboard-menu-item ${activeMenu === 'content_loderation_list' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('content_loderation_list')}
                    >
                        <FontAwesomeIcon icon={faFileAlt} />
                        {!isCollapsed && <span>Kiểm duyệt nội dung</span>}
                    </a>
                    <a
                        href="#"
                        className={`recruiter-dashboard-menu-item ${activeMenu === 'category_manager' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('category_manager')}
                    >
                        <FontAwesomeIcon icon={faFolder} />
                        {!isCollapsed && <span>Danh mục nghề nghiệp</span>}
                    </a>
                    <a
                        href="#"
                        className={`recruiter-dashboard-menu-item ${activeMenu === 'package_manager' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('package_manager')}
                    >
                        <FontAwesomeIcon icon={faFontAwesome} />
                        {!isCollapsed && <span>Gói đăng ký</span>}
                    </a>
                </nav>
            </aside>
            <main className="recruiter-dashboard-content">
                {renderContent()} {/* Hiển thị nội dung dựa trên menu */}
            </main>
        </div>
    );
};

export default AdminDashboard;
