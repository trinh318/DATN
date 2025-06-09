import '../../../styles/signin.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { login } from '../../../libs/isAuth';
import apiList from '../../../libs/apiList'

const locations = {
    "Việt Nam": {
        "Hà Nội": ["Quận Ba Đình", "Quận Hoàn Kiếm", "Quận Đống Đa", "Quận Cầu Giấy", "Quận Tây Hồ"],
        "Hồ Chí Minh": [
            "Huyện Bình Chánh",
            "Huyện Cần Giờ",
            "Huyện Củ Chi",
            "Huyện Hóc Môn",
            "Huyện Nhà Bè",
            "Quận 1",
            "Quận 2",
            "Quận 3",
            "Quận 7",
            "Quận 9"
        ],
        "Đà Nẵng": ["Quận Hải Châu", "Quận Cẩm Lệ", "Quận Liên Chiểu", "Quận Ngũ Hành Sơn", "Quận Sơn Trà"],
        "Cần Thơ": ["Quận Ninh Kiều", "Quận Bình Thủy", "Quận Cái Răng", "Huyện Phong Điền"]
    },
    "Afghanistan": {
        "Kabul": ["District 1", "District 2", "District 3", "District 4"],
        "Herat": ["Guzara", "Kohsan", "Obeh"],
        "Kandahar": ["Daman", "Panjwai", "Spin Boldak"]
    },
    "Albania": {
        "Tirana": ["Kashar", "Farkë", "Peza", "Zall-Herr"],
        "Durrës": ["Ishëm", "Rrashbull", "Sukth"]
    },
    "Algeria": {
        "Algiers": ["Bab El Oued", "El Madania", "Hussein Dey"],
        "Oran": ["El Kerma", "Es Senia", "Bir El Djir"],
        "Constantine": ["Beni Hamidane", "Didouche Mourad", "Hamma Bouziane"]
    },
    "American Samoa": {
        "Tutuila": ["Pago Pago", "Tafuna", "Nu'uuli"],
        "Manu'a Islands": ["Ta'u", "Ofu", "Olosega"]
    }
};

export default function RecruiterSignUp() {


    const [isRightPanelActive, setIsRightPanelActive] = useState(true); // Đặt mặc định là true để Sign Up hiển thị trước
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        phone: '',
        company_name: '',
        industry: '',
        location: '',
    });
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const validateSecurePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        return passwordRegex.test(password);
    };
    const validateFields = () => {
        const requiredFields = [
            { name: 'first_name', label: 'First Name' },
            { name: 'last_name', label: 'Last Name' },
            { name: 'phone', label: 'Phone Number' },
            { name: 'company_name', label: 'Company Name' },
            { name: 'industry', label: 'Major' },
            { name: 'location', label: 'Location' },
        ];

        for (const field of requiredFields) {
            if (!form[field.name].trim()) {
                alert(`Vui lòng điền ${field.label}.`);
                return false;
            }
        }
        return true;
    };
    const validatePhoneNumber = (phone) => {
        // Regex for valid Vietnamese phone number
        const phoneRegex = /^(0[3|5|7|8|9])\d{8}$/;
        return phoneRegex.test(phone);
    };

    const handleOverlayClick = () => {
        setIsRightPanelActive(!isRightPanelActive);
    };

    const handleSignInClick = () => {
        navigate('/recruiter-sign-in'); // Chuyển hướng đến trang sign-in
    };

    const handleSignUpClick = () => {
        navigate('/recruiter-sign-up'); // Chuyển hướng đến trang sign-in
    };
    const [emaillogin, setEmail] = useState('');
    const [passwordlogin, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmitSignIn = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(apiList.login, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ emaillogin, passwordlogin }),
            });

            const data = await response.json();

            if (response.ok) {
                login(data.token, data.role, data.userId);

                if (data.role === 'admin') {
                    navigate('/admin-page');
                } else if (data.role === 'recruiter') {
                    navigate('/recruiter-page');
                } else {
                    navigate('/applicant-page');
                }
            } else {
                setError(data.message); // Hiển thị thông báo lỗi
            }
        } catch (err) {
            setError('Đăng nhập thất bại. Vui lòng thử lại.');
            console.error(err);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Form data:", form); // Debug toàn bộ dữ liệu form
        if (form.password !== form.confirmPassword) {
            alert("Mật khẩu không khớp!");
            return;
        }
        if (!validateEmail(form.email)) {
            alert("Email không hợp lệ!");
            return;
        }
        if (!validateSecurePassword(form.password)) {
            alert("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
            return;
        }

        // Kiểm tra nếu mật khẩu và xác nhận mật khẩu khớp
        if (form.password !== form.confirmPassword) {
            alert("Mật khẩu không khớp!");
            return;
        }
        if (!validatePhoneNumber(form.phone)) {
            alert("Số điện thoại không hợp lệ!");
            return;
        }
        if (!validateFields()) {
            return; // Nếu thiếu dữ liệu, dừng việc submit
        }
        try {
            const response = await fetch('http://localhost:5000/api/recruiters/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: form.username,
                    password: form.password,
                    email: form.email,
                    phone: form.phone,
                    first_name: form.first_name,
                    last_name: form.last_name,
                    company_name: form.company_name,
                    industry: form.industry,
                    location: form.location
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Đăng ký thất bại!");
            } else {
                alert(data.message);
                navigate('/recruiter-sign-in');
            }
        } catch (error) {
            console.error("Đã xảy ra lỗi khi đăng ký:", error);
            //            alert("Đăng ký thất bại!");
        }
    };

    // Trạng thái cho ô địa chỉ 1
    const [currentLevel1, setCurrentLevel1] = useState(locations); // Cấp hiện tại
    const [breadcrumbs1, setBreadcrumbs1] = useState([]); // Lưu đường dẫn đã chọn
    const [selectedValue1, setSelectedValue1] = useState(""); // Giá trị đã chọn
    const [isMenuOpen1, setIsMenuOpen1] = useState(false); // Trạng thái mở menu

    // Trạng thái cho ô địa chỉ 2
    const [currentLevel2, setCurrentLevel2] = useState(locations); // Cấp hiện tại
    const [breadcrumbs2, setBreadcrumbs2] = useState([]); // Lưu đường dẫn đã chọn
    const [selectedValue2, setSelectedValue2] = useState(""); // Giá trị đã chọn
    const [isMenuOpen2, setIsMenuOpen2] = useState(false); // Trạng thái mở menu
    const [currentLevel3, setCurrentLevel3] = useState([]); // Danh sách quận/huyện

    const fetchCountries = async () => {
        try {
            const response = await axios.get(
                `http://api.geonames.org/countryInfoJSON?formatted=true&username=ngoc141&style=full`
            );
            setCurrentLevel1(response.data.geonames); // Lưu danh sách quốc gia
        } catch (error) {
            console.error("Lỗi khi lấy danh sách quốc gia", error);
        }
    };

    // Hàm lấy danh sách tỉnh/thành phố
    const fetchProvinces = async (countryId) => {
        try {
            const response = await axios.get(
                `http://api.geonames.org/childrenJSON?geonameId=${countryId}&username=ngoc141`
            );
            setCurrentLevel2(response.data.geonames); // Lưu danh sách tỉnh/thành phố
        } catch (error) {
            console.error("Lỗi khi lấy danh sách tỉnh/thành phố", error);
        }
    };

    // Hàm lấy danh sách quận/huyện
    const fetchCities = async (provinceId) => {
        try {
            const response = await axios.get(
                `http://api.geonames.org/childrenJSON?geonameId=${provinceId}&username=ngoc141`
            );
            setCurrentLevel3(response.data.geonames); // Lưu danh sách quận/huyện
        } catch (error) {
            console.error("Lỗi khi lấy danh sách quận/huyện", error);
        }
    };

    const handleSelect1 = async (key) => {
        const selectedItem = currentLevel1.find((item) => item.geonameId === key); // Find the selected location

        if (selectedItem) {
            if (breadcrumbs1.length === 0) {
                // Selecting at the country level
                try {
                    const response = await axios.get(
                        `http://api.geonames.org/childrenJSON?geonameId=${key}&username=ngoc141`
                    );
                    setCurrentLevel1(response.data.geonames); // Get list of provinces/cities
                    setBreadcrumbs1([...breadcrumbs1, selectedItem.countryName]); // Update breadcrumbs
                } catch (error) {
                    console.error("Error fetching provinces/cities", error);
                }
            } else if (breadcrumbs1.length === 1) {
                // Selecting at the province/city level
                try {
                    const response = await axios.get(
                        `http://api.geonames.org/childrenJSON?geonameId=${key}&username=ngoc141`
                    );
                    setCurrentLevel1(response.data.geonames); // Get list of districts
                    setBreadcrumbs1([...breadcrumbs1, selectedItem.name]); // Update breadcrumbs
                } catch (error) {
                    console.error("Error fetching districts", error);
                }
            } else {
                // Selecting the final level
                const selectedLocation = [...breadcrumbs1, selectedItem.name].join(", ");
                setSelectedValue1(selectedLocation); // Save the selected value
                setForm((prevForm) => ({
                    ...prevForm,
                    location: selectedLocation,
                }));
                setIsMenuOpen1(false); // Close menu
            }
        }
    };

    const handleBack1 = async () => {
        if (breadcrumbs1.length === 2) {
            // Đang ở cấp quận/huyện, quay lại cấp tỉnh/thành phố
            const countryId = currentLevel1[0].countryId; // Lấy ID quốc gia từ breadcrumbs
            await fetchProvinces(countryId); // Lấy lại danh sách tỉnh/thành phố
        } else if (breadcrumbs1.length === 1) {
            // Đang ở cấp tỉnh/thành phố, quay lại cấp quốc gia
            await fetchCountries(); // Lấy lại danh sách quốc gia
        }
        setBreadcrumbs1(breadcrumbs1.slice(0, -1)); // Xóa cấp cuối khỏi breadcrumbs
    };


    const toggleMenu1 = () => {
        setIsMenuOpen1(!isMenuOpen1);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value,
        });
    };
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await axios.get(
                    `http://api.geonames.org/countryInfoJSON?formatted=true&username=ngoc141&style=full`
                );

                if (response.data && response.data.geonames) {
                    setCurrentLevel1(response.data.geonames); // Lưu danh sách quốc gia
                    console.log('Fetched countries:', response.data.geonames);
                } else {
                    console.error("No 'geonames' data in the response");
                }
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        };

        fetchCountries();
    }, []);


    return (
        <div className='auth-body'>
            <div className={`auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container" style={{ height: "900px" }}>
                <div className="auth-form-container sign-up-container">
                    <form className='auth-form' action="#">
                        <h1 className='auth-form-header'>Create Account</h1>
                        <div className="social-container">
                            <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
                            <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
                        </div>
                        <span className='auth-form-span'>or use your email for registration</span>
                        <div className="infield">
                            <input className="infield-input" type="text" name='username' value={form.username} placeholder="Username"
                                onChange={handleChange}
                                required />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="email" name='email' value={form.email} placeholder="Email"
                                onChange={handleChange}
                                required />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="password" name='password' value={form.password} placeholder="Password"
                                onChange={handleChange}
                                required />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="password" name='confirmPassword' value={form.confirmPassword} placeholder="Confirm Password"
                                onChange={handleChange}
                                required />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="text" name='first_name' value={form.first_name} placeholder="First Name"
                                onChange={handleChange}
                                required />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="text" name='last_name' value={form.last_name} placeholder="Last Name"
                                onChange={handleChange}
                                required />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="text" name='phone' value={form.phone} placeholder="Phone Number"
                                onChange={handleChange}
                                required />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="text" name='company_name' value={form.company_name} placeholder="Company Name"
                                onChange={handleChange}
                                required />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="text" name='industry' value={form.industry} placeholder="Major"
                                onChange={handleChange}
                                required />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <div className="infield-select-input" onClick={toggleMenu1}>
                                {selectedValue1 || "Location"}
                            </div>
                            {isMenuOpen1 && (
                                <div className="user-info-edit-menu">
                                    <div className="user-info-edit-breadcrumbs">
                                        {breadcrumbs1.length > 0 && (
                                            <button onClick={handleBack1}>&lt;</button>
                                        )}
                                        <span>{breadcrumbs1.join(", ") || "Chọn địa điểm"}</span>
                                    </div>
                                    <ul className="user-info-edit-options">
                                        {currentLevel1.map((item) => (
                                            <li
                                                key={item.geonameId}
                                                onClick={() => handleSelect1(item.geonameId)}
                                                className="user-info-edit-option"
                                            >
                                                {item.name || item.countryName}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <label className="infield-label"></label>
                        </div>
                        <button onClick={handleSubmit} className='auth-button'>Sign Up</button>
                    </form>
                </div>
                <div className="auth-form-container sign-in-container">
                    <form className='auth-form' action="#">
                        <h1 className='auth-form-header'>Sign in</h1>
                        <div className="social-container">
                            <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
                            <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
                        </div>
                        <span className='auth-form-span'>or use your account</span>
                        <div className="infield">
                            <input
                                className="infield-input"
                                type="email"
                                placeholder="Email"
                                name="emaillogin"
                                value={emaillogin} // Matches state
                                onChange={(e) => setEmail(e.target.value)} // Updates state correctly
                                required
                            />
                        </div>
                        <div className="infield">
                            <input
                                className="infield-input"
                                type="password"
                                placeholder="Password"
                                name="passwordlogin"
                                value={passwordlogin} // Matches state
                                onChange={(e) => setPassword(e.target.value)} // Updates state correctly
                                required
                            />
                        </div>

                        <a href="#" className="forgot">Forgot your password?</a>
                        <button className='auth-button' type='button' onClick={handleSubmitSignIn}>Sign In</button>
                    </form>
                </div>
                <div className="overlay-container" id="overlayCon">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1 className='overlay-panel-header'>Welcome back!</h1>
                            <p className='overlay-panel-p'>To keep connected with us please login with your personal info</p>
                            <button
                                className='overlay-panel-button'
                                onClick={() => { handleOverlayClick(); handleSignInClick(); }} >
                                Sign In
                            </button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1 className='overlay-panel-header'>Hello, Friend!</h1>
                            <p className='overlay-panel-p'>Enter your personal details and start your journey with us</p>
                            <button
                                className='overlay-panel-button'
                                onClick={() => { handleOverlayClick(); handleSignUpClick(); }} >
                                Sign Up
                            </button>
                        </div>
                    </div>
                    <button id="overlayBtn" style={{ top: "502px" }} onClick={handleOverlayClick} className="btnScaled"></button>
                </div>
            </div>
        </div>
    );
}
