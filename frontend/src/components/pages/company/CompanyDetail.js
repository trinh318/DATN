import React, { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import '../../../styles/companydetail.css';
import ApplyJob from '../applicant/ApplyJob';
import axios from 'axios';
import { isAuth } from '../../../libs/isAuth';
import { getId } from '../../../libs/isAuth';
import { FaBuilding, FaEye, FaUsers, FaTimes } from 'react-icons/fa';
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';


const reviews = [
    {
        date: "April 2025",
        title: "Good for new employee",
        rating: 3,
        recommend: true,
        liked: "Fully covered insurance, appropriate benefits, and a stable job. The OT pay is really hard to submit, have to check multiple times before approved.",
        improvement: "Need to improve benefits for long-term employee, improve overtime policy",
    },
    {
        date: "September 2023",
        title: "Đồng nghiệp hòa đồng, thân thiện, giúp đỡ nhau",
        rating: 4,
        recommend: true,
    },
];


export default function CompanyDetail() {
    const [percentage, setPercentage] = useState(0);
    const radius = 50; // Bán kính vòng tròn
    const stroke = 10; // Độ dày của đường viền
    const circumference = 2 * Math.PI * radius; // Chu vi của vòng tròn
    const offset = circumference - (percentage / 100) * circumference; // Tính toán độ offset để thể hiện phần trăm;
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);  // Declare loading state
    const [error, setError] = useState(null);
    const [allJobData, setAllJobData] = useState([]); // Lưu danh sách công việc
    const [allJobDataUnAuth, setAllJobDataUnAuth] = useState([]); // Lưu danh sách công việc
    const [successMessage, setSuccessMessage] = useState(null);
    const [savedJobs, setSavedJobs] = useState([]);
    const [isFollowed, setIsFolloweds] = useState(false);
    const { companyId } = useParams();
    const handleTabClick = (tab) => setActiveTab(tab);

    const userId = getId();
    const [expanded, setExpanded] = useState(true);
    const [expandedreview, setExpandedReview] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/companies/company/${companyId}`);
                setCompany(response.data);
                console.log('Company ID:', companyId);
                setLoading(false);
            } catch (error) {
                setError('Error fetching company data');
                setLoading(false);
            }
        };

        const fetchJob = async () => {
            if (!isAuth()) {
                try {
                    setLoading(true);

                    const response = await axios.get(`http://localhost:5000/api/jobs/jobs-by-company/${companyId}`);

                    setAllJobDataUnAuth(response.data);
                    console.log("thong tin cua job cong ty la",response.data )
                } catch (error) {
                    console.error('Error fetching data:', error);
                    setError('Lỗi khi tải dữ liệu.');
                } finally {
                    setLoading(false);
                }
            }
        };

        const checkFollowStatus = async () => {
            if (isAuth()) {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        alert('Bạn cần đăng nhập để kiểm tra trạng thái theo dõi');
                        return;
                    }

                    const response = await axios.get(`http://localhost:5000/api/followedcompanies/check-followed/${companyId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    setIsFolloweds(response.data.isFollowed);
                    if (isFollowed) {
                        console.log('Bạn đang theo dõi công ty này.');
                    } else {
                        console.log('Bạn chưa theo dõi công ty này.');
                    }
                } catch (err) {
                    console.error('Error checking follow status:', err);
                    alert('Có lỗi xảy ra khi kiểm tra theo dõi.');
                }
            }
        };

        fetchCompany();
        fetchJob();
        checkFollowStatus();
    }, [companyId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Tải đồng thời danh sách công việc đã lưu và tất cả công việc
                const [savedJobsResponse, allJobsResponse] = await Promise.all([
                    axios.get(`http://localhost:5000/api/savedjobs/mysavedjobs/${userId}`),
                    axios.get(`http://localhost:5000/api/jobs/jobs-by-company/${companyId}`)
                ]);

                const savedJobs = savedJobsResponse.data;
                const jobs = allJobsResponse.data;

                // Đánh dấu các công việc đã lưu
                const updatedJobs = jobs.map((job) => ({
                    ...job,
                    saved: savedJobs.some((savedJob) => savedJob.job_id === job._id),
                }));

                setSavedJobs(savedJobs);
                setAllJobData(updatedJobs);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Lỗi khi tải dữ liệu.');
            } finally {
                setLoading(false);
            }
        };

        if (companyId) {
            fetchData();
        }
    }, [companyId, userId]);

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
                setAllJobData((prevJobs) =>
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

    const toggleFavorite = async (jobId) => {
        try {
            if (!isAuth()) {
                alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
                return;
            }

            // Kiểm tra nếu công việc đã được lưu
            const job = allJobData.find((job) => job._id === jobId);

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
                setAllJobData((prevJobs) =>
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

    const [jobToApply, setJobToApply] = useState(null); // Công việc được chọn để ứng tuyển

    const openApplyForm = (job) => {
        if (isAuth()) {
            setJobToApply(job); // Gán công việc được chọn
        } else {
            alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
            return;
        }
    };

    const closeApplyForm = () => {
        setJobToApply(null); // Đóng form ứng tuyển
    };

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
                alert('Công ty đã được theo dõi!');
                setIsFolloweds(true);
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
            alert(response.data.message); // Hiển thị thông báo hủy theo dõi thành công
            setIsFolloweds(false);
        } catch (err) {
            console.error(err);
            alert('Error unfollowing company.');
        }
    };

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
    const [activeTab, setActiveTab] = useState('account');
    const renderStars = (score) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (score >= i) {
                stars.push(<FaStar key={i} color="#ff9119" />);
            } else if (score >= i - 0.5) {
                stars.push(<FaStarHalfAlt key={i} color="#ff9119" />);
            } else {
                stars.push(<FaRegStar key={i} color="#ff9119" />);
            }
        }
        return stars;
    };

    const oneStars = (score) => {
        const stars = [];
        stars.push(<FaStar color="#ff9119" />);
        return stars;
    };


    const reviews = [
        {
            date: "Tháng 4 năm 2025",
            title: "Môi trường làm việc tốt",
            rating: 5,
            positive: "Mình mới hoàn thành dự án đầu tiên tại công ty và phải nói là môi trường làm việc khá ổn áp. Được làm với team giỏi, support nhau tốt, không có drama, chỉ có code và giải quyết vấn đề. Quản lý cũng lắng nghe và hỗ trợ khi cần, nên cảm giác khá yên tâm khi làm việc. Không có OT policy, công ty không khuyến khích OT nếu có request rõ ràng thì sẽ được trả theo dự án.",
            improve: "Mới vào thì được làm dự án ngay, nhưng giờ đang đợi dự án mới, cũng hơi hoang mang vì không biết sẽ chờ bao lâu. Nếu công ty có lộ trình rõ ràng hơn cho anh em dev trong giai đoạn chờ dự án thì sẽ tốt hơn."
        },
        {
            date: "Tháng 3 năm 2025",
            title: "Đồng nghiệp thân thiện",
            rating: 4,
            positive: "Team hỗ trợ nhau tốt, dễ chia sẻ, không áp lực kiểm tra nhiều. Không khí làm việc thoải mái.",
            improve: "Quy trình onboarding cần rõ ràng hơn, tài liệu hiện tại hơi rối."
        },
        // Thêm các đánh giá khác tại đây...
    ];
    const [rating, setRating] = useState(0);

    // Giả định bạn có biến userLoginStatus để kiểm tra login
    const handleStarClick = (star) => {
        if (!userId) {
            alert("Vui lòng đăng nhập để đánh giá!");
            // hoặc mở modal đăng nhập
            return;
        }
        setRating(star);
        // chuyển sang trang viết đánh giá hoặc mở form
        navigate("/write-review", { state: { companyId: company._id } });
    };
    const [ratingStart, setRatingStart] = useState(0); // Đã chọn
    const [hoveredRating, setHoveredRating] = useState(0); // Đang hover
    const handleStarRating = (star) => {
        setRating(star);
    };

    const handleStarHover = (star) => {
        setHoveredRating(star);
    };

    const handleStarLeave = () => {
        setHoveredRating(0);
    };
    const [reviewStats, setReviewStats] = useState(null);
    const [categories, setCategories] = useState([]);
    const [ratingDetailsMap, setRatingDetailsMap] = useState({});
    const [hoveredCategory, setHoveredCategory] = useState("Salary & benefits");
    const [ratings, setRatings] = useState([]);
    const [label, setLabel] = useState("");
    useEffect(() => {
        if (expandedreview && !hoveredCategory) {
            setHoveredCategory("Salary & benefits"); // hoặc mục đầu tiên trong danh sách
        }
    }, [expandedreview]);

    useEffect(() => {
        const fetchReviewStats = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/reviewschema/company/${companyId}/review-stats`);
                const data = response.data;
                console.log("🟡 Full response data:", data);

                // Assign reviewStats here
                setReviewStats(data);

                const ratingPerc = parseFloat(data.ratingPercentage).toFixed(2);
                setLabel("");
                setPercentage(ratingPerc);

                // Data for star ratings
                const starRatings = data.ratingDistribution?.percentages || [];
                const starData = starRatings.map((value, index) => ({
                    stt: index + 1,
                    score: parseFloat(value),
                }));
                setRatings(starData);

                // Handle categories
                const averageScores = data.detailAverageScores || {};
                const newCategories = Object.keys(averageScores).map((key) => ({
                    label: key.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
                    score: parseFloat(averageScores[key]).toFixed(2),
                }));
                setCategories(newCategories);

                const detailsMap = {};
                for (const key in data.detailsPercentage) {
                    const starPercents = data.detailsPercentage[key];
                    detailsMap[key.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())] = starPercents.map((percent, index) => ({
                        star:  index + 1,
                        percent: parseFloat(percent),
                    }));
                }
                setRatingDetailsMap(detailsMap);
                setHoveredCategory(newCategories[0]?.label || "");

            } catch (error) {
                console.error("❌ Error fetching review stats:", error);
            }
        };

        fetchReviewStats();
    }, [companyId]);
    const [companyReviews, setCompanyReviews] = useState([]);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [comments, setComments] = useState([]);

useEffect(() => {
  const fetchCompanyComments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/reviewschema/company/${companyId}/comments`
      );

      const commentList = response.data.map((r) => ({
        title: r.comment, // hoặc bạn có thể để tên khác nếu cần
        rating: r.rating,
        date: new Date(r.created_at).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "long"
        }),
        positive: r.what_i_love,
        improve: r.suggestion,
        recommend: r.recommend,
      }));

      setComments(commentList);
    } catch (err) {
      console.error("Lỗi khi lấy đánh giá:", err);
    }
  };

  if (companyId) {
    fetchCompanyComments();
  }
}, [companyId]);

    if (!reviewStats) return <p>Đang tải thống kê đánh giá...</p>;

    const { averageRating, totalReviews } = reviewStats;

    const labelToKeyMap = {
        "Salary & benefits": "salary_benefits",
        "Training & learning": "training",
        "Management cares about me": "management",
        "Culture & fun": "culture",
        "Office & workspace": "workspace",
    };

    return (
        <div className='company-detail'>
            <div className="company-detail-info-container">
                {/* Banner của công ty */}
                <div className="company-detail-info-banner">
                    <img src={company?.banner} alt="Company Banner" />
                </div>

                {/* Phần thông tin chính */}
                <div className="company-detail-info-content">
                    {/* Logo công ty */}
                    <div className="company-detail-info-logo">
                        <img src={company?.logo} alt="Company Logo" />
                    </div>

                    {/* Chi tiết công ty */}
                    <div className="company-detail-info-details">
                        <div className="company-detail-info">
                            <h2 className="company-detail-info-name">{company?.company_name}</h2>
                            {company?.highlight && new Date(company.highlight_expiration) > new Date() && (
                                <div className="pro-company-badge">Pro Company</div>
                            )}
                        </div>

                        <div className="company-detail-info-meta">
                           
                            <span className="company-detail-info-size">
                                🏢 {company?.quymo} người
                            </span>
                            <span className="company-detail-info-followers">
                                👥 {company?.industry} {/*người theo dõi*/}
                            </span>
                        </div>
                    </div>

                    {/* Nút theo dõi công ty */}
                    {isFollowed ? (
                        <button onClick={() => handleUnfollow(company?._id)} className="company-detail-info-follow-button">
                            + Bỏ theo dõi
                        </button>
                    ) : (
                        <button onClick={() => handleFollow(company?._id)} className="company-detail-info-follow-button">
                            + Theo dõi công ty
                        </button>
                    )}
                </div>
            </div>
            <div className="company-detail-info-wrapper">
                <div className="company-detail-info-main">
                    <div className="company-detail-info-tabs">
                        <button
                            className={`company-profile-tab ${activeTab === 'account' ? 'active' : ''}`}
                            onClick={() => handleTabClick('account')}
                        >
                            <FaEye /> Giới thiệu công ty
                        </button>

                        <button
                            className={`company-profile-tab ${activeTab === 'recruiter' ? 'active' : ''}`}
                            onClick={() => handleTabClick('recruiter')}
                        >
                            <FaUsers /> Đánh giá & bình luận
                        </button>

                    </div>
                    {activeTab === 'account' && (
                        <>
                            <div className="company-detail-info-intro">
                                <h2>Giới thiệu công ty</h2>
                                <p>{company?.description}</p>
                                <button className="company-detail-info-toggle">Thu gọn</button>
                            </div>
                        </>
                    )}
                    {activeTab === 'recruiter' && (
                        <>
                            <div className="dashed-line"></div>
                            <div className="company-detail-info-review-container p-6 rounded-xl shadow-md bg-white">
                                {ratings && ratings.length > 0 && (

                                    <div className="flex justify-between items-center mb-4">
                                        <div className="company-detail-info-review-split-left">
                                            <div className="company-detail-info-review-split-container">
                                                <div className="company-detail-info-review1-split-left">
                                                    <div className="company-detail-info-review1-split-left-categories company-detail-info-review1-split-left-text  ">
                                                        <p className="company-detail-info-review1-split-left-rating-score">{averageRating}</p>
                                                        <div className="company-detail-info-review1-split-left-star-rating">
                                                            <div
                                                                className="company-detail-info-review1-split-left-star-rating-filled"
                                                                style={{
                                                                    width: `${(isNaN(averageRating) ? 0 : (averageRating / 5) * 100)}%`
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    <div className="company-detail-info-review1-split-left-lable">{totalReviews} reviews</div>
                                                </div>
                                                <div className="company-detail-info-review1-split-right">
                                                    <div className="company-detail-info-review1-split-right-rating-list">
                                                        {ratings.map((item, idx) => (
                                                            <div key={idx} className="company-detail-info-review1-split-right-rating-item">
                                                                <span className="company-detail-info-review1-split-right-score">{item.stt}</span>
                                                                <span className="company-detail-info-review1-split-right-stars">★</span>
                                                                <div className="company-detail-info-review1-split-right-progress-bar">
                                                                    <div
                                                                        className="company-detail-info-review1-split-right-progress-fill"
                                                                        style={{ width: `${(item.score / 100) * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="company-detail-info-review1-split-right-label">{item.score}%</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="company-detail-info-review-split-right-dashed-line"></div>                                    <div className="company-detail-info-review-split-right">
                                            <svg width="120" height="120" viewBox="0 0 120 120" enableBackground={false}>
                                                <circle
                                                    className="company-detail-info-review-split-right-background"
                                                    cx="60"
                                                    cy="60"
                                                    r={radius}
                                                    strokeWidth={stroke}
                                                />
                                                <circle
                                                    className="company-detail-info-review-split-right-progress"
                                                    cx="60"
                                                    cy="60"
                                                    r={radius}
                                                    strokeWidth={stroke}
                                                    strokeDasharray={circumference}
                                                    strokeDashoffset={offset}
                                                />
                                            </svg>
                                            <div className="company-detail-info-review-split-right-text">
                                                <p>{label}</p>
                                                <p>{percentage}%</p>
                                            </div>
                                        </div>

                                    </div>
                                )}
                                <div className="dashed-line"></div>
                                {expandedreview && (
                                    <div className="company-detail-info-review-rating-container">
                                        <div className="company-detail-info-review-rating-summary">
                                            {categories.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className={`company-detail-info-review-rating-item ${hoveredCategory === item.label ? "highlight" : ""
                                                        }`}
                                                    onMouseEnter={() => setHoveredCategory(item.label)}
                                                >
                                                    <span className="rating-label">{item.label}</span>
                                                    <span className="rating-stars">
                                                        {renderStars(item.score)}
                                                        <span style={{ color: "#333", fontWeight: "bold", marginLeft: "4px" }}>
                                                            {item.score}
                                                        </span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {hoveredCategory && (
                                            <div className="company-detail-info-review-rating-details">
                                                <h4>{hoveredCategory} Details</h4>
                                                {(ratingDetailsMap[hoveredCategory] || [])
                                                    .slice()
                                                    .sort((a, b) => a.star - b.star) // sắp xếp từ 1 đến 5
                                                    .map((item) => (
                                                        <div key={item.star} className="company-detail-info-review-rating-bar">
                                                            <span>
                                                                {item.star}
                                                            </span>
                                                             <span>{oneStars(item.star)}</span>
                                                            <div className="bar-container">
                                                                <div
                                                                    className="bar-fill"
                                                                    style={{ width: `${item.percent}%` }}
                                                                ></div>
                                                            </div>
                                                            <span>{item.percent}%</span>
                                                        </div>
                                                    ))}

                                            </div>
                                        )}
                                    </div>
                                )}
                                {/* Nút bấm để thu gọn hoặc xem thêm */}
                                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                                    <button
                                        onClick={() => setExpandedReview(!expandedreview)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#007bff',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        {expandedreview ? 'Thu gọn ▲' : 'Xem thêm ▼'}
                                    </button>
                                </div>
                                <div className="company-detail-info-review-comment-rating-box">
                                    <div className="company-detail-info-review-comment-rating-content">
                                        <h3 className="company-detail-info-review-comment-rating-title">
                                            Hãy dành một phút để chia sẻ kinh nghiệm làm việc của bạn tại <b>{company?.company_name}</b>
                                        </h3>

                                        <div className="company-detail-info-review-comment-stars-container">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span
                                                    key={star}
                                                    className={`company-detail-info-review-comment-star ${star <= (hoveredRating || rating) ? "active" : ""
                                                        }`}
                                                    onClick={() => handleStarClick(star)}
                                                    onMouseEnter={() => handleStarHover(star)}
                                                    onMouseLeave={handleStarLeave}

                                                >
                                                    ★
                                                </span>
                                            ))}
                                            <span className="company-detail-info-review-comment-star-label">
                                                Chọn sao để bắt đầu đánh giá
                                            </span>
                                        </div>


                                        <div className="company-detail-info-review-comment-warning">
                                            <i className="fa fa-info-circle" style={{ marginRight: 6 }}></i>
                                            Đánh giá của bạn cho {company?.company_name} sẽ được giữ ẩn danh.
                                        </div>
                                    </div>
                                </div>
                                <div className="company-detail-info-review-comment-container">
                                    <div className="company-detail-info-review-comment-list">
                                    {comments.map((review, index) => (
                                            <div key={index} className="company-detail-info-review-comment-container">
                                                <div className="company-detail-info-review-comment-header">
                                                    <p className="company-detail-info-review-comment-date">{review.date}</p>
                                                    <h3 className="company-detail-info-review-comment-title">{review.title}</h3>
                                                    <div className="company-detail-info-review-comment-rating">
                                                        <span className="company-detail-info-review-comment-stars">{"★".repeat(review.rating)}</span>
                                                        <span className="company-detail-info-review-comment-score">{review.rating}</span>
                                                        <span className="company-detail-info-review-comment-suggestion">
                                                            <i className="fa fa-thumbs-up" style={{ color: 'green', marginLeft: '8px' }}></i> Gợi ý
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="company-detail-info-review-comment-content">
                                                    <h4 className="company-detail-info-review-comment-subtitle">Điều tôi thích:</h4>
                                                    <p className="company-detail-info-review-comment-paragraph">{review.positive}</p>

                                                    <h4 className="company-detail-info-review-comment-subtitle">Đề xuất cải tiến:</h4>
                                                    <p className="company-detail-info-review-comment-paragraph">{review.improve}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </>
                    )}



                    <div className="company-detail-info-jobs">
                        <h3 className='company-detail-info-jobs-header'>We Have Some Jobs For You</h3>
                        <div className='company-detail-info-list-left'>
                            <div className='company-detail-info-list'>
                                <div className="company-detail-info-board-list-container">
                                    {isAuth() ? (
                                        <>
                                            {allJobData.map((job, index) => (
                                                <div key={index} className="company-detail-info-item">
                                                    <div className="company-detail-info-company-logo">
                                                        <img src={company.logo} alt="Company Logo" />
                                                    </div>
                                                    <div className="company-detail-info-sections">
                                                        <Link to={`/jobs/jobdetail/${job._id}`} className="company-detail-info-position-title">
                                                            <h2>{job.title}</h2>
                                                        </Link>
                                                        <p className="company-detail-info-company-name">{job.company}</p>
                                                        <span className="company-detail-info-salary">{job.salary}</span>
                                                        <div className="company-detail-info-details">
                                                            <span className="company-detail-info-location">📍 {job.location}</span>
                                                        </div>
                                                        <div className='company-detail-info-update-style'>
                                                            <p className="company-detail-info-update">
                                                                Cập nhật {formatUpdateTime(job.updated_at)} trước
                                                            </p>
                                                            <span className="company-detail-info-remaining-days">
                                                                ⏳ Còn {calculateRemainingDays(job.application_deadline)} ngày để ứng tuyển
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="company-detail-info-apply-section">
                                                        <button className="company-detail-info-apply-job-button" onClick={() => openApplyForm(job)}>Ứng tuyển</button>
                                                        <div className="company-detail-info-favorite-icon" onClick={() => toggleFavorite(job._id)}>
                                                            <span>{job.saved ? '❤️' : '🤍'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            {allJobDataUnAuth.map((job, index) => (
                                                <div key={index} className="company-detail-info-item">
                                                    <div className="company-detail-info-company-logo">
                                                        <img src={company.logo} alt="Company Logo" />
                                                    </div>
                                                    <div className="company-detail-info-sections">
                                                        <Link to={`/jobs/jobdetail/${job._id}`} className="company-detail-info-position-title">
                                                            <h2>{job.title}</h2>
                                                        </Link>
                                                        <p className="company-detail-info-company-name">{job.company}</p>
                                                        <span className="company-detail-info-salary">{job.salary}</span>
                                                        <div className="company-detail-info-details">
                                                            <span className="company-detail-info-location">📍 {job.location}</span>
                                                        </div>
                                                        <div className='company-detail-info-update-style'>
                                                            <p className="company-detail-info-update">
                                                                Cập nhật {formatUpdateTime(job.updated_at)} trước
                                                            </p>
                                                            <span className="company-detail-info-remaining-days">
                                                                ⏳ Còn {calculateRemainingDays(job.application_deadline)} ngày để ứng tuyển
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="company-detail-info-apply-section">
                                                        <button className="company-detail-info-apply-job-button" onClick={() => alert("Bạn chưa đăng nhập! Vui lòng đăng nhập để ứng tuyển.")}>Ứng tuyển</button>
                                                        <div className="company-detail-info-favorite-icon" onClick={() => toggleFavorite(job._id)}>
                                                            <span>{job.saved ? '❤️' : '🤍'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {jobToApply && (
                    <ApplyJob job={jobToApply} onClose={closeApplyForm} />
                )}

                <div className="company-detail-info-sidebar">
                    <div className="company-detail-info-contact">
                        <h3>Thông tin liên hệ</h3>
                        <p>📍 Địa chỉ công ty</p>
                        <p>🏢 {company?.location}</p>
                        <a href={""} target="_blank" rel="noopener noreferrer">
                            📍 Xem bản đồ
                        </a>
                        <div className="map-container">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=..."
                                width="100%"
                                height="200"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                title="Company Location"
                            ></iframe>
                        </div>
                    </div>
                    <div className="company-detail-info-share">
                        <h3>Chia sẻ công ty tới bạn bè</h3>
                        <p>Sao chép đường dẫn công ty</p>
                        <div className="share-link">
                            <input type="text" value={company?.website} readOnly />
                            <button>📋</button>
                        </div>
                        <p>Chia sẻ qua mạng xã hội</p>
                        <div className="company-detail-info-social-links">
                            <a href="#" className="facebook" aria-label="Facebook"></a>
                            <a href="#" className="twitter" aria-label="Twitter"></a>
                            <a href="#" className="linkedin" aria-label="LinkedIn"></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
