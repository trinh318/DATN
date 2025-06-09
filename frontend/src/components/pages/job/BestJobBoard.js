import React, { useState, useRef, useEffect } from 'react';
import SearchBar from '../../UI/SearchBar';
import BestJob from '../../UI/BestJob';
import Dropdown from '../../UI/DropDown';
import '../../../styles/bestjobboard.css';
import axios from 'axios'
import { Link, useNavigate ,useLocation } from 'react-router-dom';

//////////////////////////////////////////////////////
const industryData = [
    { id: 1, name: 'Bán Lẻ/Tiêu Dùng', count: 83 },
    { id: 2, name: 'Bảo Hiểm', count: 26 },
    { id: 3, name: 'Bất Động Sản', count: 92 },
    { id: 4, name: 'CEO & General Management', count: 73 },
    { id: 5, name: 'Chính Phủ/Phi Lợi Nhuận', count: 19 },
    { id: 6, name: 'Công Nghệ Thông Tin/Viễn Thông', count: 648 },
];

const fieldData = [
    { id: 1, name: 'Kinh doanh', count: 120 },
    { id: 2, name: 'Marketing', count: 85 },
    { id: 3, name: 'Giáo dục', count: 60 },
    { id: 4, name: 'Y tế', count: 45 },
    { id: 5, name: 'Công nghệ', count: 100 },
    { id: 6, name: 'Nông nghiệp', count: 30 },
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
        axios.get('http://localhost:5000/api/companies') // Make sure this is the correct API endpoint
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
            console.log("thong tin duoc chon",selectedCareers)
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
        <div className='job-board-body' ref={jobBoardRef}>
            <div className="job-board-banner-body">
                <SearchBar selectedCareers={selectedCareers}/>
                <div className='sidebar-container'>
                    <div className='job-board-sidebar'>
                        {fieldsToShow.map((field, index) => (
                            <div
                                key={index}
                                onMouseEnter={() => handleMouseEnter(field)}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => handleIndustryClick(field._id)}
                                className={field._id === hoveredIndustry || field._id === clickedIndustry ? 'industry-item-sidebar active' : 'industry-item-sidebar'}
                            >
                                {field.name}
                            </div>
                        ))}
                        <div className="pagination-controls">
                            <button onClick={handlePrevPage} disabled={currentPage === 0}>{"<"}</button>
                            <button onClick={handleNextPage} disabled={currentPage === totalPages - 1}>{">"}</button>
                        </div>

                    </div>
                    <div className='job-board-banner'>
                        {/* Conditionally render job-board-content based on hoveredIndustry or clickedIndustry */}
                        {(hoveredField || clickedIndustry) && (
                            <div
                                className='job-board-content'
                                onMouseEnter={() => clearTimeout(hideTimeout.current)} // Prevent hiding on hover
                                onMouseLeave={handleMouseLeave} // Hide on mouse leave if not clicked
                            >
                                <div className="subcategories">
                                    {careerData && careerData.map((career, idx) => {
                                        const isSelected = selectedCareers.includes(career.title);
                                        return (
                                            <div
                                                key={idx}
                                                className={`subcategory-item ${isSelected ? 'selected' : ''}`}
                                                onClick={() => {
                                                    if (!isSelected) {
                                                        setSelectedCareers([...selectedCareers, career.title]);
                                                    }
                                                }}
                                            >
                                                {career.title}
                                                {isSelected && (
                                                    <span
                                                        className="remove-tag"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // tránh kích hoạt onClick thẻ chính
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
                        <div className="highlight-jobs-container-jb">
                            <div className="croll-high-job-card-jb">
                                <div className="scroll-content-jb">
                                    {[...companies, ...companies].map((company) => (
                                        <div key={company._id} className="top-company-card-jb">
                                            <div className="top-company-logo-jb">
                                                <img src={company.logo} alt={`${company.company_name} logo`} className="top-company-image-jb" />
                                            </div>
                                            <Link to={`/companies/companydetail/${company._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <p className="top-company-title-jb">{company.company_name}</p>
                                            </Link>                                            <p className="top-company-industry-jb">{company.industry}</p>
                                            <p className="top-company-job-count-jb">{company.jobCount} việc mới</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="job-market-container">
                            <div className="job-market-header">
                                <i className="job-market-icon"></i> {/* Placeholder for icon */}
                                <div className='job-market-date'>
                                    <span>Thị trường việc làm hôm nay</span>
                                    <span className="date">{currentDate}</span>
                                </div>
                            </div>
                            <div className="job-market-stats">
                                <div className="job-count">
                                    <span>Việc làm đang tuyển</span>
                                    <span className="count">41,244</span>
                                </div>
                                <div className="divider"></div>
                                <div className="job-count">
                                    <span>Việc làm mới hôm nay</span>
                                    <span className="count">247</span>
                                </div>
                            </div>
                            <div className="more-link">Xem thêm</div>
                        </div>

                    </div>
                </div>
            </div>
            <BestJob />
            <div className='top-company-body'>
                <div className='top-company-body-left'>
                    <div className="company-filter-bar">
                        <h2>Top công ty</h2>
                        <div className="top-company-container">
                            <Dropdown label="Ngành nghề" options={industryData} onSelect={handleIndustrySelect} />
                            <Dropdown label="Lĩnh vực" options={fieldData} onSelect={handleFieldSelect} />
                        </div>
                    </div>
                    <div className="top-companies-list-container">
                        <div className="top-companies-card">
                            <div className="top-companies-card-image">
                                <img src="" alt="Construction Worker" />
                            </div>
                            <div className="top-companies-card-content">
                                <h3>RENOVATION</h3>
                                <p>There are many variations of the passages of Lorem…</p>
                                <a href="#" className="read-more">READ MORE</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="advertisement">
                    <div className="advertisement-banner">
                        <div className="advertisement-banner-content">
                            <h1>Special Offer on Renovation Services</h1>
                            <p>Get the best quality renovation services at an affordable price. Limited time offer!</p>
                            <button className="advertisement-banner-button">Learn More</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default BestJobBoard;