import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import '../../../styles/searchjob.css';
import '../../../styles/searchjobbar.css';
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ApplyJob from '../applicant/ApplyJob';
import axios from 'axios';
import Dropdown from "../../UI/DropDown";
import { useLocation, useNavigate } from 'react-router-dom';
import { getId, isAuth } from '../../../libs/isAuth';


const industryData = [
    { id: 1, name: 'Bán Lẻ/Tiêu Dùng' },
    { id: 2, name: 'Công nghiệp' },
    { id: 3, name: 'Nông Nghiệp' },
    { id: 4, name: 'Giáo Dục' },
    { id: 5, name: 'Y tế' },
    { id: 6, name: 'Công Nghệ Thông Tin' },
];

const salaryData = [
    { id: 1, name: 'Dưới 1000$' },
    { id: 2, name: '1000$ - 2000$' },
    { id: 3, name: '2000$ - 3000$' },
    { id: 4, name: '3000$ - 4000$' },
    { id: 5, name: '4000$ - 5000$' },
    { id: 6, name: 'Trên 6000$' },
];

const experienceData = [
    { id: 1, name: 'Mới tốt nghiệp' },
    { id: 2, name: '1-2 năm' },
    { id: 3, name: '3-5 năm' },
    { id: 4, name: 'Trên 5 năm' },
];

const employmentTypeData = [
    { id: 1, name: 'Toàn thời gian' },
    { id: 2, name: 'Bán thời gian' },
    { id: 3, name: 'Thực tập' },
];

export default function Jobs() {
    const userId = getId();
    ///tìm kiếm
    const location = useLocation();
    const [jobs, setJobs] = useState([]); // Danh sách công việc
    const [savedJobs, setSavedJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Trạng thái tải dữ liệu
    const [error, setError] = useState(null); // Thêm state để lưu lỗi
    const [successMessage, setSuccessMessage] = useState(null);

    // Hàm lấy query parameters từ URL
    const getQueryParams = () => {
        const searchParams = new URLSearchParams(location.search);
        const query = searchParams.get("query") || ""; // Vị trí tuyển dụng hoặc tên công ty
        const jobLocation = searchParams.get("location") || ""; // Địa điểm công việc
        const careers = searchParams.get("careers")?.split(',') || [];
        console.log("thong tin nghe nhan duoc", careers);

        return { query, location: jobLocation, careers };
    };

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const toggleAdvancedFilters = () => {
        setShowAdvancedFilters(!showAdvancedFilters);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 15;

    // Tính toán các job hiển thị
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob); // Các job hiện tại
    const totalPages = Math.ceil(jobs.length / jobsPerPage); // Tổng số trang
    const [selectedCareers, setSelectedCareers] = useState([]);

    // Điều hướng tới trang trước
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Điều hướng tới trang tiếp theo
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleSaveJob = async (jobId) => {
        try {
            // Lấy token từ localStorage
            const token = localStorage.getItem('token');

            if (token == null) {
                alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
                return;
            }
            // Gửi yêu cầu POST để lưu công việc
            const response = await axios.post(
                'http://localhost:5000/api/savedjobs/save-job',
                { job_id: jobId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Kiểm tra nếu lưu thành công
            if (response.status === 201) {
                alert('Lưu tin ứng tuyển thành công!');
                setTimeout(() => setSuccessMessage(null), 3000); // Ẩn thông báo thành công sau 3 giây

                // Cập nhật danh sách công việc đã lưu
                setSavedJobs((prevSavedJobs) => [...prevSavedJobs, response.data.savedJob]);

                // Cập nhật trạng thái saved trong allJobData
                setJobs((prevJobs) =>
                    prevJobs.map((job) =>
                        job._id === jobId ? { ...job, saved: true } : job
                    )
                );
            }

        } catch (err) {
            if (err.response) {
                // Xử lý các mã trạng thái cụ thể
                if (err.response.status === 409) {
                    alert('Bạn đã lưu công việc này trước đó.');
                } else {
                    setError(err.response.data.message || 'Không thể lưu công việc. Vui lòng thử lại.');
                }
                if (err.response.status === 401) {
                    alert('Bạn cần đăng nhập để ứng tuyển');
                }
            } else {
                console.error('Error saving job:', err.message);
                setError('Có lỗi xảy ra. Vui lòng thử lại.');
            }
        }
    };

    const handleUnsaveJob = async (jobId) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
                return;
            }

            // Tìm ID của công việc đã lưu trong `savedJobs`
            const savedJob = savedJobs.find((savedJob) => savedJob.job_id._id === jobId);
            if (!savedJob) {
                alert('Không tìm thấy công việc đã lưu để xóa.');
                return;
            }

            // Gửi yêu cầu DELETE để xóa công việc đã lưu
            const response = await axios.delete(`http://localhost:5000/api/savedjobs/${savedJob._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                alert('Công việc đã được xóa khỏi danh sách yêu thích.');

                // Cập nhật danh sách `savedJobs`
                setSavedJobs((prevSavedJobs) =>
                    prevSavedJobs.filter((job) => job._id !== savedJob._id)
                );

                // Cập nhật trạng thái `allJobData`
                setJobs((prevJobs) =>
                    prevJobs.map((job) =>
                        job._id === jobId ? { ...job, saved: false } : job
                    )
                );
            }
        } catch (err) {
            console.error('Error unsaving job:', err.message);
            alert('Có lỗi xảy ra khi xóa công việc đã lưu.');
        }
    };

    const toggleFavorite = async (jobId) => {
        try {
            if (!isAuth()) {
                alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
                return;
            }

            // Kiểm tra nếu công việc đã được lưu
            const job = jobs.find((job) => job._id === jobId);

            if (job.saved) {
                // Nếu đã lưu, xóa công việc
                await handleUnsaveJob(jobId);
            } else {
                // Nếu chưa lưu, lưu công việc
                await handleSaveJob(jobId);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setError('Có lỗi xảy ra khi thay đổi trạng thái yêu thích.');
        }
    };

    /////apply job
    const [favoriteJobs, setFavoriteJobs] = useState([]); // Danh sách công việc yêu thích
    const [jobToApply, setJobToApply] = useState(null); // Công việc được chọn để ứng tuyển

    const handleFavoriteToggle = (jobTitle) => {
        setFavoriteJobs((prevFavorites) =>
            prevFavorites.includes(jobTitle)
                ? prevFavorites.filter((title) => title !== jobTitle)
                : [...prevFavorites, jobTitle]
        );
    };

    const openApplyForm = (job) => {
        if (isAuth()) {
            setJobToApply(job); // Gán công việc được chọn
        } else (
            alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.')
        )
    };

    const closeApplyForm = () => {
        setJobToApply(null); // Đóng form ứng tuyển
    };

    ////bộ lọc
    const [filters, setFilters] = useState({
        industry: [],        // Ngành nghề
        salary: [],          // Mức lương
        experience: [],      // Kinh nghiệm
        employmentType: [],  // Loại hình công việc
    });
    // Map các lựa chọn từ tên hiển thị sang giá trị chuẩn cho backend
    const salaryMapping = {
        'Dưới 1000$': '0-1000',
        '1000$ - 2000$': '1000-2000',
        '2000$ - 3000$': '2000-3000',
        '3000$ - 4000$': '3000-4000',
        '4000$ - 5000$': '4000-5000',
        'Trên 6000$': '6000'
    };

    // Cập nhật các lựa chọn kinh nghiệm
    // Map các lựa chọn từ tên hiển thị sang tên chuẩn cho backend
    const experienceMapping = {
        'Mới tốt nghiệp': '0',
        '1-2 năm': '1-2',
        '3-5 năm': '3-5',
        'Trên 5 năm': '5'
    };

    // Cập nhật các lựa chọn loại hình công việc
    // Map các lựa chọn từ tên hiển thị sang tên chuẩn cho backend
    const employmentTypeMapping = {
        'Toàn thời gian': 'full_time',
        'Bán thời gian': 'part_time',
        'Thực tập': 'internship'
    };

    // Cập nhật các lựa chọn ngành nghề
    const handleIndustrySelect = (selectedIndustries) => {
        console.log("Selected Industries: ", selectedIndustries);  // Check the selected industries

        // Check if selectedIndustries is an array of objects
        if (Array.isArray(selectedIndustries)) {
            // Normalize the industries by extracting the 'name' property from each object
            const normalizedIndustries = selectedIndustries
                .map(industry => industry.name ? industry.name.trim().toLowerCase() : '')  // Extract 'name' and normalize
                .filter(industry => industry.length > 0);  // Filter out any empty strings

            // Check if the array is not empty after normalization
            if (normalizedIndustries.length > 0) {
                // Update state with the normalized industry names
                setFilters((prevFilters) => ({
                    ...prevFilters,
                    industry: normalizedIndustries,
                }));
            } else {
                console.error("No valid industries selected.");
            }
        } else {
            console.error("Selected industries is not an array.");
        }
    };

    // Cập nhật các lựa chọn mức lương
    const handleSalarySelect = (selectedSalaries) => {
        // Kiểm tra xem giá trị nhận được có phải là đối tượng không
        const normalizedSalaries = selectedSalaries.map((salary) => {
            if (salary && typeof salary === 'object') {
                console.log("Chọn mức lương:", salary.name);  // Kiểm tra giá trị của 'name' trong đối tượng
                return salaryMapping[salary.name] || salary.name;  // Lấy giá trị từ đối tượng
            }
            console.log("Giá trị không hợp lệ:", salary);
            return salaryMapping[salary] || salary;  // Lấy giá trị chuẩn hóa từ salaryMapping hoặc trả về gốc nếu không tìm thấy
        });

        console.log("Normalized Salaries: ", normalizedSalaries);  // Kiểm tra giá trị mức lương chuẩn hóa
        setFilters((prevFilters) => ({
            ...prevFilters,
            salary: normalizedSalaries,
        }));
    };

    // Cập nhật các lựa chọn kinh nghiệm
    const handleExperienceSelect = (selectedExperiences) => {
        // Kiểm tra dữ liệu đầu vào
        console.log("Selected Experiences: ", selectedExperiences);  // Kiểm tra giá trị kinh nghiệm

        // Chuyển đổi các lựa chọn kinh nghiệm sang tên chuẩn cho backend
        const normalizedExperiences = selectedExperiences.map((experience) => {
            // Nếu experience là đối tượng, lấy tên từ thuộc tính `name`
            const experienceName = experience.name || experience; // Nếu không có `name`, sử dụng trực tiếp giá trị

            const normalized = experienceMapping[experienceName];
            if (!normalized) {
                console.warn(`Không tìm thấy kinh nghiệm cho: ${experienceName}`);
            }
            return normalized;
        });

        // Kiểm tra kết quả chuẩn hóa
        console.log("Normalized Experiences: ", normalizedExperiences);  // Kiểm tra giá trị kinh nghiệm chuẩn hóa

        // Cập nhật filter với các giá trị chuẩn hóa
        setFilters((prevFilters) => ({
            ...prevFilters,
            experience: normalizedExperiences,
        }));
    };

    // Cập nhật các lựa chọn loại hình công việc
    const handleEmploymentTypeSelect = (selectedEmploymentTypes) => {
        console.log("Selected Employment Types: ", selectedEmploymentTypes);  // Kiểm tra giá trị

        // Chuyển đổi các lựa chọn được chọn sang tên chuẩn cho backend
        const normalizedEmploymentTypes = selectedEmploymentTypes.map((type) => {
            if (type && typeof type.name === 'string') {
                // Lấy giá trị name và tra cứu trong employmentTypeMapping
                const normalized = employmentTypeMapping[type.name];
                if (!normalized) {
                    console.warn(`Không tìm thấy giá trị cho loại hình công việc: ${type.name}`);
                }
                return normalized;
            } else {
                console.warn(`Giá trị không hợp lệ: ${JSON.stringify(type)}`);
                return undefined;
            }
        });

        console.log("Normalized Employment Types: ", normalizedEmploymentTypes);  // Kiểm tra giá trị chuẩn hóa
        setFilters((prevFilters) => ({
            ...prevFilters,
            employmentType: normalizedEmploymentTypes,
        }));
    };

    // Tìm kiếm công việc khi có sự thay đổi về filters
    useEffect(() => {
        const { industry, salary, experience, employmentType } = filters;

        console.log("Current Filters: ", filters);  // Kiểm tra tất cả các giá trị của filters

        const queryString = new URLSearchParams();

        // Kiểm tra xem các bộ lọc có giá trị không, chỉ thêm vào query string nếu có
        if (industry.length > 0) {
            queryString.append('industry', industry.join(','));
        }
        if (salary.length > 0) {
            queryString.append('salary', salary.join(','));
        }
        if (experience.length > 0) {
            queryString.append('experience', experience.join(','));
        }
        if (employmentType.length > 0) {
            queryString.append('employmentType', employmentType.join(','));
        }

        console.log("Query String: ", queryString.toString());  // Kiểm tra chuỗi truy vấn

        // Nếu không có bộ lọc (queryString trống), gọi API để lấy tất cả công việc
        if (queryString.toString()) {
            // Nếu có bộ lọc, thực hiện gọi API với query string
            setIsLoading(true);
            setError(null); // Reset lỗi trước khi tìm kiếm mới

            const fetchJobs = async () => {
                if (!isAuth()) {
                    try {
                        const response = await axios.get(`http://localhost:5000/api/jobs/search-jobs/filter-jobs?${queryString.toString()}`);
                        console.log("Response Data: ", response.data);  // Kiểm tra dữ liệu trả về từ API
                        setJobs(response.data);
                    } catch (error) {
                        setError(error.message); // Lưu thông tin lỗi
                        console.error("Error fetching jobs: ", error);  // Kiểm tra lỗi nếu có
                    } finally {
                        setIsLoading(false);
                    }
                } else {
                    try {
                        setIsLoading(true); // Bắt đầu tải dữ liệu

                        // Tải đồng thời danh sách công việc và công việc đã lưu
                        const [jobsResponse, savedJobsResponse] = await Promise.all([
                            axios.get(`http://localhost:5000/api/jobs/search-jobs/filter-jobs?${queryString.toString()}`),
                            axios.get(`http://localhost:5000/api/savedjobs/mysavedjobs/${userId}`)
                        ]);

                        const jobs = jobsResponse.data; // Danh sách công việc trả về từ API
                        const savedJobs = savedJobsResponse.data; // Danh sách công việc đã lưu

                        console.log("Jobs Data: ", jobs); // Debug danh sách công việc
                        console.log("Saved Jobs Data: ", savedJobs); // Debug danh sách công việc đã lưu

                        // Đánh dấu công việc đã lưu
                        const updatedJobs = jobs.map((job) => ({
                            ...job,
                            isSaved: savedJobs.some((savedJob) => savedJob.job_id._id === job._id),
                        }));

                        setJobs(updatedJobs); // Cập nhật danh sách công việc
                    } catch (error) {
                        setError(error.message); // Lưu thông tin lỗi
                        console.error("Error fetching jobs: ", error); // Kiểm tra lỗi nếu có
                    } finally {
                        setIsLoading(false); // Kết thúc trạng thái tải
                    }
                }
            };

            fetchJobs();
        } /**else {
            // Nếu không có bộ lọc, gọi API để lấy tất cả công việc
            setIsLoading(true);
            setError(null); // Reset lỗi trước khi tìm kiếm mới

            const fetchAllJobs = async () => {
                if (!isAuth()) {
                    try {
                        const response = await axios.get('http://localhost:5000/api/jobs');  // Gọi API không có query string
                        console.log("Response Data: ", response.data);  // Kiểm tra dữ liệu trả về từ API
                        setJobs(response.data);
                    } catch (error) {
                        setError(error.message); // Lưu thông tin lỗi
                        console.error("Error fetching jobs: ", error);  // Kiểm tra lỗi nếu có
                    } finally {
                        setIsLoading(false);
                    }
                } else {
                    try {
                        setIsLoading(true); // Bắt đầu tải dữ liệu

                        // Tải đồng thời danh sách công việc và danh sách công việc đã lưu
                        const [jobsResponse, savedJobsResponse] = await Promise.all([
                            axios.get('http://localhost:5000/api/jobs'), // Gọi API lấy tất cả công việc
                            axios.get(`http://localhost:5000/api/savedjobs/mysavedjobs/${userId}`) // Gọi API lấy công việc đã lưu
                        ]);

                        const jobs = jobsResponse.data; // Danh sách công việc trả về từ API
                        const savedJobs = savedJobsResponse.data; // Danh sách công việc đã lưu

                        console.log("Jobs Data: ", jobs); // Debug danh sách công việc
                        console.log("Saved Jobs Data: ", savedJobs); // Debug danh sách công việc đã lưu

                        // Đánh dấu công việc đã lưu
                        const updatedJobs = jobs.map((job) => ({
                            ...job,
                            isSaved: savedJobs.some((savedJob) => savedJob.job_id._id === job._id),
                        }));

                        setJobs(updatedJobs); // Cập nhật danh sách công việc với cờ isSaved
                    } catch (error) {
                        setError(error.message); // Lưu thông tin lỗi
                        console.error("Error fetching jobs: ", error); // Kiểm tra lỗi nếu có
                    } finally {
                        setIsLoading(false); // Kết thúc trạng thái tải
                    }
                }
            };

            fetchAllJobs();
        } */
    }, [filters]);// Hàm sẽ chạy lại khi filters thay đổi

    useEffect(() => {
        if (!isAuth()) {
            const { query, location: locationParam, careers } = getQueryParams();

            console.log("Query received:", query); // Debug giá trị query
            console.log("Location received:", locationParam); // Debug giá trị location
            console.log("Careers received:", careers);
            const encodedCareers = encodeURIComponent((careers || []).join(','));
            console.log("Encoded careers:", encodedCareers);
            // Kiểm tra điều kiện hợp lệ
            if (!query?.trim() && !locationParam?.trim() && !(careers?.length)) {
                console.warn("Không có điều kiện tìm kiếm hợp lệ.");
                return;
            }            
            // Gọi API nếu có điều kiện hợp lệ
            setIsLoading(true);  // Đánh dấu bắt đầu tải
            axios.get(
                `http://localhost:5000/api/jobs/search-job/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(locationParam)}&careers=${encodeURIComponent((careers || []).join(','))}`
            )
                .then((response) => {
                    console.log("Kết quả công việc:", response.data); // Debug dữ liệu từ server
                    setJobs(response.data);
                    setIsLoading(false); // Đánh dấu kết thúc tải
                })
                .catch((error) => {
                    console.error("Lỗi khi tải công việc:", error);
                    setIsLoading(false); // Đánh dấu kết thúc tải
                });
        } else {
            const { query, location: locationParam, careers } = getQueryParams();

            console.log("Query received:", query); // Debug giá trị query
            console.log("Location received:", locationParam); // Debug giá trị location
            console.log("Careers received:", careers);

            // Kiểm tra điều kiện hợp lệ
            if (!query || !query.trim()) {
                console.warn("Không có điều kiện tìm kiếm, bỏ qua request.");
                return;
            }

            // Gọi API nếu có điều kiện hợp lệ
            setIsLoading(true); // Đánh dấu bắt đầu tải

            Promise.all([
                // Lời gọi API tìm kiếm công việc
                axios.get(
                    `http://localhost:5000/api/jobs/search-job/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(locationParam)}&careers=${encodeURIComponent((careers || []).join(','))}`
                ),
                // Lời gọi API lấy công việc đã lưu
                axios.get(`http://localhost:5000/api/savedjobs/mysavedjobs/${userId}`),
            ])
                .then(([searchJobsResponse, savedJobsResponse]) => {
                    const jobs = searchJobsResponse.data; // Kết quả tìm kiếm công việc
                    const savedJobs = savedJobsResponse.data; // Danh sách công việc đã lưu

                    console.log("Kết quả công việc ():", jobs); // Debug dữ liệu công việc
                    console.log("Công việc đã lưu ():", savedJobs); // Debug dữ liệu đã lưu

                    // Đánh dấu công việc đã lưu
                    const updatedJobs = jobs.map((job) => ({
                        ...job,
                        isSaved: savedJobs.some((savedJob) => savedJob.job_id._id === job._id),
                    }));

                    setJobs(updatedJobs); // Cập nhật danh sách công việc
                    setIsLoading(false); // Đánh dấu kết thúc tải
                })
                .catch((error) => {
                    console.error("Lỗi khi tải công việc:", error);
                    setIsLoading(false); // Đánh dấu kết thúc tải
                });
        }
    }, [location, userId]);

    const [searchQuery, setSearchQuery] = useState("");
    const [locationFind, setLocationFind] = useState("Tất cả tỉnh/thành phố");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [searchLocation, setSearchLocation] = useState(""); // Dùng để lọc location trong dropdown
    const navigate = useNavigate();

    // Fetch danh sách tỉnh/thành phố
    useEffect(() => {
        fetch('/provinces.json') // Đường dẫn tới file JSON
            .then((response) => response.json())
            .then((data) => setProvinces(data))
            .catch((error) => console.error("Lỗi khi tải danh sách tỉnh/thành phố:", error));
    }, []);

    const handleSearch = () => {
        console.log("job", jobs);
        const trimmedQuery = searchQuery.trim();  // Xóa khoảng trắng thừa
        const trimmedLocation = locationFind.trim();

        const queryParam = `query=${encodeURIComponent(trimmedQuery)}`;
        const locationParam = trimmedLocation && trimmedLocation !== "Tất cả tỉnh/thành phố"
            ? `&location=${encodeURIComponent(trimmedLocation)}`
            : "";  // Nếu location là chuỗi rỗng hoặc giá trị mặc định, không thêm vào URL
        const careersParam = selectedCareers.length > 0
            ? `&careers=${selectedCareers.map(career => encodeURIComponent(career)).join(',')}`
            : "";
        console.log(`Navigating to: /search-job?${queryParam}${locationParam}${careersParam}`);  // Debug URL
        navigate(`/search-job?${queryParam}${locationParam}${careersParam}`);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch(); // Tìm kiếm khi nhấn Enter
        }
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleSelectLocation = (selectedLocation) => {
        setLocationFind(selectedLocation);
        setIsDropdownOpen(false); // Đóng dropdown sau khi chọn
    };

    const filteredProvinces = provinces.filter((province) =>
        province.toLowerCase().includes(searchLocation.toLowerCase())
    );

    const calculateRemainingDays = (deadline) => {
        if (!deadline) return 'không xác định';
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 'đã hết hạn';
    };

    const formatUpdateTime = (updateTime) => {
        if (!updateTime) return 'không rõ';
        const now = new Date();
        const updatedDate = new Date(updateTime);
        const diffTime = now - updatedDate;
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        return diffDays > 0
            ? `${diffDays} ngày`
            : diffHours > 0
                ? `${diffHours} giờ`
                : '0 giây';
    };

    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobStats = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/jobs/all-jobs/job-stats');
                setStats(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching job stats');
                setLoading(false);
            }
        };

        fetchJobStats();
    }, []);

    const [message, setMessage] = useState('');

    const handleViewJob = async (jobId) => {
        if (isAuth()) {
            try {
                const response = await axios.post('http://localhost:5000/api/viewedjobs/view-job', {
                    user_id: userId,
                    job_id: jobId,
                });
                setMessage(response.data.message);
            } catch (error) {
                setMessage(error.response?.data?.message || 'Error occurred');
            }
        }
    };

    return (
        <div className='search-job-board'>
            <div className='search-job-header'>
                <div className='search-job-bar-body'>
                    <div className='search-job-bar-search'>
                        <div class="search-job-bar-container">
                            <input
                                type="text"
                                className="search-job-bar-input"
                                placeholder="Vị trí tuyển dụng, tên công ty"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown} // Gọi tìm kiếm khi nhấn Enter
                            />
                            <div className='search-job-bar-drop-down'>
                                <div class="search-job-bar-location-dropdown" onClick={toggleDropdown}>
                                    <span class="search-job-bar-location-icon">📍</span>
                                    <span class="search-job-bar-location-text">{locationFind}</span>
                                    <span class="search-job-bar-dropdown-arrow">{isDropdownOpen ? "▲" : "▼"}</span>
                                </div>
                                {isDropdownOpen && (
                                    <div className="search-bar-dropdown">
                                        <input
                                            type="text"
                                            className="search-bar-dropdown-input"
                                            placeholder="Tìm kiếm tỉnh/thành phố"
                                            value={searchLocation}
                                            onChange={(e) =>
                                                setSearchLocation(e.target.value)
                                            }
                                        />
                                        <div className="search-bar-dropdown-list">
                                            {filteredProvinces.length > 0 ? (
                                                filteredProvinces.map((province, index) => (
                                                    <div
                                                        key={index}
                                                        className={`search-bar-dropdown-item ${province === location
                                                            ? "search-bar-selected"
                                                            : ""
                                                            }`}
                                                        onClick={() =>
                                                            handleSelectLocation(province)
                                                        }
                                                    >
                                                        {province}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="search-bar-no-results">
                                                    Không tìm thấy kết quả
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button className="search-job-bar-search-button" onClick={handleSearch}>
                                <span class="search-job-bar-search-icon">🔍</span>
                                Tìm kiếm
                            </button>
                        </div>
                        <button
                            className="search-job-btn-advanced"
                            onClick={toggleAdvancedFilters}
                        >
                            {showAdvancedFilters ? 'Ẩn nâng cao' : 'Lọc nâng cao'}
                        </button>
                    </div>
                    {showAdvancedFilters && (
                        <div className="search-job-advanced-filters">
                            <Dropdown label="Ngành nghề" options={industryData} onSelect={handleIndustrySelect} />
                            <Dropdown label="Lương" options={salaryData} onSelect={handleSalarySelect} />
                            <Dropdown label="Kinh nghiệm" options={experienceData} onSelect={handleExperienceSelect} />
                            <Dropdown label="Hình thức" options={employmentTypeData} onSelect={handleEmploymentTypeSelect} />
                        </div>
                    )}
                </div>
            </div>
            <div className="search-job-banner">
                <div className="search-job-skills">
                    {Object.entries(stats).map(([category, count]) => (
                        <span className="search-job-skill" key={category}>
                            {category} <span className="search-job-skill-count">{count}</span>
                        </span>
                    ))}
                </div>
                <p className="search-job-result">Tìm thấy <span className="search-job-result-count">{jobs.length}</span> việc làm phù hợp với yêu cầu của bạn.</p>
                {/**
                <div className="search-job-preferences">
                    <span>Ưu tiên hiển thị:</span>
                    <label><input type="radio" name="preference" /> Tất cả</label>
                    <label><input type="radio" name="preference" /> Tin mới nhất</label>
                    <label><input type="radio" name="preference" /> Cần tuyển gấp</label>
                    <label><input type="radio" name="preference" /> Lương (cao - thấp)</label>
                    <label><input type="radio" name="preference" /> Ngày đăng (mới nhất)</label>
                    <label><input type="radio" name="preference" /> Ngày đăng (cũ nhất)</label>
                </div> */}
            </div>
            <div className='search-job-board-list'>
                <div className='search-job-board-list-left'>
                    <div className='search-job-list'>
                        <div className="search-job-board-list-container">
                            {isLoading ? (
                                <p>loanding...</p>
                            ) : jobs.length > 0 ? (
                                <>
                                    {currentJobs.map((job, index) => (
                                        <div key={index} className="search-job-info-item-card">
                                            <div className="search-job-board-company-logo">
                                                <img src={job.company_id ? job.company_id.logo : 'N/A'} alt="Company Logo" />
                                            </div>
                                            <div className="search-job-info-sections">
                                                <Link to={`/jobs/jobdetail/${job._id}`} className="search-job-info-position-title">
                                                    <h2>{job.title}</h2>
                                                </Link>
                                                <p className="search-job-info-company-name">{job.company}</p>
                                                <span className="search-job-salary-info">{job.salary}</span>
                                                <div className="search-job-info-details">
                                                    <span className="search-job-location-info">📍 {job.location}</span>
                                                </div>
                                                <div className="search-job-info-details">
                                                    <p className="search-job-update">Cập nhật {formatUpdateTime(job.updated_at)} trước</p>
                                                    <span className="search-job-remaining-days">⏳ Còn {calculateRemainingDays(job.application_deadline)} ngày để ứng tuyển</span>
                                                </div>
                                            </div>
                                            <div className="search-job-salary-apply">
                                                <button className="search-job-apply-button" onClick={() => openApplyForm(job)}>Ứng tuyển</button>
                                                <div className="search-job-info-favorite-icon" onClick={() => toggleFavorite(job.title)}>
                                                    <span>{job.isSaved ? '❤️' : '🤍'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <p>Không có dữ liệu phù hợp</p>
                            )}
                        </div>
                        {/* Pagination */}
                        <div className="custom-pagination">
                            <button
                                className="pagination-button"
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            <span className="pagination-info">
                                {currentPage}/{totalPages}
                            </span>
                            <button
                                className="pagination-button"
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="search-job-ads">
                    <div className="search-job-ads-banner">
                        <div className="search-job-ads-banner-content">
                            <h1 className="search-job-ads-banner-heading">Special Offer on Renovation Services</h1>
                            <p className="search-job-ads-banner-description">Get the best quality renovation services at an affordable price. Limited time offer!</p>
                            <button className="search-job-ads-banner-button">Learn More</button>
                        </div>
                    </div>
                </div>
            </div>

            {jobToApply && (
                <ApplyJob job={jobToApply} onClose={closeApplyForm} />
            )}
        </div>
    )
}