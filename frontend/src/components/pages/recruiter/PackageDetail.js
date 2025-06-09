import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../../../styles/packagedetail.css"; // Nhớ tạo file css này
import { getId } from '../../../libs/isAuth';
import { toast } from 'react-hot-toast';
import { Check, Download } from 'lucide-react';
import { X, Loader2 } from 'lucide-react';
import { CheckCircle, XCircle, Star } from 'lucide-react'
import { GiCheckMark } from "react-icons/gi";
import { BsFillCalendar2DateFill } from "react-icons/bs";
import { MdPostAdd } from "react-icons/md";
import { FaCartArrowDown } from "react-icons/fa6";
import { FaRedoAlt, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { SiNow } from 'react-icons/si';

const plans = [
    {
        title: 'Free',
        price: '$00.00',
        per: '/per user',
        button: 'Download',
        features: [
            'Customizable workspace',
            'Personal Apps Integration',
            'Multi-account Support',
        ],
        updates: 'Lifetime Updates at no cost',
        color: 'bg-white',
        buttonStyle: 'bg-blue-600 text-white hover:bg-blue-700',
        icon: <Download size={16} className="mr-2" />,
    },
    {
        title: 'Standard',
        originalPrice: '$99.00',
        discount: '50% off',
        price: '$49.50',
        per: '/per user',
        button: 'Buy Now',
        features: [
            'Customizable workspace',
            'Personal Apps Integration',
            'Multi-account Support',
        ],
        updates: 'Lifetime Updates at $10/year',
        color: 'bg-blue-900 text-white',
        discountStyle: 'bg-green-600',
        buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
        icon: <Check size={16} className="mr-2" />,
    },
    {
        title: 'Premium',
        originalPrice: '$399.00',
        discount: '75% off',
        price: '$99.99',
        per: '/per user',
        button: 'Buy Now',
        features: [
            'Customizable workspace',
            'Personal Apps Integration',
            'Multi-account Support',
            'Email Templates',
            'LinkedIn Lookup',
        ],
        updates: 'Lifetime Updates at $20/year',
        color: 'bg-white',
        discountStyle: 'bg-yellow-300 text-yellow-900',
        buttonStyle: 'bg-blue-600 text-white hover:bg-blue-700',
        icon: <Check size={16} className="mr-2" />,
        hasUserSelector: true,
    },
];
// Thêm base URL cho API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function PackageDetail() {
    const { id: paramId } = useParams();
    const id = paramId ?? "680c83e98f1b3b023e9a8899";
    const navigate = useNavigate();
    const [packageData, setPackageData] = useState(null);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('momo');
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [paymentType, setPaymentType] = useState('new');
    const [transactionStatus, setTransactionStatus] = useState(null);
    const [trialLoading, setTrialLoading] = useState(false);
    const userId = getId();

    const featureList = [
        { key: 'post_jobs', label: 'Đăng tin tuyển dụng' },
        { key: 'manage_candidates', label: 'Quản lý ứng viên' },
        { key: 'view_candidate_profiles', label: 'Xem hồ sơ ứng viên' },
        { key: 'highlight_jobs', label: 'Làm nổi bật tin tuyển dụng' },
        { key: 'access_resume_database', label: 'Truy cập kho CV' },
        { key: 'priority_support', label: 'Hỗ trợ ưu tiên' },
        { key: 'analytics_dashboard', label: 'Xem báo cáo, thống kê' },
        { key: 'highlight_companys', label: 'Tăng branding công ty' },
        { key: 'invite_candidates', label: 'Mời ứng viên tham gia ứng tuyển' },
        { key: 'job_boost', label: 'Đẩy tin tuyển dụng lên đầu' },
    ];

    // Fetch thông tin subscription hiện tại
    useEffect(() => {
        const fetchCurrentSubscription = async () => {
            if (!userId) return;

            try {
                const response = await axios.get(`${API_BASE_URL}/api/payment/current-package/${userId}`);
                if (response.data && response.data.subscription) {
                    setCurrentSubscription(response.data.subscription);
                }
            } catch (error) {
                setCurrentSubscription(null);

                if (error.response?.status === 404) {
                    const errorCode = error.response.data.code;
                    switch (errorCode) {
                        case 'USER_NOT_FOUND':
                            setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
                            break;
                        case 'NO_ACTIVE_SUBSCRIPTION':
                            // Don't set error, just show the no subscription banner
                            break;
                        case 'SUBSCRIPTION_NOT_FOUND':
                            setError("Không tìm thấy thông tin gói dịch vụ. Vui lòng liên hệ hỗ trợ.");
                            break;
                        case 'SUBSCRIPTION_EXPIRED':
                            //                            setError("Gói dịch vụ của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng.");
                            break;
                        default:
                            setError(error.response.data.message || "Có lỗi xảy ra khi tải thông tin gói dịch vụ.");
                    }
                } else {
                    setError("Có lỗi xảy ra khi tải thông tin gói dịch vụ. Vui lòng thử lại sau.");
                }
            }
        };

        fetchCurrentSubscription();
    }, [userId]);

    // Fetch danh sách gói
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/package/view`);
                setPackages(res.data.packages);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách gói:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    // Fetch chi tiết gói
    useEffect(() => {
        const fetchPackageDetail = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/package/view/${id}`);
                setPackageData(res.data.package);
            } catch (err) {
                console.error(err);
                setError("Không thể tải thông tin gói dịch vụ.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPackageDetail();
        }
    }, [id]);

    // Thêm useEffect để kiểm tra trạng thái giao dịch
    useEffect(() => {
        const checkTransactionStatus = async () => {
            const urlParams = new URLSearchParams(window.location.hash.substring(1));
            const orderId = urlParams.get('orderId');

            if (orderId) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/payment/check-order/${orderId}`);
                    setTransactionStatus(response.data);

                    // Nếu giao dịch thành công, cập nhật lại thông tin subscription
                    if (response.data.status === 'active') {
                        const subResponse = await axios.get(`${API_BASE_URL}/api/payment/current-package/${userId}`);
                        setCurrentSubscription(subResponse.data.subscription);
                    }
                } catch (error) {
                    console.error('Lỗi khi kiểm tra trạng thái giao dịch:', error);
                }
            }
        };

        checkTransactionStatus();
    }, [userId]);

    const renderPackageStatus = () => {
        if (!currentSubscription) return null;

        const { packageStatus, currentPackage, endDate } = currentSubscription;
        if (!packageStatus) return null;

        return (
            <div className="package-status-info">
                <h4>Package Status</h4>
                <div className="current-tier">
                    <p><strong>Current Package:</strong> {currentPackage.name}</p>
                    <p><strong>Status:</strong> {packageStatus.currentTier}</p>
                    {packageStatus.previousTier && (
                        <p><strong>Previous Package:</strong> {packageStatus.previousTier}</p>
                    )}
                    <p><strong>Valid Until:</strong> {new Date(endDate).toLocaleDateString()}</p>
                </div>
                {packageStatus.changeHistory.length > 0 && (
                    <div className="change-history">
                        <h5>Recent Changes</h5>
                        {packageStatus.changeHistory.slice(-3).map((change, index) => (
                            <div key={index} className="change-entry">
                                <p>{change.reason}</p>
                                <small>{new Date(change.changeDate).toLocaleDateString()}</small>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const handlePayment = async () => {
        try {
            let endpoint = 'create-payment';
            let requestData = {
                packageId: id,
                userId: userId,
                subscriptionType: 'monthly'
            };

            if (paymentType === 'upgrade') {
                endpoint = 'upgrade-subscription';
                requestData = {
                    userId: userId,
                    newPackageId: id
                };
            } else if (paymentType === 'renew') {
                endpoint = 'renew-subscription';
                requestData = {
                    userId: userId,
                    packageId: id
                };
            } else if (paymentType === 'downgrade') {
                endpoint = 'downgrade-subscription';
                requestData = {
                    userId: userId,
                    newPackageId: id
                };
                console.log("thong tin id goi ha cap", id);
            }

            const response = await axios.post(`${API_BASE_URL}/api/payment/${endpoint}`, requestData);
            const data = response.data;

            if (data?.payUrl) {
                localStorage.setItem('lastTransaction', JSON.stringify({
                    orderId: data.orderId,
                    type: paymentType,
                    timestamp: Date.now()
                }));

                window.location.href = data.payUrl;
            } else if (paymentType === 'downgrade') {
                // Trường hợp downgrade không có payUrl (nếu bạn thiết kế logic như vậy)
                alert(`Hạ cấp sẽ có hiệu lực sau khi gói hiện tại hết hạn vào ngày ${new Date(data.effectiveDate).toLocaleDateString()}`);
                window.location.reload();
            }


        } catch (error) {
            console.error('Error:', error);
            if (error.response?.data?.error) {
                alert(error.response.data.error);
            } else {
                alert('An error occurred while processing the request');
            }
            setShowPaymentModal(false);
        }
    };

    const handleActionClick = (type) => {
        setPaymentType(type);
        setShowPaymentModal(true);
    };

    const canUpgrade = (currentPackage, targetPackage) => {
        if (!currentPackage || !targetPackage) return false;
        return targetPackage.price > currentPackage.price;
    };

    const canDowngrade = (currentPackage, targetPackage) => {
        if (!currentPackage || !targetPackage) return false;
        return targetPackage.price < currentPackage.price;
    };

    const isCurrentPackage = (targetPackageId) => {
        if (!currentSubscription || !currentSubscription.currentPackage) {
            return false;
        }

        // Lấy ID từ currentPackage
        const currentId = currentSubscription.currentPackage.packageId?._id ||
            currentSubscription.currentPackage.packageId ||
            currentSubscription.currentPackageId;

        console.log('Package comparison:', {
            targetPackageId,
            currentId: typeof currentId === 'object' ? currentId._id : currentId,
            isMatch: (typeof currentId === 'object' ? currentId._id : currentId) === targetPackageId
        });

        // So sánh ID, xử lý cả trường hợp currentId là object
        return (typeof currentId === 'object' ? currentId._id : currentId) === targetPackageId;
    };

    const getDaysRemaining = () => {
        if (!currentSubscription || !currentSubscription.endDate) return 0;
        const now = new Date();
        const endDate = new Date(currentSubscription.endDate);
        return Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    };

    const renderActionButtons = () => {
        if (!packageData || !packageData._id) {
            console.log('No package data available');
            return null;
        }

        console.log('Current package data:', {
            packageId: packageData._id,
            subscription: currentSubscription?.currentPackage,
            currentPackageId: currentSubscription?.currentPackage?.packageId
        });

        if (!currentSubscription) {
            return (
                <button onClick={() => handleActionClick('new')} className="payment-button">
                    Đăng ký gói
                </button>
            );
        }

        const daysRemaining = getDaysRemaining();

        // Nếu đây là gói hiện tại
        if (isCurrentPackage(packageData._id)) {
            return (
                <div className="current-package-info">
                    <div className="current-package-badge">
                        <span className="check-icon">✓</span>
                        Bạn đang sử dụng gói này
                    </div>
                    {daysRemaining <= 7 && (
                        <button
                            onClick={() => handleActionClick('renew')}
                            className="payment-button renew"
                        >
                            Gia hạn gói (còn {daysRemaining} ngày)
                        </button>
                    )}
                </div>
            );
        }

        // Nếu là gói khác
        const buttons = [];
        if (canUpgrade(currentSubscription.currentPackage, packageData)) {
            buttons.push(
                <button
                    key="upgrade"
                    onClick={() => handleActionClick('upgrade')}
                    className="payment-button upgrade"
                >
                    Nâng cấp lên gói này
                </button>
            );
        } else if (canDowngrade(currentSubscription.currentPackage, packageData)) {
            buttons.push(
                <button
                    key="downgrade"
                    onClick={() => handleActionClick('downgrade')}
                    className="payment-button downgrade"
                >
                    Hạ cấp xuống gói này
                </button>
            );
        }

        return <div className="action-buttons">{buttons}</div>;
    };

    // Render transaction status
    const renderTransactionStatus = () => {
        if (!transactionStatus) return null;

        return (
            <div className={`transaction-status ${transactionStatus.status}`}>
                <h4>Trạng thái giao dịch</h4>
                <p>
                    {transactionStatus.status === 'active' ? 'Thanh toán thành công' :
                        transactionStatus.status === 'pending' ? 'Đang xử lý' :
                            transactionStatus.status === 'failed' ? 'Thanh toán thất bại' :
                                'Đã hủy'}
                </p>
                {transactionStatus.transaction && (
                    <div className="transaction-details">
                        <p>Mã giao dịch: {transactionStatus.transaction.transId}</p>
                        <p>Số tiền: {transactionStatus.transaction.amount?.toLocaleString()} VNĐ</p>
                        <p>Thời gian: {new Date(transactionStatus.transaction.completedAt).toLocaleString()}</p>
                    </div>
                )}
            </div>
        );
    };

    const handleTrialSubscription = async () => {
        try {
            setTrialLoading(true);

            const response = await axios.post('http://localhost:5000/api/subscription/trial', {
                userId,
                packageId: packageData._id
            });

            alert("Đăng ký dùng thử thành công!");
            navigate('/recruiter-page');
        } catch (error) {
            console.error('Error starting trial:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký dùng thử');
        } finally {
            setTrialLoading(false);
        }
    };

    if (loading) {
        return <div className="package-detail-loading">Đang tải...</div>;
    }

    if (error) {
        return <div className="package-detail-error">{error}</div>;
    }

    if (!packageData) {
        //        return <div className="package-detail-no-data">Không tìm thấy dữ liệu.</div>;
    }

    return (
        <div className="flex flex-col">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {error && <div className="bg-red-100 text-red-600 p-4 rounded mb-6">{error}</div>}

                {renderPackageStatus()}

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold">Choose your plan</h1>
                    <p className="text-gray-500 mt-2">Join thousands of users benefiting from our premium plans</p>
                    <div className="inline-flex mt-6 bg-gray-100 p-1 rounded-full">
                        <button className="px-20 py-2 text-gray-700 rounded-full hover:bg-white transition">Subscribe today!</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {packages.map((pkg, index) => {
                        const daysRemaining = getDaysRemaining();
                        const isCurrent = isCurrentPackage(pkg._id);
                        const isFree = pkg.price === 0;
                        const isPopular = [1, 3].includes(index);

                        return (
                            <div
                                key={pkg._id}
                                onClick={() => navigate(`/package/${pkg._id}`)}
                                className={`relative w-full p-6 rounded-2xl transition-transform transform hover:-translate-y-1 shadow-md hover:shadow-xl cursor-pointer
                                ${isPopular ? 'bg-blue-900 text-white' : 'bg-white text-black'}`}
                            >
                                {/* Title */}
                                <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                                <p className="text-sm mb-2">{pkg.description}</p>

                                {/* Price */}
                                <div className="flex items-center space-x-2 mb-4 text-3xl">
                                    {isFree ? (
                                        <span>00.00 VND</span>
                                    ) : (
                                        <>
                                            <span className="font-bold">{pkg.price?.toLocaleString()} VND</span>
                                            <span className={`text-sm ml-1 ${isPopular ? 'text-blue-200' : 'text-gray-500'}`}>/per user</span>
                                        </>
                                    )}
                                </div>

                                {/* CTA Button */}
                                <div className="text-center mb-3">
                                    {isFree ? (
                                        <button className="w-full flex items-center justify-center font-semibold py-2 rounded mt-2 border border-blue-600 hover:border-blue-700">
                                            <Check className="w-4 h-4 mr-2" /> Try Now
                                        </button>
                                    ) : isCurrent ? (
                                        daysRemaining <= 7 ? (
                                            <button
                                                className="w-full flex items-center justify-center font-semibold py-2 rounded mt-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                                                onClick={() => handleActionClick('renew')}
                                            >
                                                <FaRedoAlt size={16} className="mr-2" /> Gia hạn gói (còn {daysRemaining} ngày)
                                            </button>
                                        ) : (
                                            <button
                                                className="w-full flex items-center justify-center font-semibold py-2 rounded mt-2 text-white bg-[#C26BFF] hover:bg-[#C26BFF] cursor-not-allowed"
                                                disabled
                                            >
                                                <SiNow size={16} className="mr-2" /> Your Current Plan
                                            </button>
                                        )
                                    ) : canUpgrade(currentSubscription?.currentPackage, pkg) ? (
                                        <button
                                            className="w-full flex items-center justify-center font-semibold py-2 rounded mt-2 bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleActionClick('upgrade')}
                                        >
                                            <FaArrowUp size={16} className="mr-2" /> Nâng cấp
                                        </button>
                                    ) : canDowngrade(currentSubscription?.currentPackage, pkg) ? (
                                        <button
                                            className="w-full flex items-center justify-center font-semibold py-2 rounded mt-2 bg-orange-500 hover:bg-orange-600 text-white"
                                            onClick={() => handleActionClick('downgrade')}
                                        >
                                            <FaArrowDown size={16} className="mr-2" /> Hạ cấp
                                        </button>
                                    ) : (
                                        <button
                                            className={`w-full flex items-center justify-center font-semibold py-2 rounded mt-2 ${isPopular
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                }`}
                                            onClick={() => handleActionClick('new')}
                                        >
                                            <FaCartArrowDown size={16} className="mr-2" /> Buy Now
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1 mb-4 items-start justify-center text-sm">
                                    <p className="flex gap-3">
                                        <BsFillCalendar2DateFill className="w-4 h-4" />
                                        {pkg?.duration} days
                                    </p>
                                    <p className="flex gap-3">
                                        <MdPostAdd className="w-4 h-4" />
                                        {pkg?.postLimit === -1 ? " Không giới hạn" : pkg?.postLimit} posts
                                    </p>
                                </div>

                                {/* Feature list */}
                                <div className="flex flex-col gap-2">
                                    <p className="font-semibold text-base">Features</p>
                                    <ul className={`space-y-2 mb-6 text-sm ${isPopular ? 'text-white' : 'text-gray-700'}`}>
                                        {featureList.map((feature) => {
                                            const hasFeature = pkg.features?.some((f) => f.key === feature.key);
                                            return (
                                                <li key={feature.key} className="flex items-center gap-2">
                                                    {hasFeature ? (
                                                        <GiCheckMark className="w-4 h-4 text-blue-600" />
                                                    ) : (
                                                        <X className={`w-4 h-4 ${isPopular ? 'text-red-500' : 'text-red-600'}`} />
                                                    )}
                                                    <span>{feature.label}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>


            </div>
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">
                            {paymentType === 'upgrade'
                                ? 'Nâng cấp gói'
                                : paymentType === 'renew'
                                    ? 'Gia hạn gói'
                                    : paymentType === 'downgrade'
                                        ? 'Hạ cấp gói'
                                        : 'Đăng ký gói mới'}
                        </h3>

                        <div
                            className={`border rounded p-3 flex items-center cursor-pointer mb-4 ${selectedMethod === 'momo' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                                }`}
                            onClick={() => setSelectedMethod('momo')}
                        >
                            <input
                                type="radio"
                                checked={selectedMethod === 'momo'}
                                readOnly
                                className="mr-3"
                            />
                            <label className="flex items-center">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                                    alt="MoMo"
                                    className="w-8 h-8 mr-2"
                                />
                                Thanh toán qua MoMo
                            </label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handlePayment}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}
{/**            <div className="package-detail-container">
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {renderPackageStatus()}

                <div className="package-detail-list">
                    {packages.map((pkg) => (
                        <div
                            key={pkg._id}
                            className={`package-card ${isCurrentPackage(pkg._id) ? 'current-package' : ''}`}
                            onClick={() => navigate(`/package/${pkg._id}`)}
                        >
                            <div className="package-card-header">
                                <h3>{pkg.name}</h3>
                                {isCurrentPackage(pkg._id) && <span className="current-badge">Gói hiện tại</span>}
                            </div>
                            <p>{pkg.description}</p>
                            <p className="package-price">{pkg.price?.toLocaleString()} VNĐ</p>
                        </div>
                    ))}
                </div>

                <div className="package-card-detail">
                    <div className="package-header">
                        <h2>{packageData?.name}</h2>
                        {isCurrentPackage(id) && <span className="current-package-badge">Gói hiện tại của bạn</span>}
                    </div>

                    <div className="package-body">
                        <p className="package-description">{packageData?.description}</p>
                        <p><strong>Thời hạn:</strong> {packageData?.duration} ngày</p>
                        <p>
                            <strong>Số lượng tin đăng tuyển mỗi tháng: </strong>
                            {packageData?.postLimit === -1 ? " Không giới hạn" : packageData?.postLimit}
                        </p>

                        <div className="price-section">
                            <span className="price-label">Giá gói:</span>
                            <span className="price-amount">{packageData?.price?.toLocaleString()} VNĐ</span>
                        </div>

                        <table className="feature-table">
                            <tbody>
                                {featureList.map((feature) => (
                                    <tr key={feature.key}>
                                        <td>{feature.label}</td>
                                        <td>
                                            {packageData?.features?.some(f => f.key === feature.key) ? (
                                                <span className="check-icon">✅</span>
                                            ) : (
                                                <span className="cross-icon">❌</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {renderTransactionStatus()}

                        <div className="package-footer">
                            {packageData?.name === 'Trial' ? (
                                <button
                                    className={`trial-button ${trialLoading ? 'loading' : ''}`}
                                    onClick={handleTrialSubscription}
                                    disabled={trialLoading}
                                >
                                    {trialLoading ? 'Đang xử lý...' : 'Dùng thử miễn phí'}
                                </button>
                            ) : (
                                <div className="payment-section">
                                    {renderActionButtons()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

{/**                {showPaymentModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>
                                {paymentType === 'upgrade' ? 'Nâng cấp gói' :
                                    paymentType === 'renew' ? 'Gia hạn gói' :
                                        paymentType === 'downgrade' ? 'Hạ cấp gói' :
                                            'Đăng ký gói mới'}
                            </h3>

                            <div
                                className={`payment-option ${selectedMethod === 'momo' ? 'selected' : ''}`}
                                onClick={() => setSelectedMethod('momo')}
                            >
                                <input type="radio" name="payment" checked={selectedMethod === 'momo'} readOnly />
                                <label>Thanh toán qua MoMo</label>
                                <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="payment-logo" />
                            </div>

                            <div className="modal-actions">
                                <button onClick={() => setShowPaymentModal(false)} className="cancel-button">Hủy</button>
                                <button onClick={handlePayment} className="confirm-button">Xác nhận</button>
                            </div>
                        </div>
                    </div>
                )} *
            </div>
             */}