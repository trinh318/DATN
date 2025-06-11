import React, { useState, useRef, useEffect } from 'react';
import SearchBar from '../../UI/SearchBar';
import BestJob from '../../UI/BestJob';
import Dropdown from '../../UI/DropDown';
import '../../../styles/bestjobboard.css';
import axios from 'axios'
import { Link, useNavigate, useLocation } from 'react-router-dom';

//////////////////////////////////////////////////////
const industryData = [
    { id: 1, name: 'Bán Lẻ/Tiêu Dùng', count: 83 },
    { id: 2, name: 'Bảo Hiểm', count: 26 },
    { id: 3, name: 'Bất Động Sản', count: 92 },
    { id: 4, name: 'CEO & General Management', count: 73 },
    { id: 5, name: 'Chính Phủ/Phi Lợi Nhuận', count: 19 },
    { id: 6, name: 'Công Nghệ Thông Tin/Viễn Thông', count: 648 },
];

////////////////////////////////////////////////////////

function BestJobBoard() {
    const itemsPerPage = 6;
    const [hoveredIndustry, setHoveredIndustry] = useState(null);
    const [clickedIndustry, setClickedIndustry] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const hideTimeout = useRef(null);
    const jobBoardRef = useRef(null);
    const currentDate = new Date().toLocaleDateString('vi-VN');
    const [fieldData, setFieldData] = useState([]);

    const totalPages = Math.ceil(fieldData.length / itemsPerPage);
    const fieldsToShow = fieldData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
    const [careerData, setCareerData] = useState(null);
    const [hoveredField, setHoveredField] = useState(null);

    const [selectedCareers, setSelectedCareers] = useState([]);

    const handleNextPage = () => {
        setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => (prevPage - 1 + totalPages) % totalPages);
    };
    const fetchCareerData = (fieldId) => {
        axios.get(`http://localhost:5000/api/categoryschema/careersByCategoryId/${fieldId}`)  // Replace with your correct API endpoint
            .then(response => {
                setCareerData(response.data);  // Store the fetched career data
            })

            .catch(error => {
                console.error('Error fetching career data:', error);
                setCareerData(null);  // Set null if there's an error
            });
    };
    // Handle mouse enter
    const handleMouseEnter = (field) => {
        if (field && field._id) {
            clearTimeout(hideTimeout.current);
            setHoveredField(field);
            fetchCareerData(field._id);  // Fetch career data based on field ID
        }
    };


    // Handle mouse leave with delay
    const handleMouseLeave = () => {
        hideTimeout.current = setTimeout(() => {
            setHoveredField(null);
            setCareerData(null);  // Clear career data on mouse leave
        }, 200);
    };

    // Toggle click to open/close menu
    const handleIndustryClick = (industry) => {
        setClickedIndustry((prev) => (prev === industry ? null : industry));
        setHoveredIndustry(null); // Clear hover state when clicking
    };

    // Close menu if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (jobBoardRef.current && !jobBoardRef.current.contains(event.target)) {
                setClickedIndustry(null);
                setHoveredIndustry(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    /////////////////////////////////////////////////////
    const handleFieldSelect = (id) => {
        console.log(`Selected Field ID: ${id}`);
    };

    const handleIndustrySelect = (id) => {
        console.log(`Selected Industry ID: ${id}`);
    };
    ///////////////////////////////////////////////////
    // lay danh sach cong ty 
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch the data when the component mounts
        axios.get('http://localhost:5000/api/companies/get-all-company/count-job') // Make sure this is the correct API endpoint
            .then((response) => {
                // Get only the first 10 companies
                setCompanies(response.data.slice(0, 10));
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []); // Empty dependency array means this effect runs once when the component mounts

    useEffect(() => {
        const fetchFields = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/categoryschema');
                setFieldData(response.data); // đảm bảo response trả về là một mảng lĩnh vực
                console.log("thong tin linh vuc", response.data);
            } catch (err) {
                console.error('Error fetching fields:', err);
            }
        };

        fetchFields();
    }, []);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (selectedCareers.length > 0) {
            console.log("thong tin duoc chon", selectedCareers)
            const searchParams = new URLSearchParams(location.search);
            searchParams.set("careers", selectedCareers.join(','));
            const newSearch = searchParams.toString();
            console.log("Navigating with:", newSearch);
            navigate(`/search-job?${newSearch}`);
        }
    }, [selectedCareers]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <div className="flex flex-col items-center bg-[#edf5ec] py-5 font-sans" ref={jobBoardRef}>
                <div className="relative w-[90%] bg-[#2c3e50] rounded-[12px] py-5 mb-5 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col items-start"
                    style={{
                        backgroundImage: `repeating-linear-gradient(45deg, 
                    #2c3e50, 
                    #2c3e50 130px, 
                    #147882e6 230px, 
                    #147882e6 360px, 
                    #2c8c9699 460px, 
                    #2c8c9699 590px, 
                    #468c9680 690px, 
                    #468c9680 720px)`
                    }}>
                    <SearchBar selectedCareers={selectedCareers} />
                    <div className="flex items-start w-[90%] mx-auto">
                        <div className="bg-white rounded-lg w-[300px] p-[15px] flex flex-col gap-3 shadow-[0_4px_15px_rgba(0,0,0,0.1)] mr-5">
                            {fieldsToShow.map((field, index) => (
                                <div
                                    key={index}
                                    onMouseEnter={() => handleMouseEnter(field)}
                                    onMouseLeave={handleMouseLeave}
                                    onClick={() => handleIndustryClick(field._id)}
                                    className={`px-[10px] py-1 text-[15px] font-semibold rounded cursor-pointer transition-all ${field._id === hoveredIndustry || field._id === clickedIndustry
                                        ? 'text-[#147882]'
                                        : 'text-[#333]'
                                        }`}
                                >
                                    {field.name}
                                </div>
                            ))}
                            <div className="flex justify-between border-t border-gray-300 pt-2 -mb-1">
                                <button className="text-[#19647d] text-[18px] hover:text-[#1b705e]" onClick={handlePrevPage} disabled={currentPage === 0}>{"<"}</button>
                                <button className="text-[#19647d] text-[18px] hover:text-[#1b705e]" onClick={handleNextPage} disabled={currentPage === totalPages - 1}>{">"}</button>
                            </div>
                        </div>

                        <div className="text-center justify-center flex-1 w-[calc(100%-320px)]">
                            {(hoveredField || clickedIndustry) && (
                                <div className="absolute w-[calc(90%-356px)] h-[calc(100%-112px)] z-10 bg-white p-5 shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex flex-col items-center" onMouseEnter={() => clearTimeout(hideTimeout.current)} onMouseLeave={handleMouseLeave}>
                                    <div className="flex flex-wrap gap-2">
                                        {careerData && careerData.map((career, idx) => {
                                            const isSelected = selectedCareers.includes(career.title);
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`px-2 py-1 text-sm rounded-full ${isSelected ? 'bg-[#b0d7ef] border border-[#57b0b8] text-[#2c3e50] relative pr-6' : 'bg-[#f0f0f0] text-[#333]'}`}
                                                    onClick={() => {
                                                        if (!isSelected) {
                                                            setSelectedCareers([...selectedCareers, career.title]);
                                                        }
                                                    }}
                                                >
                                                    {career.title}
                                                    {isSelected && (
                                                        <span
                                                            className="absolute right-1 top-1/2 -translate-y-1/2 text-red-500 font-bold cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedCareers(selectedCareers.filter(c => c !== career.title));
                                                            }}
                                                        >
                                                            &times;
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="w-full max-w-[1200px] mx-auto overflow-hidden pb-5">
                                <div className="flex flex-col relative whitespace-nowrap">
                                    <div className="flex gap-5 flex-nowrap animate-[scrollLeft_60s_linear_infinite] w-max box-border">
                                        {[...companies, ...companies].map((company) => (
                                            <div key={company._id} className="flex flex-col items-center p-2 bg-[#f9f9f9] rounded-lg shadow-md h-full w-[180px] flex-shrink-0 mx-2">
                                                <div className="w-20 h-20 flex justify-center items-center mb-2">
                                                    <img src={company.logo} alt={`${company.company_name} logo`} className="max-w-full max-h-full" />
                                                </div>
                                                <Link to={`/companies/companydetail/${company._id}`} className="no-underline text-inherit text-center text-base font-bold text-gray-800 m-0">{company.company_name}</Link>
                                                <p className="text-center text-sm text-gray-600 m-0">{company.industry}</p>
                                                <p className="text-center text-sm text-blue-600 font-bold m-0">{company.jobCount} việc mới</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="relative bg-[#ddf4ee1a] text-white p-4 border border-[#054a50] rounded-lg flex flex-col items-start w-full transition-all hover:bg-[#216b7a49] hover:border-[#066158] hover:shadow-lg hover:-translate-y-1">
                                <div className="flex items-center gap-2 w-full">
                                    <div className="w-6 h-6 bg-[#4cadaf] rounded-full"></div>
                                    <div className="flex gap-2">
                                        <span>Thị trường việc làm hôm nay</span>
                                        <span className="ml-auto">{currentDate}</span>
                                    </div>
                                </div>
                                <div className="flex items-center mt-4">
                                    <div className="flex flex-col items-center">
                                        <span>Việc làm đang tuyển</span>
                                        <span className="font-bold text-lg mt-1">41,244</span>
                                    </div>
                                    <div className="w-px bg-white h-10 mx-4"></div>
                                    <div className="flex flex-col items-center">
                                        <span>Việc làm mới hôm nay</span>
                                        <span className="font-bold text-lg mt-1">247</span>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 text-[#b3f1ff] cursor-pointer text-sm underline hover:text-[#80d4e7]">Xem thêm</div>
                            </div>
                        </div>
                    </div>
                </div>

                <BestJob />
                <div className="w-[90%] mx-auto py-[70px] flex justify-between">
                    <div className="w-[65%]">
                        <div className="bg-gray-50 border border-gray-200 p-5">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Top công ty</h2>
                            <div className="bg-white p-3 rounded shadow-sm flex flex-wrap gap-4">
                                <Dropdown label="Ngành nghề" options={industryData} onSelect={handleIndustrySelect} />
                                <Dropdown label="Lĩnh vực" options={fieldData} onSelect={handleFieldSelect} />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 mt-2 gap-2">
                            {companies.map((company) => (
                                <div key={company._id} className="flex items-center gap-5 p-4 bg-white shadow-md">
                                    <div className="w-20 h-20 flex-shrink-0 flex justify-center items-center">
                                        <img src={company.logo} alt={`${company.company_name} logo`} className="max-w-full max-h-full rounded-full" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <Link to={`/companies/companydetail/${company._id}`} className="text-lg font-bold text-gray-800 hover:no-underline">
                                            {company.company_name}
                                        </Link>
                                        <p className="text-sm text-gray-600">{company.industry}</p>
                                        <p className="text-sm text-blue-600 font-semibold">{company.jobCount} việc mới</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-center justify-center pl-5 flex-1">
                        <div className="relative bg-cover bg-center h-[800px] flex items-center justify-center text-white text-center p-5">
                            <div className="absolute inset-0 bg-[rgba(0,0,0,0.4)]"></div>
                            <div className="relative z-10">
                                <h1 className="text-2xl font-bold m-0">Special Offer on Renovation Services</h1>
                                <p className="text-lg my-2">Get the best quality renovation services at an affordable price. Limited time offer!</p>
                                <button className="bg-[#FFA500] hover:bg-[#FF8C00] border-none px-5 py-2 text-base text-white rounded cursor-pointer">Learn More</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default BestJobBoard;