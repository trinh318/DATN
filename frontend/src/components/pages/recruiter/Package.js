import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getId } from '../../../libs/isAuth';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    CalendarDays,
    CalendarCheck,
    CreditCard,
    DollarSign,
    BadgeCheck,
    TrendingUp,
    Eye,
    Users,
    BadgeDollarSign,
    ListChecks,
    Package2,
} from "lucide-react";
import { FaBuilding, FaEye, FaUsers, FaTimes, FaStream } from 'react-icons/fa';
import { FaEdit } from 'react-icons/fa';  // Import icon chỉnh sửa
import { Link, useNavigate } from 'react-router-dom'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Package = () => {
    const navigation = useNavigate()
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = getId();

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/api/payment/subscriptions/${userId}`);

                if (response.data.success) {
                    setSubscriptions(response.data.data);
                    console.log('thong tin la', response.data.data);
                } else {
                    setError(response.data.message);
                }
            } catch (error) {
                console.error('Error fetching subscriptions:', error);
                setError(error.response?.data?.message || 'Không thể tải thông tin gói dịch vụ');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchSubscriptions();
        } else {
            setError('Vui lòng đăng nhập để xem thông tin gói dịch vụ');
            setLoading(false);
        }
    }, [userId]);

    {/**    const formatDate = (date) => {
        if (!date) return 'N/A';
        return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });
    }; */}

    {/**    const getStatusText = (status) => {
        switch (status) {
            case 'active':
                return 'Đang hoạt động';
            case 'expired':
                return 'Đã hết hạn';
            case 'pending':
                return 'Đang xử lý';
            default:
                return status;
        }
    }; */}

    {/**    const getStatusClass = (status) => {
        switch (status) {
            case 'active':
                return 'package-status-active';
            case 'expired':
                return 'package-status-expired';
            case 'pending':
                return 'package-status-pending';
            default:
                return '';
        }
    }; */}

    if (loading) {
        return (
            <div className="package-loading">
                <div className="package-loading-spinner"></div>
                <p>Đang tải thông tin gói dịch vụ...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="package-error">
                <h3>Lỗi</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
        );
    }

    if (!subscriptions.length) {
        return (
            <>
                <div className="col-span-2 flex flex-col items-center justify-between bg-white px-4 py-6 text-center font-bold rounded-t-xl">
                    <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                        <Package2 size={20} />
                        Bạn chưa đăng ký gói dịch vụ nào
                    </h2>
                    <span
                        className="text-sm font-semibold px-3 py-1 rounded-full"
                    >
                        Hãy đăng ký gói dịch vụ để bắt đầu tuyển dụng
                    </span>
                    <Link to={"/package"} className="hover:text-blue-600">Đăng ký gói dịch vụ</Link>
                </div>
            </>
        );
    }
 
    const getStatusClass = (status) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-700";
            case "expired":
                return "bg-red-100 text-red-700";
            case "pending":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "active":
                return "Đang hoạt động";
            case "expired":
                return "Hết hạn";
            case "pending":
                return "Đang xử lý";
            default:
                return status;
        }
    };

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString("vi-VN");

    return (
        <>
            <div className='flex gap-5 pb-8'>
                <FaStream className="w-3 text-gray-700" />
                <p className="font-semibold text-sm text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>Subscription Plan</p>
            </div>
            {subscriptions.map((subscription) => (
                <>
                    <div className="col-span-2 flex items-center justify-between bg-white text-[#ffffff] px-4 py-6 text-center font-bold rounded-t-xl">
                        <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                            <Package2 size={20} />
                            {subscription.package?.name || "Gói dịch vụ"}
                        </h2>
                        <div className='flex gap-4 justify-center items-center'>
                            <span
                                className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusClass(
                                    subscription.status
                                )}`}
                            >
                                {getStatusText(subscription.status)}
                            </span>
                            <button
                                onClick={() => navigation(`/package?id=${subscription?.package?._id}`)}
                                className="flex items-center justify-center py-1 px-3 text-sm font-bold text-white bg-blue-900 rounded-full hover:bg-blue-700"
                            >
                                <FaEdit />
                            </button>
                        </div>
                    </div>
                    <div
                        key={subscription._id}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-6 bg-white rounded-b-xl border-t border-t-gray-200 h-[calc(100vh-228px)]"
                    >

                        {/* Cột trái: Thông tin gói */}
                        <div className="space-y-4">
                            <div className="text-sm text-gray-700 space-y-2">
                                <div className="flex items-center gap-2">
                                    <CalendarDays size={16} className="text-blue-500" />
                                    <span>Ngày bắt đầu:</span>
                                    <span className="ml-auto">{formatDate(subscription.startDate)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarCheck size={16} className="text-blue-500" />
                                    <span>Ngày kết thúc:</span>
                                    <span className="ml-auto">{formatDate(subscription.endDate)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ListChecks size={16} className="text-blue-500" />
                                    <span>Loại gói:</span>
                                    <span className="ml-auto capitalize">
                                        {subscription.subscriptionType === "monthly"
                                            ? "Hàng tháng"
                                            : subscription.subscriptionType === "yearly"
                                                ? "Hàng năm"
                                                : subscription.subscriptionType}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BadgeCheck size={16} className="text-blue-500" />
                                    <span>Tự động gia hạn:</span>
                                    <span className="ml-auto">
                                        {subscription.autoRenew ? "Có" : "Không"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 font-semibold text-green-600">
                                    <DollarSign size={16} />
                                    <span>Tổng tiền:</span>
                                    <span className="ml-auto">
                                        {subscription.totalAmount?.toLocaleString()} VND
                                    </span>
                                </div>
                            </div>

                            {subscription.package?.features && (
                                <div>
                                    <h3 className="text-base font-semibold text-blue-700 mb-2 flex items-center gap-2">
                                        <ListChecks size={16} />
                                        Tính năng bao gồm
                                    </h3>
                                    <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                                        {subscription.package.features.map((feature, idx) => (
                                            <li key={feature._id || idx}>{feature.label}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Cột phải: Thống kê và giao dịch */}
                        <div className="space-y-6">
                            {/* Thống kê */}
                            <div>
                                <h3 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                                    <TrendingUp size={16} />
                                    Thống kê sử dụng
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-gray-500 flex items-center gap-1">
                                            <Package2 size={14} /> Tin đăng
                                        </p>
                                        <p className="font-semibold text-blue-700">
                                            {subscription.package?.postLimit === -1
                                                ? "Không giới hạn"
                                                : `${subscription.usageStats?.activeJobPosts || 0}/${subscription.package?.postLimit || 0
                                                }`}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <p className="text-gray-500 flex items-center gap-1">
                                            <Eye size={14} /> Hồ sơ đã xem
                                        </p>
                                        <p className="font-semibold text-green-700">
                                            {subscription.usageStats?.viewedProfiles || 0}
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded-lg">
                                        <p className="text-gray-500 flex items-center gap-1">
                                            <Users size={14} /> Đã tuyển dụng
                                        </p>
                                        <p className="font-semibold text-purple-700">
                                            {subscription.usageStats?.successfulHires || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Giao dịch */}
                            {subscription.transactions?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
                                        <CreditCard size={16} />
                                        Lịch sử giao dịch
                                    </h3>
                                    <div className="space-y-3 text-sm overflow-y-auto max-h-[calc(100vh-430px)] pr-1">
                                        {subscription.transactions.map((transaction, idx) => (
                                            <div
                                                key={idx}
                                                className="rounded-md p-3 bg-gray-50 space-y-1"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span
                                                        className={`text-xs font-medium px-2 py-1 rounded ${transaction.status === "success"
                                                            ? "bg-green-100 text-green-700"
                                                            : transaction.status === "pending"
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {transaction.status === "success"
                                                            ? "Thành công"
                                                            : transaction.status === "pending"
                                                                ? "Đang xử lý"
                                                                : "Thất bại"}
                                                    </span>
                                                    <span>{formatDate(transaction.completedAt)}</span>
                                                </div>
                                                <p>
                                                    <strong>Mã giao dịch:</strong> {transaction.transId}
                                                </p>
                                                <p>
                                                    <strong>Mã đơn hàng:</strong> {transaction.orderId}
                                                </p>
                                                <p>
                                                    <strong>Số tiền:</strong>{" "}
                                                    {transaction.amount.toLocaleString()} VND
                                                </p>
                                                <p>
                                                    <strong>Phương thức:</strong>{" "}
                                                    {transaction.paymentMethod.toUpperCase()}
                                                </p>
                                                <p>
                                                    <strong>Loại giao dịch:</strong>{" "}
                                                    {transaction.type === "new"
                                                        ? "Đăng ký mới"
                                                        : transaction.type === "upgrade"
                                                            ? "Nâng cấp"
                                                            : transaction.type === "renewal"
                                                                ? "Gia hạn"
                                                                : transaction.type === "downgrade"
                                                                    ? "Hạ cấp"
                                                                    : transaction.type}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ))}
        </>
    );
};

export default Package;
