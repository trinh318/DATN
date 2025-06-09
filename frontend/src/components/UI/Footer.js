import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import LinkedIn from "../../assets/linkedin.png";
import instagram from "../../assets/instagram.png";
import "../../styles/footer.css"; // Import your CSS file

export default function Footer() {
    const linkUrl = useLocation();    //cfjds

    return (
        <div className="footer">
            <div class="follow-section">
                <h2>Follow us</h2>
                <p>Follow us on <b>Instagram</b> and <b>Facebook</b> to get updates on new jobs, companies and other fun stuff.</p>

                <div class="card-container">
                    <div class="card highlight-card yellow">
                        <p>Greet: your friend got hired <br></br>Me and my friend:</p>
                        <img src="friend-meme.jpg" alt="Friend got hired meme"></img>
                    </div>

                    <div class="card highlight-card pink">
                        <span class="spotlight">Company spotlight:</span>
                        <h3>Curb Food</h3>
                        <span class="new-tag">New!</span>
                        <img src="curb-food.jpg" alt="Curb Food"></img>
                    </div>

                    <div class="card highlight-card blue">
                        <span class="spotlight">Company spotlight:</span>
                        <h3>Depict.ai</h3>
                        <span class="new-tag">New!</span>
                        <img src="depict-ai.jpg" alt="Depict.ai"></img>
                    </div>

                    <div class="card highlight-card yellow">
                        <p>Greet: who do you want to refer?<br></br>Me:</p>
                        <img src="refer-meme.jpg" alt="Refer friend meme"></img>
                    </div>

                    <div class="card highlight-card pink">
                        <span class="spotlight">Company spotlight:</span>
                        <h3>Volta Greentech</h3>
                        <span class="new-tag">New!</span>
                        <img src="volta-greentech.jpg" alt="Volta Greentech"></img>
                    </div>
                </div>
            </div>
            <div className="footer-container">
                {!linkUrl.pathname.startsWith("/blog") && (
                    <div className="footer-wrapper">
                        <div className="footer-section" style={{ marginRight: "100px" }}>
                            <Link className="footer-logo-section" to="/">
                                <img src={logo} alt="logo" />
                                <h1 className="footer-logo-text">HirePoint</h1>
                            </Link>
                            <p className="footer-description">Quality over quantity.</p>
                            <a className="footer-contact" href="mailto:htttrinh1459@gmail.com">
                                htttrinh1459@gmail.com
                            </a>
                            <span className="footer-copyright">
                                Copyright © 2024 <span>To Trinh</span> Design.
                            </span>
                        </div>
                        <div className="footer-section">
                            <h1 className="footer-title">Welcome</h1>
                            <Link className="footer-link" to="/for-applicant">
                                How it works
                            </Link>
                            <Link className="footer-link" to="/jobs">
                                Find jobs
                            </Link>
                            <Link className="footer-link" to="/companies">
                                Find companies
                            </Link>
                            <Link className="footer-link" to="/sign-in">
                                Sign in
                            </Link>
                            <Link className="footer-link" to="/sign-up/new-applicant">
                                Sign up
                            </Link>
                        </div>
                        <div className="footer-section">
                            <h1 className="footer-title">Companies</h1>
                            <Link className="footer-link" to="/for-recruiter">
                                How it works
                            </Link>
                            <Link className="footer-link" to="/create-new-job">
                                Create job
                            </Link>
                            <Link className="footer-link" to="/sign-in">
                                Sign in
                            </Link>
                            <Link className="footer-link" to="/sign-up/new-recruiter">
                                Sign up
                            </Link>
                        </div>
                        <div className="footer-section">
                            <h1 className="footer-title">JobPortal</h1>
                            <Link className="footer-link" to="/about">
                                About us
                            </Link>
                            <Link className="footer-link" to="/privacy-policy">
                                Privacy policy
                            </Link>
                            <Link className="footer-link" to="/cookie-policy">
                                Cookie policy
                            </Link>
                        </div>
                        <div className="footer-section">
                            <h1 className="footer-title">Follow us</h1>
                            <a href="https://www.instagram.com/kha_martin/" target="_blank" rel="noreferrer">
                                <img src={instagram} alt="Instagram" className="footer-icon" />
                            </a>
                            <a href="https://github.com/Nhat-Kha" target="_blank" rel="noreferrer">
                                <img src={LinkedIn} alt="LinkedIn" className="footer-icon" />
                            </a>
                        </div>
                    </div>
                )}
                {/* Include additional content for "/blog" route here if needed */}
            </div>
        </div>

    );
}