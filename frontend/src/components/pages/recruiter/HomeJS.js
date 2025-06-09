import React, { useEffect, useState } from 'react';
import { FaFileAlt, FaBriefcase, FaBell, FaCog, FaUsers, FaPlus, FaBook, FaChartLine } from 'react-icons/fa';
import { HiOutlinePuzzlePiece } from "react-icons/hi2";
import axios from 'axios';
import { getId } from '@/libs/isAuth';
import { useLocation, Link } from 'react-router-dom';
import CompanyProfile from '@/components/pages/recruiter/CompanyProfile';
import JobRecruitment from '@/components/pages/recruiter/JobRecruitment';
import JobNotificationManager from '@/components/UI/JobNotificationManager';
import FindApplicant from '@/components/pages/recruiter/FindApplicant';
import CreateTest from '@/components/pages/recruiter/CreateTest';
import TestList from '@/components/pages/recruiter/TestList';
import ProfilePage from '@/components/pages/recruiter/ProfilePage';
import OverviewReview from '@/components/pages/recruiter/OverviewReview';
import Header from '@/components/UI/Header';
import Hahaha from './f';
import Package from './Package';
import ReportReviewCopy from './ReportReviewCopy';
import Report from './Report';

export default function HomeJS() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const [activeMenu, setActiveMenu] = useState('company_profile');
    const userId = getId();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Token is missing, please login again.');
                    setLoading(false);
                    return;
                }

                const [userRes, profileRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/users/me', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`http://localhost:5000/api/profiles/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setUser(userRes.data);
                setProfile(profileRes.data || { first_name: 'Chưa cập nhật', last_name: '' });
                console.log(profileRes.data);
            } catch (err) {
                setError('Failed to fetch user data.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const renderContent = () => {
        switch (activeMenu) {
            case 'company_profile': return <CompanyProfile />;
            case 'jobs': return <JobRecruitment />;
            case 'hahaha': return <Hahaha />;
            case 'find-applicant': return <FindApplicant />;
            case 'subscriptions': return <Package />;
            case 'alerts': return <JobNotificationManager />;
            case 'settings': return <ProfilePage />;
            case 'report': return <Report />; 
            default: return <CompanyProfile />;
        }
    };

    const menuItems = [
        { key: 'company_profile', label: 'About Company', icon: <FaFileAlt /> },
        { key: 'jobs', label: 'Job Recruitment', icon: <FaBriefcase /> },
        { key: 'find-applicant', label: 'Find Applicants', icon: <FaUsers /> },
        { key: 'subscriptions', label: 'Subscription Plans', icon: <HiOutlinePuzzlePiece /> },
        { key: 'alerts', label: 'Notifications', icon: <FaBell /> },
        { key: 'report', label: 'Reports', icon: <FaChartLine /> },
        { key: 'settings', label: 'Account Settings', icon: <FaCog /> },
        { key: 'hahaha', label: 'hahaha', icon: <FaBriefcase /> },
    ];

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const menu = params.get('menu') || 'company_profile';
        setActiveMenu(menu);
    }, [location.search]);

    return (
        <div>
            <Header />
            <div className="flex h-[calc(100vh-60px)] font-sans">
                {/* Sidebar */}
                <div className="bg-gray-50 h-full">
                    <aside className="bg-[#213A57] text-white w-60 flex flex-col h-full items-stretch">
                        <div className="h-44 w-full top-0">
                            <div className="text-center p-4 pb-2 w-full">
                                <img src={user?.avatar || "user.png"} alt="avatar" className="w-[100px] h-[100px] mx-auto rounded-full object-cover" />
                                <h3 className="font-bold text-sm mt-2">{profile?.first_name} {profile?.last_name}</h3>
                                <p className="text-xs text-gray-300">{user?.email}</p>
                            </div>
                        </div>
                        <div className=" pb-8 pl-5 overflow-y-scroll scrollbar-hide">
                            <nav className="flex flex-col">
                                {menuItems.map((item, index) => {
                                    const activeIndex = menuItems.findIndex(m => m.key === activeMenu);
                                    const isActive = item.key === activeMenu;
                                    const isTop = index === activeIndex + 1;
                                    const isBottom = index === activeIndex - 1;

                                    return (
                                        <MenuItems
                                            key={item.key}
                                            icon={item.icon}
                                            label={item.label}
                                            active={isActive}
                                            roundedTop={isTop}
                                            roundedBottom={isBottom}
                                            to={`?menu=${item.key}`}
                                            onClick={() => setActiveMenu(item.key)}
                                        />
                                    );
                                })}
                            </nav>
                        </div>
                    </aside> 
                </div>

                {/* Main Content */}
                <main className="flex-1 bg-[#213A57] p-0 h-full w-full overflow-hidden">
                    <div className="pl-7 pr-5 pt-5 pb-5 bg-gray-50 h-full w-full rounded-tl-[28px] rounded-bl-[28px] overflow-y-auto">
                        {loading ? <p>Loading...</p> : error ? <p>{error}</p> : renderContent()}

                    </div>
                </main>
            </div>
        </div>
    );
}

function MenuItems({ icon, label, active = false, roundedTop = false, roundedBottom = false, to, onClick }) {
    return (
        <div className="relative w-full group">
            <div className="absolute inset-0 z-30 pointer-events-none"></div>
            {/* Góc trên bên phải */}
            {roundedTop && (
                <>
                    <div className="absolute top-0 right-0 w-6 h-6 bg-gray-50 z-10 pointer-events-none"></div>
                    <div className={`
                        absolute top-0 right-0 w-6 h-6 rounded-tr-full z-20 
                        ${active ? 'bg-[#213A57]' : 'bg-[#213A57] group-hover:bg-[#14919B]'}
                    `}></div>
                </>
            )}

            {/* Góc dưới bên phải */}
            {roundedBottom && (
                <>
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-gray-50 z-10 pointer-events-none"></div>
                    <div className={`
                        absolute bottom-0 right-0 w-6 h-6 rounded-br-full z-20 
                        ${active ? 'bg-[#213A57]' : 'bg-[#213A57] group-hover:bg-[#14919B]'}
                    `}></div>
                </>
            )}

            {/* Nav item chính */}
            <Link
                to={to}
                onClick={onClick}
                className={`
                    relative flex items-center gap-3 h-14 pl-5 pr-2 py-2 w-full
                    ${active ? 'bg-gray-50 text-[#213A57] font-semibold z-40' : 'bg-[#213A57] text-gray-300 group-hover:bg-[#14919B]'}
                    rounded-l-full cursor-pointer
                `}
            >
                <div className={`text-lg w-6 text-center ${active ? 'text-[#213A57]' : ''}`}>
                    {icon}
                </div>
                <span className="whitespace-nowrap">{label}</span>
            </Link>
        </div>
    );
}
