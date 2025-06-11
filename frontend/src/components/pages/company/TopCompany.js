import React, { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import axios from 'axios';
import { getId, isAuth } from '../../../libs/isAuth';

export default function TopCompany() {
    const { companyId } = useParams();
    const [visibleCompanies, setVisibleCompanies] = useState(15);
    const [companies, setCompanies] = useState([]); // Danh sách công ty
    const [allCompanies, setAllCompanies] = useState([]); // Danh sách công ty gốc
    const [all, setAll] = useState([]); // Danh sách công ty gốc
    const [error, setError] = useState(null);  // State cho thông báo lỗi
    const [loading, setLoading] = useState(true);  // Declare loading state
    const [searchTerm, setSearchTerm] = useState(''); // Lưu chuỗi tìm kiếm
    const [search, setSearch] = useState(false);

    const handleFollow = async (companyId) => {
        try {
            const token = localStorage.getItem('token');  // Lấy token từ localStorage

            if (!token) {
                alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
                return;
            }

            const response = await axios.post(
                'http://localhost:5000/api/followedcompanies',
                { company_id: companyId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 201) {
                setAllCompanies((prev) =>
                    prev.map((company) =>
                        company._id === companyId ? { ...company, isFollowed: true } : company
                    )
                );
                alert('Công ty đã được theo dõi!');
            }
        } catch (err) {
            if (err.response) {
                const { status, data } = err.response;

                if (status === 401) {
                    alert(data.message || 'Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
                }
                else {
                    alert(data.message || 'Không thể theo dõi công ty. Vui lòng thử lại.');
                }
            }
        }
    };

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
            setAllCompanies((prev) =>
                prev.map((company) =>
                    company._id === companyId ? { ...company, isFollowed: false } : company
                )
            );
            alert(response.data.message); // Hiển thị thông báo hủy theo dõi thành công
        } catch (err) {
            console.error(err);
            alert('Error unfollowing company.');
        }
    };

    const userId = getId();

    useEffect(() => {
        const fetchData = async () => {
            if (isAuth()) {
                try {
                    setLoading(true);

                    // Tải đồng thời danh sách tất cả các công ty và danh sách công ty đã theo dõi
                    const [allCompaniesResponse, followedCompaniesResponse] = await Promise.all([
                        axios.get('http://localhost:5000/api/companies'),
                        axios.get(`http://localhost:5000/api/followedcompanies/followed-companies/${userId}`)
                    ]);

                    const allCompanies = allCompaniesResponse.data;
                    const followedCompanies = followedCompaniesResponse.data;

                    setAll(followedCompaniesResponse.data);
                    // Đánh dấu các công ty đã được theo dõi
                    const updatedCompanies = allCompanies.map((company) => ({
                        ...company,
                        isFollowed: followedCompanies.some((followed) => followed._id === company._id),
                    }));

                    setAllCompanies(updatedCompanies);
                    setCompanies(updatedCompanies.slice(0, visibleCompanies)); // Chỉ hiển thị số lượng công ty ban đầu
                } catch (error) {
                    console.error('Error fetching data:', error);
                    setError('Lỗi khi tải dữ liệu.');
                } finally {
                    setLoading(false);
                }
            }
        };

        // Lấy tất cả các công ty
        const fetchAllCompanies = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/companies');
                setAllCompanies(response.data);
                setCompanies(response.data.slice(0, visibleCompanies)); // Chỉ hiển thị số lượng công ty ban đầu
            } catch (error) {
                console.error('Error fetching all companies:', error);
                setError('Không thể tải danh sách công ty.');
            }
        };

        fetchData();
        fetchAllCompanies();
    }, [userId, visibleCompanies]);

    const handleSearch = async (searchTerm) => {
        setSearch(true);

        try {
            setVisibleCompanies(15);

            const response = await axios.get(`http://localhost:5000/api/companies/search-company/search`, {
                params: { name: searchTerm },
            });

            if (response.status === 200) {
                setAllCompanies(response.data); // Cập nhật danh sách công ty với kết quả tìm kiếm
                setCompanies(response.data.slice(0, visibleCompanies)); // Chỉ hiển thị số lượng công ty ban đầu
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setError('Không tìm thấy công ty nào.');
            } else {
                setError('Lỗi khi tìm kiếm công ty.');
            }
        }
    };

    // Hàm để tăng số lượng công ty hiển thị
    // Tăng số lượng công ty hiển thị
    const handleLoadMore = () => {
        setVisibleCompanies((prev) => {
            const newCount = prev + 9;
            setCompanies(allCompanies.slice(0, newCount)); // Cập nhật danh sách hiển thị
            return newCount;
        });
    };

    return (
        <>
            <div className="flex flex-col items-center">
                <div className="w-full px-5 sm:px-10 py-10 text-left shadow-md bg-[repeating-linear-gradient(45deg,_#2c3e50,_#2c3e50_130px,_rgba(20,120,130,0.9)_230px,_rgba(20,120,130,0.9)_360px,_rgba(44,140,150,0.6)_460px,_rgba(44,140,150,0.6)_590px,_rgba(70,140,150,0.4)_690px,_rgba(70,140,150,0.4)_720px)]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Khám phá 100.000+ công ty nổi bật
                    </h2>
                    <p className="text-sm text-[#e3e5e7] mb-6">
                        Tra cứu thông tin công ty và tìm kiếm nơi làm việc tốt nhất dành cho bạn
                    </p>
                    <div className="flex items-center gap-2 max-w-3xl">
                        <input
                            type="text"
                            placeholder="Nhập tên công ty"
                            className="flex-1 border border-gray-300 rounded-full px-4 py-3 text-base outline-none placeholder:text-gray-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            onClick={() => handleSearch(searchTerm)}
                            className="bg-[#2f9a9e] hover:bg-[#228b7d] text-white px-6 py-3 rounded-full transition"
                        >
                            Tìm kiếm
                        </button>
                    </div>
                </div>

                <div className="w-[90%] py-5 bg-white">
                    <h2 className="text-2xl font-semibold text-gray-800 my-6">
                        Công ty nổi bật ({allCompanies.length})
                    </h2>

                    <div className="flex flex-wrap gap-5">
                        {companies.length > 0 ? (
                            companies.map((company) => (
                                <div
                                    key={company?._id}
                                    className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.33%-13.33px)] bg-white shadow-md flex flex-col justify-between"
                                >
                                    <img
                                        src={company?.banner}
                                        alt="Company Banner"
                                        className="w-full h-[150px] object-cover"
                                    />
                                    <div className="flex items-center p-3">
                                        <img
                                            src={company?.logo}
                                            alt="Company Logo"
                                            className="w-[100px] h-[100px] object-contain mr-3"
                                        />
                                        <div className="flex-1">
                                            <Link
                                                to={`/companies/companydetail/${company._id}`}
                                                className="text-base font-bold text-gray-900 hover:no-underline"
                                            >
                                                {company.company_name}
                                            </Link>
                                            <p className="text-sm text-gray-500 mt-1">{company?.industry}</p>
                                            {isAuth() && (
                                                <>
                                                    {company?.isFollowed ? (
                                                        <button
                                                            onClick={() => handleUnfollow(company._id)}
                                                            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                                        >
                                                            Bỏ theo dõi
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleFollow(company._id)}
                                                            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                                        >
                                                            + Theo dõi
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <Link
                                        to={`/companies/companydetail/${company._id}`}
                                        className="text-center mx-3 mb-3 border border-[#ff4500] text-[#ff4500] hover:border-[#ab0303] px-4 py-2 rounded"
                                    >
                                        Xem công ty
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p>Không có công ty nào.</p>
                        )}
                    </div>

                    {visibleCompanies < allCompanies.length && (
                        <div className="text-center mt-6">
                            <button
                                onClick={handleLoadMore}
                                className="w-[200px] px-5 py-3 bg-[#5383b6] text-white rounded hover:bg-[#20539b] transition"
                            >
                                Xem thêm
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
