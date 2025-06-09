import '../../../styles/signin.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFacebookF, FaGooglePlusG, FaLinkedinIn } from 'react-icons/fa';
import apiList from '../../../libs/apiList'
import { login } from '../../../libs/isAuth';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../../../libs/firebase-config'; // đường dẫn tùy bạn đặt

export default function SignIn() {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false); // Đặt mặc định là true để Sign Up hiển thị trước
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const handleOverlayClick = () => {
        setIsRightPanelActive(!isRightPanelActive);
    };

    const handleSignInClick = () => {
        navigate('/sign-in'); // Chuyển hướng đến trang sign-in
    };

    const handleSignUpClick = () => {
        navigate('/sign-up'); // Chuyển hướng đến trang sign-in
    };

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const validateSecurePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(apiList.login, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
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
                if (response.status === 403)
                    alert(data.message);
                if (response.status === 400) {
                    alert('Mật khẩu hoặc email không hợp lệ');
                } else {
                    setError(data.message); // Hiển thị thông báo lỗi khác
                }
            }


        } catch (err) {
            setError('Đăng nhập thất bại. Vui lòng thử lại.');
            console.error(err);
        }
    };

    const handleSubmitSignUp = async (e) => {
        e.preventDefault();

        // Kiểm tra nếu mật khẩu và xác nhận mật khẩu khớp
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
        try {
            const response = await fetch('http://localhost:5000/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: form.username,
                    password: form.password,
                    email: form.email,
                    role: 'applicant',
                    phone: '',
                    avatar: null
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                if (response.status === 400 && data.message === "Username đã tồn tại.") {
                    alert("Tên người dùng đã tồn tại. Vui lòng chọn tên khác.");
                } else {
                    alert(data.message || "Đăng ký thất bại!");
                }
            } else {
                alert(data.message);
                setForm({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                });

                navigate("/sign-in");
            }
        } catch (error) {
            console.error("Đã xảy ra lỗi khi đăng ký:", error);
            alert("Đăng ký thất bại!");
        }
    };

    const handleLoginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
    
            // Gửi email và name lên backend
            const response = await fetch('http://localhost:5000/api/users/google-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    name: user.displayName,
                }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                login(data.token, data.role, data.userId);
                // Điều hướng tùy theo role
                if (data.role === 'admin') {
                    navigate('/admin-page');
                } else if (data.role === 'recruiter') {
                    navigate('/recruiter-page');
                } else {
                    navigate('/applicant-page');
                }
            } else {
                alert(data.message || "Đăng nhập bằng Google thất bại.");
            }
    
        } catch (error) {
            console.error("Lỗi đăng nhập với Google:", error.message);
            alert("Đăng nhập bằng Google thất bại.");
        }
    };

    const handleLoginWithFacebook = async () => {
        try {
            const result = await signInWithPopup(auth, facebookProvider);
            const user = result.user;
            
            // Gửi email và name lên backend (giống như Google)
            const response = await fetch('http://localhost:5000/api/users/facebook-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    name: user.displayName,
                }),
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
                alert(data.message || "Đăng nhập bằng Facebook thất bại.");
            }
        } catch (error) {
            console.error("Lỗi đăng nhập với Facebook:", error.message);
            alert("Đăng nhập bằng Facebook thất bại.");
        }
    };    
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    return (
        <div className='auth-body'>
            <div className={`auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
                <div className="auth-form-container sign-up-container">
                    <form className='auth-form' action="#">
                        <h1 className='auth-form-header'>Create Account</h1>
                        <div className="social-container">
                            <a className="social" onClick={handleLoginWithFacebook}><FaFacebookF /></a>
                            <a className="social" onClick={handleLoginWithGoogle}><FaGooglePlusG /></a>
                            <a href="#" className="social"><FaLinkedinIn /></a>
                        </div>
                        <span className='auth-form-span'>or use your email for registration</span>
                        <div className="infield">
                            <input className="infield-input" type="text" name="username" placeholder="Username" value={form.username}
                                onChange={handleChange}
                                required />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="email" placeholder="Email" name="email" value={form.email}
                                onChange={handleChange}
                                required />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="password" placeholder="Password" name='password' value={form.password}
                                onChange={handleChange}
                                required />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="password" name="confirmPassword" placeholder="Comfirm Password" value={form.confirmPassword}
                                onChange={handleChange}
                                required />
                            <label className="infield-label"></label>
                        </div>
                        <button onClick={handleSubmitSignUp} className='auth-button'>Sign Up</button>
                    </form>
                </div>
                <div className="auth-form-container sign-in-container">
                    <form className='auth-form' action="#">
                        <h1 className='auth-form-header'>Sign in</h1>
                        <div className="social-container">
                            <a className="social" onClick={handleLoginWithFacebook}><FaFacebookF /></a>
                            <a className="social" onClick={handleLoginWithGoogle}><FaGooglePlusG /></a>
                            <a href="#" className="social"><FaLinkedinIn /></a>
                        </div>
                        <span className='auth-form-span'>or use your account</span>
                        <div className="infield">
                            <input
                                className="infield-input"
                                type="email"
                                placeholder="Email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} // Cập nhật state
                                required
                            />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input
                                className="infield-input"
                                type="password"
                                placeholder="Password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} // Cập nhật state
                                required
                            />
                            <label className="infield-label"></label>
                        </div>
                        <a href="#" className="forgot">Forgot your password?</a>
                        <button className='auth-button' type='button' onClick={handleSubmit}>Sign In</button>
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
                    <button id="overlayBtn" onClick={handleOverlayClick} className="btnScaled"></button>
                </div>
            </div>
        </div>
    );
}
