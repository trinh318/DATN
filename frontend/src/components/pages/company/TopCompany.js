import React, { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import '../../../styles/topcompany.css';
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
        <div className='unique-company'>
            <div className='unique-company-search-container'>
                <h2 className='unique-company-search-title'>
                    Khám phá 100.000+ công ty nổi bật
                </h2>
                <p className='unique-company-search-subtitle'>
                    Tra cứu thông tin công ty và tìm kiếm nơi làm việc tốt nhất dành cho bạn
                </p>
                <div className='unique-company-search-bar'>
                    <input
                        type='text'
                        placeholder='Nhập tên công ty'
                        className='unique-company-search-input'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className='unique-company-search-button' onClick={() => handleSearch(searchTerm)}>
                        Tìm kiếm
                    </button>
                </div>
            </div>
            {isAuth() ? (
                <>
                    <div className='unique-company-container'>
                        <h2 className='unique-company-title'>Công ty nổi bật ({allCompanies.length})</h2>
                        <div className='unique-company-grid'>
                            {companies.length > 0 ? (
                                companies.map((company) => (
                                    <div key={company?._id} className='unique-company-card'>
                                        <img src={company?.banner} alt='Company Banner' className='unique-company-banner' />
                                        <div className='unique-company-info'>
                                            <img src={company?.logo} alt='Company Logo' className='unique-company-logo' />
                                            <div className='unique-company-details'>
                                                <Link to={`/companies/companydetail/${company._id}`} className="unique-company-name">
                                                    <h3 className='unique-company-name'>{company.company_name}</h3>
                                                </Link>
                                                <p className='unique-company-followers'>{company?.industry}</p>
                                                {company?.isFollowed ? (
                                                    <button onClick={() => handleUnfollow(company._id)} className='unique-company-follow-button'>Bỏ theo dõi</button>
                                                ) : (
                                                    <button onClick={() => handleFollow(company._id)} className='unique-company-follow-button'>+ Theo dõi</button>
                                                )}
                                            </div>
                                        </div>
                                        <Link to={`/companies/companydetail/${company._id}`} className='unique-company-view-button'>
                                            Xem công ty
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p>Không có công ty nào.</p>
                            )}
                        </div>
                        {/* Nút Xem thêm */}
                        {visibleCompanies < allCompanies.length && (
                            <div className='unique-company-load-more'>
                                <button onClick={handleLoadMore} className='unique-company-load-more-button'>
                                    Xem thêm
                                </button>
                            </div>
                        )}

                    </div>
                </>
            ) : (
                <>
                    <div className='unique-company-container'>
                        <h2 className='unique-company-title'>Công ty nổi bật ({allCompanies.length})</h2>
                        <div className='unique-company-grid'>
                            {companies.length > 0 ? (
                                companies.map((company) => (
                                    <div key={company?._id} className='unique-company-card'>
                                        <img src={company?.banner} alt='Company Banner' className='unique-company-banner' />
                                        <div className='unique-company-info'>
                                            <img src={company?.logo} alt='Company Logo' className='unique-company-logo' />
                                            <div className='unique-company-details'>
                                                <Link to={`/companies/companydetail/${company._id}`} className="unique-company-name">
                                                    <h3 className='unique-company-name'>{company.company_name}</h3>
                                                </Link>
                                                <p className='unique-company-followers'>{company?.industry}</p>
                                                <button onClick={() => handleFollow(company._id)} className='unique-company-follow-button'>+ Theo dõi</button>
                                            </div>
                                        </div>
                                        <Link to={`/companies/companydetail/${company._id}`} className='unique-company-view-button'>
                                            Xem công ty
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p>Không có công ty nào.</p>
                            )}
                        </div>
                        {/* Nút Xem thêm */}
                        {visibleCompanies < allCompanies.length && (
                            <div className='unique-company-load-more'>
                                <button onClick={handleLoadMore} className='unique-company-load-more-button'>
                                    Xem thêm
                                </button>
                            </div>
                        )}

                    </div>
                </>
            )}
        </div>
    );
}
