import React, { useState, useEffect } from 'react';
import '../../../styles/ProfilePage.css';
import axios from 'axios';
import { getId } from '../../../libs/isAuth';
import { FaEdit, FaStream } from 'react-icons/fa';  // Import icon chỉnh sửa

const ProfilePage = () => {
    const [user, setUser] = useState('');
    const userId = getId();
    const [applications, setApplications] = useState(3);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);  // Modal cho việc chỉnh sửa thông tin
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [error, setError] = useState(null);

    // Trạng thái lưu trữ thông tin chỉnh sửa
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');

    const isValidPassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra nếu mật khẩu mới và xác nhận mật khẩu không khớp
        if (newPassword !== confirmPassword) {
            alert('Mật khẩu mới và mật khẩu xác nhận không khớp.');
            return;
        }

        // Kiểm tra mật khẩu mới có đúng chuẩn không
        if (!isValidPassword(newPassword)) {
            alert('Mật khẩu phải có ít nhất 8 ký tự, một chữ cái viết hoa, một chữ cái viết thường, một chữ số và một ký tự đặc biệt.');
            return;
        }

        try {
            setLoading(true);
            // Gửi yêu cầu PUT đến API để thay đổi mật khẩu
            const response = await axios.put(`http://localhost:5000/api/users/update-password/${userId}`, {
                oldPassword,
                newPassword,
                confirmPassword,
            });

            setMessage(response.data.message);  // Hiển thị thông báo thành công
            console.log("thong tin mk ", response.data.message)
            alert("Cập nhật mật khẩu thành công!");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setMessage(error.response ? error.response.data.message : 'Lỗi server');
        } finally {
            setLoading(false);
        }
    };

    const handleInfoChange = async () => {
        try {
            setLoading(true);
            const response = await axios.put(`http://localhost:5000/api/users/update-user/${userId}`, {
                username: newUsername,
                email: newEmail,
                phone: newPhone  // Cập nhật số điện thoại
            });
            setUser(response.data); // Cập nhật thông tin người dùng
            setShowInfoModal(false); // Đóng modal
            alert("Cập nhật thông tin thành công!");
            setNewUsername('');
            setNewEmail('');
            setNewPhone('');
            fetchUserProfile();
        } catch (error) {
            console.error('Lỗi khi thay đổi thông tin người dùng:', error);
        }
    };
    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Token is missing, please login again.');
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:5000/api/users/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Failed to fetch user data.');
            setLoading(false);
        }
    };

    const fetchApplicationsCount = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/applications/applications-count/${userId}`);
            setApplications(response.data.count); // Cập nhật số lượng đơn ứng tuyển
        } catch (error) {
            console.error('Lỗi khi lấy số lượng đơn ứng tuyển:', error);
            setError('Không thể tải số lượng đơn ứng tuyển.');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {

        fetchUserProfile();
        fetchApplicationsCount();
    }, []);

    return (
        <>
            <div className="flex flex-col gap-5 w-full">
                <div className='flex gap-5 pb-3'>
                    <FaStream className="w-3 text-gray-700" />
                    <p className="font-semibold text-sm text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>Account Settings</p>
                </div>
                <div class="flex flex-col w-full gap-6">
                    <div className="px-10 py-6 w-full bg-white rounded-lg">
                        <div className="flex flex-col w-full md:flex-row gap-10">
                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-4">
                                {/* Số lượng đơn ứng tuyển */}
                                <div className="bg-white w-full items-center justify-center text-center shadow-md rounded-xl px-6 py-4 border border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Số lượng đơn ứng tuyển</h2>
                                    <div className="text-center">
                                        <p className="text-gray-600">Bạn đã ứng tuyển</p>
                                        <div className='flex gap-2 items-end justify-center'>
                                            <span className="text-4xl font-bold text-blue-600">{applications}</span>
                                            <p className="text-gray-600">đơn</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quyền riêng tư */}
                                <div className="bg-white shadow-md rounded-xl px-6 py-4 border border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Quyền riêng tư</h2>

                                    {/* Toggle 1 */}
                                    <div className="flex items-center gap-4 justify-between mb-4">
                                        <span className="text-gray-700">Cho phép NTD tìm kiếm hồ sơ</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-300 peer-checked:bg-blue-600 transition-all"></div>
                                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform peer-checked:translate-x-full transition-transform"></div>
                                        </label>
                                    </div>

                                    {/* Toggle 2 */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700">Ẩn thông tin cá nhân</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-300 peer-checked:bg-blue-600 transition-all"></div>
                                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform peer-checked:translate-x-full transition-transform"></div>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="w-full px-8 py-2 bg-blue-900 text-white rounded-full hover:bg-blue-700"
                                >
                                    Thay đổi mật khẩu
                                </button>
                            </div>

                            {/* Thông tin cá nhân */}
                            <div className="flex-1 space-y-4 pl-10 border-l border-l-gray-300">
                                <div className="flex justify-between border-b border-b-gray-300 pb-2">
                                    <h3 className="text-lg font-semibold">Thông tin cá nhân</h3>

                                    <button
                                        onClick={() => {
                                            setNewUsername(user.username);
                                            setNewEmail(user.email);
                                            setNewPhone(user.phone || '');
                                            setShowInfoModal(true);
                                        }}
                                        className="flex items-center text-sm text-gray-600 bg-none rounded hover:bg-none"
                                    >
                                        <FaEdit />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Tên người dùng</label>
                                        <p className="mt-1 text-gray-800">{user.username}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Email</label>
                                        <p className="mt-1 text-gray-800">{user.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Số điện thoại</label>
                                        <p className="mt-1 text-gray-800">{user.phone || 'Chưa cập nhật'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Trạng thái</label>
                                        <p className="mt-1 text-gray-800">{user.state}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Ngày tạo</label>
                                        <p className="mt-1 text-gray-800">{new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Ngày cập nhật</label>
                                        <p className="mt-1 text-gray-800">{new Date(user.updated_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Lần cuối đăng nhập</label>
                                        <p className="mt-1 text-gray-800">{new Date(user.last_login).toLocaleDateString()}</p>
                                    </div>
                                </div>


                            </div>
                        </div>

                        {/* Modal đổi mật khẩu */}
                        {showPasswordModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                                <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
                                    <h3 className="text-lg font-semibold">Thay đổi mật khẩu</h3>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                        placeholder="Mật khẩu cũ"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                        placeholder="Mật khẩu mới"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                        placeholder="Xác nhận mật khẩu"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            className="px-4 py-2 bg-gray-300 rounded-2xl hover:bg-gray-400"
                                            onClick={() => {
                                                setShowPasswordModal(false);
                                                setPassword('');
                                                setNewPassword('');
                                                setConfirmPassword('');
                                            }}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-blue-900 text-white rounded-2xl hover:bg-blue-700"
                                            onClick={handleSubmit}
                                        >
                                            Lưu
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Modal chỉnh sửa thông tin */}
                        {showInfoModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                                <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
                                    <h3 className="text-lg font-semibold">Chỉnh sửa thông tin</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Tên người dùng</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Email</label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Số điện thoại</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                            value={newPhone}
                                            onChange={(e) => setNewPhone(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            className="px-4 py-2 bg-gray-300 rounded-2xl hover:bg-gray-400"
                                            onClick={() => {
                                                setShowInfoModal(false);
                                                setNewUsername('');
                                                setNewEmail('');
                                                setNewPhone('');
                                            }}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-blue-900 text-white rounded-2xl hover:bg-blue-700"
                                            onClick={handleInfoChange}
                                        >
                                            Lưu thay đổi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>

    );
};

export default ProfilePage;
