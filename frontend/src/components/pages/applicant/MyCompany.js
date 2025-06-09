import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import { getId } from '../../../libs/isAuth';
import {
    FaMapMarkerAlt,
    FaGlobe,
    FaInfoCircle,
} from 'react-icons/fa';
import { RiEdit2Fill } from "react-icons/ri";
import { FaBuilding, FaEye, FaUsers, FaTimes, FaStream } from 'react-icons/fa';
import { Eye, XCircle } from 'lucide-react';

const MyCompany = () => {
    const [activeTab, setActiveTab] = useState('followCompany');

    const [companies, setCompanies] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const userId = getId(); // Gọi getId() để lấy userId

        const fetchFollowedCompanies = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/followedcompanies/followed-companies/${userId}`);
                setCompanies(response.data); // Lưu dữ liệu công ty vào state
            } catch (err) {
                setError('There was an error fetching followed companies.');
                console.error(err);
            }
        };

        if (userId) {
            fetchFollowedCompanies();
        }
    }, []);
    // Chạy 1 lần khi component mount

    const handleUnfollow = async (companyId) => {
        const userId = getId(); // Lấy userId từ getId()

        if (!companyId) {
            console.error('Company ID is missing');
            return;
        }

        try {
            // Gửi yêu cầu DELETE để hủy theo dõi công ty
            const response = await axios.delete(`http://localhost:5000/api/followedcompanies/${userId}/${companyId}`);
            const url = `http://localhost:5000/api/followedcompanies/${userId}/${companyId}`;
            console.log('Sending DELETE request to:', url);
            // Nếu thành công, cập nhật lại danh sách công ty đã theo dõi
            setCompanies(prevCompanies => prevCompanies.filter(company => company._id !== companyId));
            alert(response.data.message); // Hiển thị thông báo hủy theo dõi thành công
        } catch (err) {
            console.error(err);
            alert('Error unfollowing company.');
        }
    };

    // Chuyển đổi tab
    const handleTabClick = (tab) => setActiveTab(tab);

    return (
        <>
            <div className="flex flex-col gap-5 w-full">
                <div className='flex gap-5 pb-3'>
                    <FaStream className="w-3 text-gray-700" />
                    <p className="font-semibold text-sm text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>Company Profile</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {companies.length > 0 ? (
                        companies.map(company => (
                            <div key={company?._id} className="rounded-lg">
                                <div className="bg-white rounded-2xl overflow-hidden">
                                    {/* Banner */}
                                    {company?.banner && (
                                        <div className="h-28 w-full overflow-hidden">
                                            <img
                                                src={company?.banner}
                                                alt="Company Banner"
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="p-3 relative">
                                        {/* Logo + Name */}
                                        <div className="flex items-end space-x-4 -mt-6">
                                            {company?.logo && (
                                                <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                                                    <img
                                                        src={company?.logo}
                                                        alt="Company Logo"
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2 group relative">
                                                    <h2 className="text-sm font-semibold text-gray-900">{company?.company_name}</h2>
                                                </div>
                                                <p className="text-xs text-gray-500">{company?.industry}</p>
                                            </div>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="mt-4 flex flex-col gap-4 text-gray-700 text-sm">
                                            {/* Left Column: Address, Size, Website */}
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-2">
                                                    <FaMapMarkerAlt className="mt-1 text-blue-600" />
                                                    <div>
                                                        <p className="font-medium">Địa chỉ:</p>
                                                        <p>{company?.location}</p>
                                                        <p className="text-sm text-gray-500">{company?.specific_address}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2">
                                                    <FaGlobe className="mt-1 text-purple-600" />
                                                    <div>
                                                        <p className="font-medium">Website:</p>
                                                        <a
                                                            href={company?.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 hover:underline break-all"
                                                        >
                                                            {company?.website}
                                                        </a>
                                                    </div>
                                                </div>

                                                <div className="flex items-start">
                                                    <div>
                                                        <p className="font-medium">Giới thiệu:</p>
                                                        <p className="line-clamp-3 text-gray-700">
                                                            {company?.description || 'Chưa có mô tả.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='flex flex-row gap-2 mt-4 mb-1'>
                                            <Link to={`/companies/companydetail/${company._id}`} className="w-1/2 bg-blue-900 text-white hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-semibold justify-center flex items-center text-center gap-1 shadow-sm">
                                                <Eye className="w-4 h-4" />
                                                Xem
                                            </Link>
                                            <button onClick={() => handleUnfollow(company?._id)} className="w-1/2 border border-red-500 hover:border-red-600 text-red-700 px-4 py-2 rounded-full text-sm font-semibold justify-center flex items-center text-center gap-1 shadow-sm">
                                                <XCircle className="w-4 h-4" />
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>You are not following any companies.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default MyCompany;
