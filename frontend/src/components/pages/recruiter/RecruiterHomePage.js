import "../../../styles/recruiterhomepage.css";
import { Link, useNavigate  } from "react-router-dom";
import { useEffect, useState} from "react";
import axios from 'axios';

export default function RecruiterHomePage() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleCardClick = (packageId) => {
        navigate(`/package/${packageId}`);
    };

    const fetchPackages = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/package/view'); // hoặc URL đầy đủ nếu cần
            setPackages(res.data.packages);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách gói:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPackages()

    })
    useEffect(() => {
        const handleWheel = (e) => {
            if (window.scrollY === 0 && e.deltaY > 0) {
                const targetSection = document.getElementById("recruiter-info-section");
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: "smooth" });
                }
            }
        };

        window.addEventListener("wheel", handleWheel);

        return () => {
            window.removeEventListener("wheel", handleWheel);
        };
    }, []);

    return (
        <div>
            <div className="recruiter-gradient-container">
                <h1 className="recruiter-title">Chào mừng nhà tuyển dụng!</h1>
                <p className="recruiter-subtitle">
                    Tìm kiếm tài năng, xây dựng đội ngũ và nâng tầm doanh nghiệp của bạn.
                </p>
                <div className="recruiter-button-container">
                    <Link to="/recruiter-sign-in" className="recruiter-btn recruiter-login-btn">Đăng nhập</Link>
                    <Link to="/recruiter-sign-up" className="recruiter-btn recruiter-register-btn">Đăng ký ngay</Link>
                </div>

                {/* Dấu mũi tên luôn ở dưới */}
                <div className="scroll-down-arrow">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M12 16.5l-8-8 1.41-1.41L12 13.67l6.59-6.58L20 8.5z" />
                    </svg>
                </div>

            </div>

            <div className="recruiter-gradient-package-wrapper">
                {loading ? (
                    <p>Đang tải các gói dịch vụ...</p>
                ) : packages.length > 0 ? (
                        packages.map((item) => (
                            <div className="recruiter-gradient-package-card" key={item._id} onClick={() => handleCardClick(item._id)} // thêm onClick
                                style={{ cursor: "pointer" }}>
                                <div className="recruiter-gradient-package-icon recruiter-gradient-package-icon-vip"></div>
                                <h3 className="recruiter-gradient-package-title">{item.name}</h3>
                                <p className="recruiter-gradient-package-description">
                                {item.description}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>Không có gói dịch vụ nào.</p>
                )}
            </div>
        </div>
    );
}

