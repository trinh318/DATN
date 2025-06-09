import '../../../styles/signin.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiList from '../../../libs/apiList'
import { login } from '../../../libs/isAuth';

export default function RecruiterSignIn() {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false); // Đặt mặc định là true để Sign Up hiển thị trước
    const navigate = useNavigate();

    const handleOverlayClick = () => {
        setIsRightPanelActive(!isRightPanelActive);
    };

    const handleSignInClick = () => {
        navigate('/recruiter-sign-in'); // Chuyển hướng đến trang sign-in
    };

    const handleSignUpClick = () => {
        navigate('/recruiter-sign-up'); // Chuyển hướng đến trang sign-in
    };

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
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
                setError(data.message); // Hiển thị thông báo lỗi
            }
        } catch (err) {
            setError('Đăng nhập thất bại. Vui lòng thử lại.');
            console.error(err);
        }
    };

    return (
        <div className='auth-body'>
            <div className={`auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container" style={{ height: "700px" }}>
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
                            <input className="infield-input" type="text" placeholder="Username" />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="email" placeholder="Email" name="email" />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="password" placeholder="Password" />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="password" placeholder="Confirm Password" />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="text" placeholder="Phone Number" />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="password" placeholder="Company Name" />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="password" placeholder="Major" />
                            <label className="infield-label"></label>
                        </div>
                        <div className="infield">
                            <input className="infield-input" type="password" placeholder="Address" />
                            <label className="infield-label"></label>
                        </div>
                        <button className='auth-button'>Sign Up</button>
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
                    <button id="overlayBtn" style={{ top: "402px" }} onClick={handleOverlayClick} className="btnScaled"></button>
                </div>
            </div>
        </div>
    );
}
