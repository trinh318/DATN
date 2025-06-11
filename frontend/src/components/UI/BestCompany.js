import React, { useState, useEffect } from 'react';
import '../../styles/bestcompany.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function BestCompany() {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [error, setError] = useState(null);  // State cho thông báo lỗi
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const [allCompanies, setAllCompanies] = useState([]); // Danh sách công ty gốc
    const currentItems = allCompanies.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        // Lấy tất cả các công ty
        const fetchAllCompanies = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/companies/get-all-company/count-job');
                setAllCompanies(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching all companies:', error);
                setError('Không thể tải danh sách công ty.');
            }
        };
        fetchAllCompanies();
    }, []);

    const totalPages = Math.ceil(allCompanies.length / itemsPerPage);

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
        <>
            <div className="w-[90%] mx-auto py-5">
                <header className="flex justify-center items-center text-center my-2 border-t border-b border-gray-300">
                    <h1 className="text-[#0A2657] text-4xl my-2">Công ty hàng đầu</h1>
                </header>

                <div className="flex flex-wrap justify-between my-5">
                    {currentItems.map((company, index) => (
                        <div
                            key={index}
                            className="w-[calc(16.66%-20px)] h-[350px] bg-white rounded-lg shadow-md flex flex-col justify-between p-4 box-border mb-5
        max-[1200px]:w-[calc(20%-20px)]
        max-[992px]:w-[calc(25%-20px)]
        max-[768px]:w-[calc(33.33%-20px)]
        max-[576px]:w-[calc(50%-20px)]"
                        >
                            <div className="w-full aspect-square flex justify-center items-center mb-2">
                                <img
                                    src={company.logo}
                                    alt={`${company.name} logo`}
                                    className="max-w-full max-h-full"
                                />
                            </div>

                            <Link to={`/companies/companydetail/${company._id}`}>
                                <p className="text-center text-base font-bold text-gray-800 m-0">
                                    {company.company_name}
                                </p>
                            </Link>
                            <p className="text-center text-sm text-gray-600 m-0">{company.industry}</p>
                            <p className="text-center text-sm text-blue-600 font-bold m-0">
                                {company.jobCount} công việc
                            </p>

                            <Link
                                to={`/companies/companydetail/${company._id}`}
                                className="bg-blue-500 text-white text-center rounded px-4 py-2 hover:bg-blue-700 mt-2"
                            >
                                Xem thêm
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center items-center mt-8 space-x-4">
                    <button
                        onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-200 
      ${currentPage === 1
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300"
                                : "bg-white hover:bg-blue-100 text-blue-600 border-blue-500"}`}
                    >
                        <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Trước
                    </button>

                    <span className="text-lg font-medium text-gray-700">
                        Trang <span className="text-blue-600">{currentPage}</span> / {totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                        disabled={currentPage === totalPages}
                        className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-200 
                                ${currentPage === totalPages
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300"
                                : "bg-white hover:bg-blue-100 text-blue-600 border-blue-500"}`}
                    >
                        Sau
                        <svg
                            className="w-4 h-4 ml-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );
}
