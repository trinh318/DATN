import React, { useState, useEffect } from 'react';
import '../../styles/bestcompany.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function BestCompany() {
    const companies = [
        { logo: 'path/to/logo1.png', name: 'VAS', industry: 'Giáo dục', jobCount: 5 },
        { logo: 'path/to/logo2.png', name: 'WA PROJECTS LIMITED', industry: 'Xây dựng', jobCount: 3 },
        { logo: 'path/to/logo3.png', name: 'MONDELEZ KINH ĐÔ', industry: 'Thực phẩm & Đồ uống', jobCount: 8 },
        { logo: 'path/to/logo4.png', name: 'MUFG BANK', industry: 'Ngân hàng', jobCount: 2 },
        { logo: 'path/to/logo5.png', name: 'FOXCONN INDUSTRIAL', industry: 'Sản xuất', jobCount: 6 },
        { logo: 'path/to/logo6.png', name: 'UOB VIETNAM', industry: 'Ngân hàng', jobCount: 4 },
        { logo: 'path/to/logo7.png', name: 'VNG', industry: 'Công nghệ', jobCount: 10 },
        { logo: 'path/to/logo8.png', name: 'TH TRUE MILK', industry: 'Thực phẩm', jobCount: 7 },
        { logo: 'path/to/logo9.png', name: 'FPT SOFTWARE', industry: 'Công nghệ thông tin', jobCount: 15 },
        { logo: 'path/to/logo10.png', name: 'GREEK TRADING', industry: 'Thương mại', jobCount: 9 },
        { logo: 'path/to/logo11.png', name: 'BAC A BANK', industry: 'Ngân hàng', jobCount: 3 },
        { logo: 'path/to/logo12.png', name: 'BITEXCO', industry: 'Đầu tư', jobCount: 12 },
        { logo: 'path/to/logo13.png', name: 'Hòa Phát', industry: 'Sản xuất', jobCount: 8 },
        { logo: 'path/to/logo14.png', name: 'REX HOTEL', industry: 'Khách sạn', jobCount: 4 },
        { logo: 'path/to/logo15.png', name: 'UNILEVER', industry: 'Tiêu dùng', jobCount: 5 },
        { logo: 'path/to/logo16.png', name: 'VINAMILK', industry: 'Thực phẩm', jobCount: 10 },
        { logo: 'path/to/logo17.png', name: 'BIDV', industry: 'Ngân hàng', jobCount: 2 },
        { logo: 'path/to/logo18.png', name: 'Viettel', industry: 'Viễn thông', jobCount: 14 },
        { logo: 'path/to/logo19.png', name: 'Masan Group', industry: 'Thực phẩm', jobCount: 7 },
        { logo: 'path/to/logo20.png', name: 'Lotte Mart', industry: 'Bán lẻ', jobCount: 6 },
        { logo: 'path/to/logo21.png', name: 'Samsung', industry: 'Công nghệ', jobCount: 20 },
        { logo: 'path/to/logo22.png', name: 'Nokia', industry: 'Viễn thông', jobCount: 11 },
        { logo: 'path/to/logo23.png', name: 'Philips', industry: 'Đồ điện tử', jobCount: 3 },
        { logo: 'path/to/logo24.png', name: 'Nestlé', industry: 'Thực phẩm', jobCount: 8 },
        { logo: 'path/to/logo25.png', name: 'Coca-Cola', industry: 'Thực phẩm', jobCount: 10 },
        { logo: 'path/to/logo26.png', name: 'PepsiCo', industry: 'Thực phẩm', jobCount: 9 },
        { logo: 'path/to/logo27.png', name: 'Accenture', industry: 'Tư vấn', jobCount: 12 },
        { logo: 'path/to/logo28.png', name: 'DHL', industry: 'Vận chuyển', jobCount: 4 },
        { logo: 'path/to/logo29.png', name: 'FedEx', industry: 'Vận chuyển', jobCount: 5 },
        { logo: 'path/to/logo30.png', name: 'IBM', industry: 'Công nghệ', jobCount: 7 },
    ];

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [error, setError] = useState(null);  // State cho thông báo lỗi
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const [allCompanies, setAllCompanies] = useState([]); // Danh sách công ty gốc
    const currentItems = allCompanies.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(companies.length / itemsPerPage);

    useEffect(() => {
        // Lấy tất cả các công ty
        const fetchAllCompanies = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/companies/get-all-company/count-job');
                setAllCompanies(response.data);
            } catch (error) {
                console.error('Error fetching all companies:', error);
                setError('Không thể tải danh sách công ty.');
            }
        };
        fetchAllCompanies();
    }, []);

    const handleResize = () => {
        const width = window.innerWidth;
        if (width > 1200) setItemsPerPage(6);
        else if (width > 992) setItemsPerPage(5);
        else if (width > 768) setItemsPerPage(4);
        else if (width > 576) setItemsPerPage(3);
        else setItemsPerPage(2);
    };

    React.useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize(); // Gọi ngay để thiết lập số lượng thẻ ban đầu
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className='top-companies'>
            <header className="company-list-header">
                <h1 className="company-header-title">Công ty hàng đầu</h1>
            </header>
            <div className="top-companies-container">
                {currentItems.map((company, index) => (
                    <div key={index} className="top-company-card">
                        <div className="top-company-logo">
                            <img src={company.logo} alt={`${company.name} logo`} className="top-company-image" />
                        </div>
                        <Link to={`/companies/companydetail/${company._id}`}>
                            <p className="top-company-title">{company.company_name}</p>
                        </Link>
                        <p className="top-company-industry">{company.industry}</p>
                        <p className="top-company-job-count">{company.jobCount} công việc</p>
                        <Link to={`/companies/companydetail/${company._id}`} className="top-company-button">
                            Xem thêm
                        </Link>
                    </div>
                ))}
            </div>
            <div className="pagination">
                <button
                    onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                >
                    Trước
                </button>
                <span>Trang {currentPage} / {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages}
                >
                    Sau
                </button>
            </div>
        </div>
    );
}
