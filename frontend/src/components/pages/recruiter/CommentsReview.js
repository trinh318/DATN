import React, { useState, useEffect } from 'react';
import '../../../styles/companydetail.css';
import axios from 'axios';
import { getId } from '../../../libs/isAuth';
import { FaStar, FaStarHalfAlt, FaRegStar, FaThumbsUp } from "react-icons/fa";

export default function CommentsReview() {
    const idnd = getId();
    const [companyId, setCompanyId] = useState(null);
    const [percentage, setPercentage] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedreview, setExpandedReview] = useState(false);
    const [visibleCount, setVisibleCount] = useState(3);
    const radius = 50;
    const stroke = 10;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const responseCompany = await axios.get(`http://localhost:5000/api/companies/${idnd}`);
                setCompanyId(responseCompany.data._id);
            } catch (error) {
                setError('Failed to load companyId.');
            } finally {
                setLoading(false);
            }
        };

        if (idnd) {
            fetchCompany();
        } else {
            console.log('idnd is not valid:', idnd);
        }
    }, [idnd]);

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

    const [reviewStats, setReviewStats] = useState(null);
    const [categories, setCategories] = useState([]);
    const [ratingDetailsMap, setRatingDetailsMap] = useState({});
    const [hoveredCategory, setHoveredCategory] = useState("Salary & benefits");
    const [ratings, setRatings] = useState([]);
    const [label, setLabel] = useState("");

    useEffect(() => {
        if (expandedreview && !hoveredCategory) {
            setHoveredCategory("Salary & benefits");
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
                        star: index + 1,
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
        console.log("rating: ", ratings)
    }, [companyId]);

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

    const handleShowMore = () => {
        const remaining = comments.length - visibleCount;
        setVisibleCount(visibleCount + (remaining >= 5 ? 5 : remaining));
    };

    const handleCollapse = () => {
        setVisibleCount(3);
    };

    const isExpanded = visibleCount >= comments.length;

    return (
        <div className="bg-white w-full">
            {ratings?.length > 0 && (
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <div className="flex flex-1 flex-col md:flex-row pr-2 gap-4 w-full">
                        {/* Left Block */}
                        <div className="flex flex-col w-full md:w-[30%] bg-white rounded-lg py-4 text-center justify-center items-center font-bold">
                            <p className="text-4xl font-bold text-black mb-1">{averageRating}</p>
                            <div className="relative inline-block text-[1.5rem] text-[#fff4e9] leading-none">
                                <div className="absolute top-0 left-0 whitespace-nowrap text-[#ff9119] overflow-hidden" style={{ width: `${(isNaN(averageRating) ? 0 : (averageRating / 5) * 100)}%` }}>
                                    ★★★★★
                                </div>
                                <div>★★★★★</div>
                            </div>
                            <div className="text-sm font-normal text-[#286E93]"> {totalReviews} reviews </div>
                        </div>

                        {/* Right Block */}
                        <div className="w-full md:w-[70%] bg-white rounded-lg py-4">
                            <div className="flex flex-col gap-1 max-w-[500px]">
                                {ratings.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                        <span className="font-semibold text-[#286E93] text-[1.1rem] w-[35px] text-right shrink-0">{item.stt}</span>
                                        <span className="text-[#ff9119] text-[1.2rem] shrink-0">★</span>
                                        <div className="flex-1 h-[10px] bg-[#fff4e9] rounded-md overflow-hidden relative min-w-0">
                                            <div className="bg-[#ff9119] h-full transition-all duration-300 ease-in-out" style={{ width: `${item.score}%` }}></div>
                                        </div>
                                        <span className="ml-2 text-gray-700 text-[0.9rem] whitespace-nowrap w-[40px] text-right shrink-0">
                                            {item.score}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Dashed line */}
                    <div className="hidden md:block border-l border-dashed border-black h-[120px] opacity-50"></div>

                    {/* Circular Progress */}
                    <div className="relative w-[120px] h-[120px]">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r={radius} strokeWidth={stroke} className="fill-none stroke-[#ddd]" />
                            <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                strokeWidth={stroke}
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                className="fill-none stroke-green-500 transition-[stroke-dashoffset] duration-\[350ms\]"
                            />
                        </svg>
                        <div className="text-lg text-[#286E93] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <p>{label}</p>
                            <p>{percentage}%</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="border-t border-dashed border-black opacity-50 pb-5"></div>

            {expandedreview && (
                <div className="flex gap-10 pb-5"> {/* ensure equal height columns */}
                    {/* Left column */}
                    <div className="w-full sm:w-3/5 flex flex-col gap-2 justify-between">
                        {categories.map((item, index) => (
                            <div
                                key={index}
                                onMouseEnter={() => setHoveredCategory(item.label)}
                                className={`flex items-center text-sm text-[#286E93] cursor-pointer ${hoveredCategory === item.label ? 'bg-yellow-100 border-l-4 border-[#f39c12] text-[#f26522] font-bold' : ''} px-2 py-1 rounded-md`}
                            >
                                <div className="w-[40%] truncate">
                                    {item.label}
                                </div>
                                <div className="w-[60%] flex items-center justify-end gap-4">
                                    <div className="flex items-center text-orange-500 gap-1">
                                        {renderStars(item.score)}
                                    </div>
                                    <div className="text-right font-medium text-gray-800">
                                        {item.score}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right column */}
                    {hoveredCategory && (
                        <div className="w-full sm:w-2/5 flex flex-col justify-between">
                            <h4 className="font-semibold text-sm text-[#286E93]">{hoveredCategory} Details</h4>
                            <div className="flex flex-col gap-2">
                                {(ratingDetailsMap[hoveredCategory] || [])
                                    .sort((a, b) => a.star - b.star)
                                    .map((item) => (
                                        <div key={item.star} className="flex items-center gap-4">
                                            <span className='text-sm text-[#286E93]'>{item.star}</span>
                                            <span className="-ml-2 items-center">{oneStars(item.star)}</span>
                                            <div className="flex-1 h-[10px] bg-gray-200 rounded-md overflow-hidden">
                                                <div className="bg-yellow-400 h-full" style={{ width: `${item.percent}%` }}></div>
                                            </div>
                                            <span className="text-right text-[#286E93] w-9 text-sm">{item.percent}%</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Toggle Expand */}
            <div className="text-center pb-5">
                <button
                    onClick={() => setExpandedReview(!expandedreview)}
                    className="text-[#286E93] hover:underline text-sm"
                >
                    {expandedreview ? 'Thu gọn ▲' : 'Chi tiết ▼'}
                </button>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
                {comments.slice(0, visibleCount).map((review, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg hover:shadow-md transition duration-200 space-y-3 border border-gray-100">
                        {/* Header */}
                        <div>
                            <p className="text-[10px] text-gray-400">{review.date}</p>
                            <h3 className="text-base font-semibold text-gray-800">{review.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="relative inline-block text-base text-[#fff4e9] leading-none">
                                    <div
                                        className="absolute top-0 left-0 whitespace-nowrap text-yellow-400 overflow-hidden"
                                        style={{ width: `${(isNaN(review.rating) ? 0 : (review.rating / 5) * 100)}%` }}
                                    >
                                        ★★★★★
                                    </div>
                                    <div>★★★★★</div>
                                </div>
                                <span className="flex items-center text-green-600 text-sm ml-2">
                                    <i className="fa fa-thumbs-up mr-1"></i> Gợi ý
                                </span>
                            </div>
                        </div>

                        <hr className="border-t border-gray-200" />

                        {/* Body */}
                        <div className="text-sm space-y-2">
                            <div className='flex gap-2'>
                                <h4 className="font-semibold text-gray-700">Điều tôi thích:</h4>
                                <p className="text-gray-800 leading-relaxed">{review.positive}</p>
                            </div>
                            <div className='flex gap-2'>
                                <h4 className="font-semibold text-gray-700">Đề xuất cải tiến:</h4>
                                <p className="text-gray-800 leading-relaxed">{review.improve}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {comments.length > 3 && (
                <div className="text-center pb-5 pt-2">
                    <button
                        onClick={isExpanded ? handleCollapse : handleShowMore}
                        className="text-[#286E93] hover:underline text-sm"
                    >
                        {isExpanded ? 'Thu gọn ▲' : 'Xem thêm ▼'}
                    </button>
                </div>
            )}
        </div>
    );
}
