import React, { useState, useEffect } from 'react';
import { FaEye, FaUsers, FaChartBar } from 'react-icons/fa';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { AreaChart, PieChart, Pie, Cell, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import '../../../styles/packagemanager.css';
import '../../../styles/companyprofile.css';
import '../../../styles/packagemanager-report.css';


const PackageManager = () => {
    const [activeTab, setActiveTab] = useState('profileView');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [menuIndex, setMenuIndex] = useState(null); // Track which menu is open
    const [packageData, setPackageData] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        postLimit: '',
        benefits: '',
        priority: '',
        status: ''
    });
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const handleTabClick = (tab) => {
        setActiveTab(tab);
        // Reset detail view when changing tabs
        setSelectedCustomer(null);
        setCustomerDetail(null);
        setMenuIndex(null);
        setSelectedCustomer(null);
    };
    const [packages, setPackages] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [monthlyComparison, setMonthlyComparison] = useState([]);
    const [retentionData, setRetentionData] = useState([]);
    const [conversionData, setConversionData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState('');
    const [totalStats, setTotalStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalRevenue: 0,
        totalSubscriptions: 0
    });
    const [packageStats, setPackageStats] = useState({ totalSubscriptions: 0, totalRevenue: 0, activeUsers: 0 });

    const toggleMenu = (index) => {
        if (menuIndex === index) {
            setMenuIndex(null); // Close menu if already open
        } else {
            setMenuIndex(index); // Open menu for the clicked card
        }
    };

    const handleDeletePackage = async (id) => {
        // Xử lý xóa gói đăng ký
        try {
            const confirm = window.confirm("Bạn có chắc chắn muốn ẩn gói này?");
            if (!confirm) return;

            await axios.put(`http://localhost:5000/api/package/deactivate/${id}`);
            alert('Gói đã được ẩn thành công!');
            fetchPackages(); // Cập nhật lại danh sách
        } catch (err) {
            console.error('Lỗi khi xoá gói:', err);
            alert('Xảy ra lỗi khi ẩn gói.');
        }
    };

    const handleUpdatePackage = async (packageId) => {
        // Xử lý cập nhật gói đăng ký
        setPackageData(packageId); // Load dữ liệu gói cần sửa
        setIsEditMode(true);  // Bật chế độ edit
        setActiveTab('followCompany');
    };

    const handleViewPackage = () => {
        // Xem gói đăng ký ở chế độ khách
    };
    const handleSubmitPackage = (e) => {
        if (isEditMode) {
            updatePackage(e);
        } else {
            createPackage(e);
        }
    };

    const updatePackage = async (e) => {
        e.preventDefault();

        if (loading) {
            console.log('Data is still loading...');
            return;
        }
        setLoading(true);

        try {
            await axios.put(`http://localhost:5000/api/package/update/${packageData._id}`, {
                name: packageData.name,
                price: packageData.price,
                duration: packageData.duration,
                description: packageData.description,
                features: packageData.features,
                postLimit: packageData.postLimit,
                status: packageData.status,
                priority: packageData.priority
            });

            alert('Cập nhật gói thành công!');
            setIsEditMode(false); // Quay về chế độ thêm mới
            setPackageData({
                name: '',
                description: '',
                price: '',
                duration: '',
                postLimit: '',
                features: [],
                status: ''
            });
            setActiveTab('profileView'); // Quay lại tab danh sách
        } catch (err) {
            console.error(err);
            alert('Có lỗi xảy ra khi cập nhật gói.');
        } finally {
            setLoading(false);
        }
    };

    const createPackage = async (e) => {
        e.preventDefault(); // Ngừng sự kiện mặc định của form

        if (loading) {
            console.log('Data is still loading...');
            return; // Ngừng gửi yêu cầu nếu dữ liệu vẫn đang được tải
        }
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/package/add', {
                name: packageData.name,
                price: packageData.price,
                duration: packageData.duration,
                description: packageData.description,
                features: packageData.features, // Mảng các quyền lợi đã chọn
                postLimit: packageData.postLimit,
                priority: packageData.priority
            });

            alert('Thêm gói thành công!');
            // Reset form nếu muốn
            setPackageData({
                name: '',
                description: '',
                price: '',
                duration: '',
                postLimit: '',
                features: [],
                status: ''
            });
        } catch (err) {
            console.error(err);
            alert('Có lỗi xảy ra khi thêm gói.');
        } finally {
            setLoading(false);
        }
    }

    const handleInputPackageChange = (e) => {
        setPackageData({ ...packageData, [e.target.name]: e.target.value });
    };
    const fetchPackages = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/package'); // hoặc URL đầy đủ nếu cần
            setPackages(res.data.packages);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách gói:', error);
        } finally {
            setLoading(false);
        }
    };

    const formattedRevenueData = originalData.map(item => ({
        month: `Tháng ${item._id}`,
        revenue: item.totalRevenue
    }));

    const formattedMonthlyComparison = originalData.map((item, index, array) => {
        const currentRevenue = item.totalRevenue;
        const previousRevenue = index > 0 ? array[index - 1].totalRevenue : null;

        const changePercentage = previousRevenue
            ? (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(2)
            : 'N/A';

        return {
            month: `Tháng ${item._id}`,
            revenue: currentRevenue,
            changePercentage
        };
    });


    const fetchRevenueData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/subscription/revenue/monthly');
            const data = response.data;

            // Kiểm tra dữ liệu trả về
            console.log("Dữ liệu doanh thu:", data);

            // Sort data by month
            data.sort((a, b) => a._id - b._id);

            const formatted = data.map(item => ({
                month: `Tháng ${item._id}`,
                revenue: item.totalRevenue || 0, // Đảm bảo có giá trị mặc định
                userCount: item.userCount || 0,
                activeUsers: item.activeUsers || 0
            }));

            // Tính tổng doanh thu chỉ từ các hóa đơn có trạng thái success
            const totalRevenue = formatted.reduce((sum, item) => {
                // Giả sử item.totalRevenue chỉ tính từ các giao dịch có trạng thái success
                return sum + (item.revenue > 0 ? item.revenue : 0);
            }, 0);

            setRevenueData(formatted);

            // Cập nhật tổng doanh thu
            setTotalStats(prev => ({
                ...prev,
                totalRevenue: totalRevenue
            }));
        } catch (error) {
            console.error('Error fetching revenue data:', error);
        }
    };


    const fetchMonthlyComparison = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/subscription/revenue/compare');
            setMonthlyComparison(formattedMonthlyComparison);
            console.log("thong tin ve doanh thu so sanh", response.data)
        } catch (error) {
            console.error('Error fetching monthly comparison:', error);
        }
    };

    const fetchPackageStatusStats = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/subscription/statistics/by-package-status');
            const res = response.data;

            console.log("Trạng thái theo gói:", res);

            // Format the data for the PieChart
            const chartData = res.map(pkg => {
                return pkg.statusCounts.map(stat => ({
                    name: `${pkg._id} - ${stat.status}`,
                    value: stat.count,
                    packageName: pkg._id,
                    status: stat.status,
                    revenue: stat.revenue,
                    activeUsers: stat.activeUsers
                }));
            }).flat();

            setData(chartData);

            // Calculate total stats
            const totalStats = res.reduce((acc, pkg) => {
                const activeCount = pkg.statusCounts.find(s => s.status === 'active')?.count || 0;
                const totalCount = pkg.statusCounts.reduce((sum, s) => sum + s.count, 0);

                acc.totalUsers += totalCount;
                acc.activeUsers += activeCount;
                acc.totalRevenue += pkg.statusCounts.find(s => s.status === 'active')?.revenue || 0;
                acc.totalSubscriptions += pkg.totalCount;
                return acc;
            }, { totalUsers: 0, activeUsers: 0, totalRevenue: 0, totalSubscriptions: 0 });

            setTotalStats(totalStats);

            // Populate available package options
            const packages = [...new Set(res.map(pkg => pkg._id))];
            setSelectedPackage(packages[0]);
        } catch (error) {
            console.error('Error fetching package status stats:', error);
        }
    };

    useEffect(() => {
        if (selectedPackage) {
            const filtered = data.filter(entry => entry.packageName === selectedPackage);
            setFilteredData(filtered);

            // Calculate package-specific stats
            const packageStats = filtered.reduce((acc, entry) => {
                acc.totalSubscriptions += entry.value;
                acc.totalRevenue += entry.revenue;
                acc.activeUsers += entry.activeUsers;
                return acc;
            }, { totalSubscriptions: 0, totalRevenue: 0, activeUsers: 0 });

            setPackageStats(packageStats);
        }
    }, [selectedPackage, data]);

    const [customerList, setCustomerList] = useState([]);
    const [customerPagination, setCustomerPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerStatusFilter, setCustomerStatusFilter] = useState('');
    const [customerSortBy, setCustomerSortBy] = useState('createdAt');
    const [customerSortOrder, setCustomerSortOrder] = useState('desc');

    const fetchCustomerInfo = async (params = {}) => {
        try {
            const response = await axios.get('http://localhost:5000/api/subscription/customers', {
                params: {
                    page: params.page || customerPagination.page,
                    limit: params.limit || customerPagination.limit,
                    search: customerSearch,
                    status: customerStatusFilter,
                    sortBy: customerSortBy,
                    sortOrder: customerSortOrder
                }
            });
            setCustomerList(response.data.data);
            setCustomerPagination(response.data.pagination);
        } catch (error) {
            console.error("Error fetching customer info:", error);
        }
    };

    const [customerDetail, setCustomerDetail] = useState(null);

    const handleViewCustomer = async (customerId) => {
        try {
            // If already viewing this customer's details, close it
            if (selectedCustomer === customerId) {
                setSelectedCustomer(null);
                setCustomerDetail(null);
                return;
            }

            const response = await axios.get(`http://localhost:5000/api/subscription/customers/${customerId}`);
            setCustomerDetail(response.data);
            console.log("chi tiet goi lay duoc la", response.data)
            setSelectedCustomer(customerId);
            // Close all other tabs/menus
            setMenuIndex(null);
            setActiveTab('purchase'); // Force switch to customer tab
        } catch (error) {
            console.error("Error fetching customer detail:", error);
        }
    };

    const fetchRetentionRate = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/subscription/retention-rate');
            const data = response.data;

            // Format data for retention rate chart
            const formattedData = data.monthlyRetention.map(item => ({
                month: `Tháng ${item.month}`,
                retentionRate: parseFloat(item.retentionRate.toFixed(1))
            }));

            setRetentionData(formattedData);

            // Update total stats with overall retention rate
            setTotalStats(prev => ({
                ...prev,
                retentionRate: parseFloat(data.overallRetentionRate.toFixed(1))
            }));
        } catch (error) {
            console.error('Error fetching retention rate:', error);
        }
    };

    const fetchConversionRate = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/subscription/conversion-rate');
            const data = response.data;
            console.log("thong tin ve he so chuyen doi", data)
            // Format data for conversion rate chart
            const formattedData = data.monthlyConversion.map(item => ({
                month: item.month,
                conversionRate: item.conversionRate,
                freeUsers: item.freeUsers,
                conversions: item.conversions
            }));

            setConversionData(formattedData);

            // Update total stats with overall conversion rate
            setTotalStats(prev => ({
                ...prev,
                conversionRate: data.overallConversionRate,
                totalFreeUsers: data.totalStats.totalFreeUsers,
                totalConversions: data.totalStats.totalConversions
            }));
        } catch (error) {
            console.error('Error fetching conversion rate:', error);
        }
    };

    useEffect(() => {
        fetchPackages();
        fetchRevenueData();
        fetchMonthlyComparison();
        fetchPackageStatusStats();
        fetchCustomerInfo();
        fetchRetentionRate();
        fetchConversionRate();
    }, []);

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

    // Function to get a color for each status
    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return '#82ca9d';
            case 'expired':
                return '#8884d8';
            case 'pending':
                return '#ffc658';
            case 'cancelled':
                return '#ff8042';
            default:
                return '#ff8042';
        }

    };

    return (
        <div className="p-6">
            <div className="company-profile-header mb-4">
                <h2 className="text-2xl font-bold">Các gói đăng ký</h2>
            </div>

            <div className="company-profile-container">
                <div className="company-profile-tabs flex gap-4">
                    <button
                        className={`company-profile-tab px-4 py-2 rounded ${activeTab === 'profileView' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => handleTabClick('profileView')}
                    >
                        <FaEye className="inline mr-2" /> Danh sách gói đăng ký
                    </button>

                    <button
                        className={`company-profile-tab px-4 py-2 rounded ${activeTab === 'followCompany' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => handleTabClick('followCompany')}
                    >
                        <FaUsers className="inline mr-2" /> Thêm gói đăng ký
                    </button>
                    <button
                        className={`company-profile-tab px-4 py-2 rounded ${activeTab === 'reportPackage' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => handleTabClick('reportPackage')}
                    >
                        <FaChartBar className="inline mr-2" /> Thống kê
                    </button>
                    <button
                        className={`company-profile-tab px-4 py-2 rounded ${activeTab === 'purchase' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => handleTabClick('purchase')}
                    >
                        <FaChartBar className="inline mr-2" /> Thông tin khách hàng
                    </button>
                </div>
            </div>

            {activeTab === 'profileView' && (
                <div className="company-profile-content followed-companies">
                    <div className="my-job-list">
                        <div className="company-profile-content followed-companies">
                            <div className="user-management-table-container">
                                <table className="user-management-table w-full border mt-6">
                                    <thead>
                                        <tr>
                                            <th>Tên gói</th>
                                            <th>Mô tả</th>
                                            <th>Giá/ Tháng</th>
                                            <th>Thời gian</th>
                                            <th>Số tin đăng</th>
                                            <th>Độ ưu tiên</th>
                                            <th>Quyền lợi</th>
                                            <th>Trạng thái</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {packages.map((pkg, idx) => (
                                            <tr key={pkg._id} className="user-management-row">
                                                <td>{pkg.name}</td>
                                                <td>{pkg.description}</td>
                                                <td>{pkg.price}</td>
                                                <td>{pkg.duration}</td>
                                                <td>{pkg.postLimit}</td>
                                                <td>{pkg.priority}</td>
                                                <td>{pkg.features?.map(f => f.label).join(', ')}</td>
                                                <td>{pkg.status}</td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <FontAwesomeIcon
                                                            icon={faEllipsisV}
                                                            className="my-ellipsis-icon"
                                                            onClick={() => toggleMenu(idx)}
                                                        />
                                                        {menuIndex === idx && (
                                                            <div className="my-menu-dropdown">
                                                                <button onClick={() => handleDeletePackage(pkg._id)}>Ẩn</button>
                                                                <button onClick={() => handleUpdatePackage(pkg)}>Cập nhật</button>
                                                                <button onClick={() => handleViewPackage(pkg._id)}>Xem ở chế độ khách</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'followCompany' && (
                <div className="company-profile-content profile-view">
                    <div className="company-profile-empty-state">
                        <div className="company-profile-edit-basic-info">
                            <div className="company-profile-edit-row">
                                <label htmlFor="name" className="company-profile-edit-label">
                                    Tên gói <span className="company-profile-edit-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={packageData.name}
                                    onChange={handleInputPackageChange}
                                    className="company-profile-edit-input"
                                    placeholder="Nhập tên gói đăng ký"
                                />
                            </div>

                            <div className="company-profile-edit-row">
                                <label htmlFor="description" className="company-profile-edit-label">
                                    Mô tả
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    name="description"
                                    value={packageData.description}
                                    onChange={handleInputPackageChange}
                                    className="company-profile-edit-input"
                                    placeholder="Nhập mô tả gói đăng ký"
                                />
                            </div>

                            <div className="company-profile-edit-row">
                                <label htmlFor="price" className="company-profile-edit-label">
                                    Giá gói (VND) <span className="company-profile-edit-required">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={packageData.price}
                                    onChange={handleInputPackageChange}
                                    className="company-profile-edit-input"
                                    placeholder="Nhập giá gói"
                                />
                            </div>

                            <div className="company-profile-edit-row">
                                <label htmlFor="duration" className="company-profile-edit-label">
                                    Thời gian sử dụng (ngày) <span className="company-profile-edit-required">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="duration"
                                    name="duration"
                                    value={packageData.duration}
                                    onChange={handleInputPackageChange}
                                    className="company-profile-edit-input"
                                    placeholder="Nhập số ngày sử dụng"
                                />
                            </div>

                            <div className="company-profile-edit-row">
                                <label htmlFor="postLimit" className="company-profile-edit-label">
                                    Số lượng tin đăng
                                </label>
                                <input
                                    type="number"
                                    id="postLimit"
                                    name="postLimit"
                                    value={packageData.postLimit}
                                    onChange={handleInputPackageChange}
                                    className="company-profile-edit-input"
                                    placeholder="Nhập số lượng tin đăng tối đa ( -1 để không giới hạn )"
                                />
                            </div>
                            <div className="company-profile-edit-row">
                                <label htmlFor="status" className="company-profile-edit-label">
                                    Trạng thái
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={packageData.status}
                                    onChange={handleInputPackageChange}
                                    className="company-profile-edit-input"
                                >
                                    <option value="active">Kích hoạt</option>
                                    <option value="inactive">Ẩn</option>
                                </select>
                            </div>
                            <div className="company-profile-edit-row">
                                <label htmlFor="priority" className="company-profile-edit-label">
                                    Độ ưu tiên hiển thị
                                </label>
                                <input
                                    type="number"
                                    id="priority"
                                    name="priority"
                                    value={packageData.priority}
                                    onChange={handleInputPackageChange}
                                    className="company-profile-edit-input"
                                    placeholder="Nhập độ ưu tiên (0-10)"
                                />
                            </div>
                            <div className="admin-package-manager-feature-section">
                                <label className="admin-package-manager-feature-title">
                                    Quyền lợi (chức năng)
                                </label>
                                <div className="admin-package-manager-feature-list">
                                    {[
                                        { key: 'post_jobs', label: 'Đăng tin tuyển dụng' },
                                        { key: 'manage_candidates', label: 'Quản lý ứng viên' },
                                        { key: 'view_candidate_profiles', label: 'Xem hồ sơ ứng viên' },
                                        { key: 'highlight_jobs', label: 'Làm nổi bật tin tuyển dụng' },
                                        { key: 'access_resume_database', label: 'Truy cập kho CV' },
                                        { key: 'priority_support', label: 'Hỗ trợ ưu tiên' },
                                        { key: 'analytics_dashboard', label: 'Xem báo cáo, thống kê' },
                                        { key: 'highlight_companys', label: 'Tăng branding công ty' },
                                        { key: 'invite_candidates', label: 'Mời ứng viên tham gia' },
                                        { key: 'job_boost', label: 'Đẩy tin tuyển dụng lên đầu' }
                                    ].map((feature, index) => (
                                        <label key={index} className="admin-package-manager-feature-item">
                                            <input
                                                type="checkbox"
                                                name="features"
                                                value={feature.key}
                                                checked={packageData.features?.some(f => f.key === feature.key)}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    if (isChecked) {
                                                        setPackageData({
                                                            ...packageData,
                                                            features: [...(packageData.features || []), { key: feature.key, label: feature.label }]
                                                        });
                                                    } else {
                                                        setPackageData({
                                                            ...packageData,
                                                            features: (packageData.features || []).filter(f => f.key !== feature.key)
                                                        });
                                                    }
                                                }}
                                                className="admin-package-manager-feature-checkbox"
                                            />
                                            <span className="admin-package-manager-feature-label">{feature.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                    <button className="user-info-edit-save-btn" type="submit" onClick={(e) => handleSubmitPackage(e)}>
                        Lưu
                    </button>
                </div>
            )}
            {activeTab === 'reportPackage' && (
                <div className="packagemanager-report-admin-container mt-6">
                    <h3 className="packagemanager-report-admin-title text-xl font-bold mb-4">Thống kê gói đăng ký</h3>

                    {/* Stats Overview Cards */}
                    <div className="packagemanager-report-admin-stats-grid grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="packagemanager-report-admin-stat-card bg-white p-4 rounded-lg shadow">
                            <h4 className="packagemanager-report-admin-stat-label text-gray-600 text-sm">Tổng số người dùng</h4>
                            <p className="packagemanager-report-admin-stat-value text-2xl font-bold text-blue-600">{totalStats.totalUsers || 0}</p>
                            <span className="packagemanager-report-admin-stat-desc text-sm text-gray-500">Người dùng đã đăng ký</span>
                        </div>
                        <div className="packagemanager-report-admin-stat-card bg-white p-4 rounded-lg shadow">
                            <h4 className="packagemanager-report-admin-stat-label text-gray-600 text-sm">Người dùng đang hoạt động</h4>
                            <p className="packagemanager-report-admin-stat-value text-2xl font-bold text-green-600">{totalStats.activeUsers || 0}</p>
                            <span className="packagemanager-report-admin-stat-desc text-sm text-gray-500">Gói đang sử dụng</span>
                        </div>
                        <div className="packagemanager-report-admin-stat-card bg-white p-4 rounded-lg shadow">
                            <h4 className="packagemanager-report-admin-stat-label text-gray-600 text-sm">Tổng doanh thu</h4>
                            <p className="packagemanager-report-admin-stat-value text-2xl font-bold text-indigo-600">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(totalStats.totalRevenue || 0)}
                            </p>
                        </div>
                        <div className="packagemanager-report-admin-stat-card bg-white p-4 rounded-lg shadow">
                            <h4 className="packagemanager-report-admin-stat-label text-gray-600 text-sm">Tổng số gói đăng ký</h4>
                            <p className="packagemanager-report-admin-stat-value text-2xl font-bold text-purple-600">{totalStats.totalSubscriptions || 0}</p>
                        </div>
                        <div className="packagemanager-report-admin-stat-card bg-white p-4 rounded-lg shadow">
                            <h4 className="packagemanager-report-admin-stat-label text-gray-600 text-sm">Tỷ lệ duy trì khách hàng</h4>
                            <p className="packagemanager-report-admin-stat-value text-2xl font-bold text-emerald-600">
                                {totalStats.retentionRate ? `${totalStats.retentionRate}%` : '0%'}
                            </p>
                            <span className="packagemanager-report-admin-stat-desc text-sm text-gray-500">
                                Khách hàng gia hạn gói
                            </span>
                        </div>
                        <div className="packagemanager-report-admin-stat-card bg-white p-4 rounded-lg shadow">
                            <h4 className="packagemanager-report-admin-stat-label text-gray-600 text-sm">Tỷ lệ chuyển đổi Free-to-Paid</h4>
                            <p className="packagemanager-report-admin-stat-value text-2xl font-bold text-blue-600">
                                {totalStats.conversionRate ? `${totalStats.conversionRate}%` : '0%'}
                            </p>
                            <span className="packagemanager-report-admin-stat-desc text-sm text-gray-500">
                                {totalStats.totalConversions || 0} / {totalStats.totalFreeUsers || 0} người dùng
                            </span>
                        </div>
                    </div>

                    <div className="packagemanager-report-admin-charts-grid grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Package Distribution Chart */}
                        <div className="packagemanager-report-admin-chart-box bg-white p-4 rounded-lg shadow">
                            <h4 className="packagemanager-report-admin-chart-title text-lg font-semibold mb-4">Phân bố gói đăng ký</h4>
                            <div className="packagemanager-report-admin-package-select mb-4">
                                <label htmlFor="package-select" className="packagemanager-report-admin-select-label mr-2">Chọn gói: </label>
                                <select
                                    id="package-select"
                                    value={selectedPackage}
                                    onChange={(e) => setSelectedPackage(e.target.value)}
                                    className="packagemanager-report-admin-select p-2 border rounded"
                                >
                                    {data.length > 0 && [...new Set(data.map(entry => entry.packageName))].map((pkg, index) => (
                                        <option key={index} value={pkg}>{pkg}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="packagemanager-report-admin-chart-container" style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={filteredData}
                                            dataKey="value"
                                            nameKey="name"
                                            outerRadius={100}
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        >
                                            {filteredData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value, name) => [value, name.split(' - ')[1]]} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Revenue Trend Chart */}
                        <div className="packagemanager-report-admin-chart-box bg-white p-4 rounded-lg shadow">
                            <h4 className="packagemanager-report-admin-chart-title text-lg font-semibold mb-4">Xu hướng doanh thu theo tháng</h4>
                            <div className="packagemanager-report-admin-chart-container" style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(value) =>
                                                new Intl.NumberFormat('vi-VN', {
                                                    notation: 'compact',
                                                    compactDisplay: 'short',
                                                    maximumFractionDigits: 1
                                                }).format(value)
                                            }
                                        />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <Tooltip
                                            formatter={(value) =>
                                                new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(value)
                                            }
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#4F46E5"
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                            strokeWidth={2}
                                            name="Doanh thu"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Retention Rate Chart */}
                    <div className="packagemanager-report-admin-chart-box bg-white p-4 rounded-lg shadow mt-6">
                        <h4 className="packagemanager-report-admin-chart-title text-lg font-semibold mb-4">Tỷ lệ duy trì khách hàng theo thời gian</h4>
                        <div className="packagemanager-report-admin-chart-container" style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={retentionData}>
                                    <defs>
                                        <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        domain={[0, 100]}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip
                                        formatter={(value) => [`${value}%`, 'Tỷ lệ duy trì']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="retentionRate"
                                        stroke="#10B981"
                                        fillOpacity={1}
                                        fill="url(#colorRetention)"
                                        strokeWidth={2}
                                        name="Tỷ lệ duy trì"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Conversion Rate Chart */}
                    <div className="packagemanager-report-admin-chart-box bg-white p-4 rounded-lg shadow mt-6">
                        <h4 className="packagemanager-report-admin-chart-title text-lg font-semibold mb-4">Tỷ lệ chuyển đổi Free-to-Paid theo thời gian</h4>
                        <div className="packagemanager-report-admin-chart-container" style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={conversionData}>
                                    <defs>
                                        <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        domain={[0, 100]}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip
                                        formatter={(value, name, props) => {
                                            const key = props.dataKey;
                                            if (key === 'conversionRate') return [`${value}%`, 'Tỷ lệ chuyển đổi'];
                                            if (key === 'freeUsers') return [value, 'Người dùng free'];
                                            if (key === 'conversions') return [value, 'Số lượt chuyển đổi'];
                                            return [value, key];
                                        }}
                                        labelFormatter={(label) => `Tháng ${label}`}
                                    />

                                    <Area
                                        type="monotone"
                                        dataKey="conversionRate"
                                        stroke="#3B82F6"
                                        fillOpacity={1}
                                        fill="url(#colorConversion)"
                                        strokeWidth={2}
                                        name="Tỷ lệ chuyển đổi"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="freeUsers"
                                        stroke="#10B981"
                                        fill="none"
                                        strokeDasharray="5 5"
                                        name="Người dùng free"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="conversions"
                                        stroke="#6366F1"
                                        fill="none"
                                        strokeDasharray="5 5"
                                        name="Số lượt chuyển đổi"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Package Details Table */}
                    <div className="packagemanager-report-admin-table-container mt-6 bg-white p-4 rounded-lg shadow">
                        <h4 className="packagemanager-report-admin-table-title text-lg font-semibold mb-4">Chi tiết theo gói</h4>
                        <table className="packagemanager-report-admin-table w-full">
                            <thead>
                                <tr className="packagemanager-report-admin-table-header text-left border-b">
                                    <th className="packagemanager-report-admin-table-th p-2">Tên gói</th>
                                    <th className="packagemanager-report-admin-table-th p-2">Số người dùng</th>
                                    <th className="packagemanager-report-admin-table-th p-2">Đang hoạt động</th>
                                    <th className="packagemanager-report-admin-table-th p-2">Doanh thu</th>
                                    <th className="packagemanager-report-admin-table-th p-2">Tỷ lệ chuyển đổi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 && [...new Set(data.map(entry => entry.packageName))].map((packageName, index) => {
                                    const packageData = data.filter(entry => entry.packageName === packageName);
                                    const totalUsers = packageData.reduce((sum, entry) => sum + entry.value, 0);
                                    const activeUsers = packageData.find(entry => entry.status === 'active')?.value || 0;
                                    const revenue = packageData.reduce((sum, entry) => sum + (entry.revenue || 0), 0);
                                    const conversionRate = ((activeUsers / totalUsers) * 100).toFixed(1);

                                    return (
                                        <tr key={index} className="packagemanager-report-admin-table-row border-b">
                                            <td className="packagemanager-report-admin-table-td p-2">{packageName}</td>
                                            <td className="packagemanager-report-admin-table-td p-2">{totalUsers}</td>
                                            <td className="packagemanager-report-admin-table-td p-2">{activeUsers}</td>
                                            <td className="packagemanager-report-admin-table-td p-2">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(revenue)}
                                            </td>
                                            <td className="packagemanager-report-admin-table-td p-2">{conversionRate}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {activeTab === 'purchase' && (
                <div className="company-profile-content followed-companies">

                    <div className="user-management-table-container">
                        <table className="user-management-table w-full border">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Gói</th>
                                    <th>Giá (VND)</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày bắt đầu</th>
                                    <th>Ngày hết hạn</th>
                                    <th>Giao dịch gần nhất</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {customerList.map((customer, idx) => (
                                    <tr key={customer.id}>
                                        <td>{customer.username}</td>
                                        <td>{customer.email}</td>
                                        <td>{customer.phone}</td>
                                        <td>{customer.packageName}</td>
                                        <td>{customer.price.toLocaleString()} VND</td>
                                        <td>
                                            <span className={`status-badge ${customer.status}`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td>{new Date(customer.startDate).toLocaleDateString()}</td>
                                        <td>{new Date(customer.endDate).toLocaleDateString()}</td>
                                        <td>
                                            {customer.lastTransaction && (
                                                <div className="transaction-info">
                                                    <div className="transaction-type">{customer.lastTransaction.type}</div>
                                                    <div className="transaction-amount">{customer.lastTransaction.amount.toLocaleString()} VND</div>
                                                    <div className="transaction-date">{new Date(customer.lastTransaction.completedAt).toLocaleDateString()}</div>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <FontAwesomeIcon
                                                icon={faEllipsisV}
                                                className="my-ellipsis-icon"
                                                onClick={() => toggleMenu(idx)}
                                            />
                                            {menuIndex === idx && (
                                                <div className="my-menu-dropdown">
                                                    <button onClick={() => handleViewCustomer(customer.id)}>
                                                        {selectedCustomer === customer.id ? 'Ẩn' : 'Xem chi tiết'}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="pagination flex justify-center gap-2 mt-4">
                            {Array.from({ length: customerPagination.totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => fetchCustomerInfo({ page: i + 1 })}
                                    className={`px-3 py-1 rounded ${customerPagination.page === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {selectedCustomer && customerDetail && (
                <div className="user-info-edit-overlay">
                    <div className="user-info-edit-container">
                        {/* Header */}
                        <div className="user-info-edit-header-form">
                            <div className="user-info-edit-header">
                                <h2>Chi tiết khách hàng</h2>
                                <button
                                    className="user-info-edit-close-btn"
                                    onClick={() => {
                                        setSelectedCustomer(null);
                                        setCustomerDetail(null);
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="user-info-edit-form">
                            <div className="user-info-edit-row">
                                <label className="user-info-edit-label">Username</label>
                                <input
                                    type="text"
                                    className="user-info-edit-input"
                                    value={customerDetail.user.username}
                                    readOnly
                                />
                            </div>

                            <div className="user-info-edit-row">
                                <label className="user-info-edit-label">Email</label>
                                <input
                                    type="text"
                                    className="user-info-edit-input"
                                    value={customerDetail.user.email}
                                    readOnly
                                />
                            </div>

                            <div className="user-info-edit-row">
                                <label className="user-info-edit-label">Số điện thoại</label>
                                <input
                                    type="text"
                                    className="user-info-edit-input"
                                    value={customerDetail.user.phone}
                                    readOnly
                                />
                            </div>

                            <div className="user-info-edit-row">
                                <label className="user-info-edit-label">Vai trò</label>
                                <input
                                    type="text"
                                    className="user-info-edit-input"
                                    value={customerDetail.user.role}
                                    readOnly
                                />
                            </div>

                            <div className="user-info-edit-section">
                                <h3 className="user-info-edit-section-title">Thông tin gói hiện tại</h3>
                                <div className="user-info-edit-row">
                                    <label className="user-info-edit-label">Tên gói</label>
                                    <input
                                        type="text"
                                        className="user-info-edit-input"
                                        value={customerDetail.currentPackage.name}
                                        readOnly
                                    />
                                </div>
                                <div className="user-info-edit-row">
                                    <label className="user-info-edit-label">Giá</label>
                                    <input
                                        type="text"
                                        className="user-info-edit-input"
                                        value={`${customerDetail.currentPackage.price.toLocaleString()} VND`}
                                        readOnly
                                    />
                                </div>
                                <div className="user-info-edit-row">
                                    <label className="user-info-edit-label">Thời hạn</label>
                                    <input
                                        type="text"
                                        className="user-info-edit-input"
                                        value={`${customerDetail.currentPackage.duration} ngày`}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="user-info-edit-section">
                                <h3 className="user-info-edit-section-title">Thống kê sử dụng</h3>
                                <div className="stats-grid">
                                    <div className="stats-item">
                                        <div className="stats-label">Tổng tin đăng</div>
                                        <div className="stats-value">{customerDetail.currentPackage.usageStats.totalJobPosts}</div>
                                    </div>
                                    <div className="stats-item">
                                        <div className="stats-label">Tin đang hoạt động</div>
                                        <div className="stats-value">{customerDetail.currentPackage.usageStats.activeJobPosts}</div>
                                    </div>
                                    <div className="stats-item">
                                        <div className="stats-label">Hồ sơ đã xem</div>
                                        <div className="stats-value">{customerDetail.currentPackage.usageStats.viewedProfiles}</div>
                                    </div>
                                    <div className="stats-item">
                                        <div className="stats-label">Tuyển dụng thành công</div>
                                        <div className="stats-value">{customerDetail.currentPackage.usageStats.successfulHires}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="user-info-edit-section">
                                <h3 className="user-info-edit-section-title">Lịch sử giao dịch</h3>

                                <div className="transaction-history-table-wrapper">
                                    <table className="transaction-history-table">
                                        <thead>
                                            <tr>
                                                <th>STT</th>
                                                <th>Loại giao dịch</th>
                                                <th>Số tiền</th>
                                                <th>Trạng thái</th>
                                                <th>Ngày hoàn tất</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customerDetail.transactionHistory.map((trans, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{trans.type}</td>
                                                    <td>{trans.amount.toLocaleString()} VND</td>
                                                    <td>{trans.status}</td>
                                                    <td>{new Date(trans.completedAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="user-info-edit-button-row">
                            <button
                                className="user-info-edit-cancel-btn"
                                onClick={() => {
                                    setSelectedCustomer(null);
                                    setCustomerDetail(null);
                                }}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PackageManager;
