import { UserButton, useUser } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/control/ui/button";
import DropNavBar from "./DropNavBar";
import DropNavBarCenter from "./DropNavBarCenter";
import RecruiterNavbar from "../pages/recruiter/RecruiterNavbar";
import Jobs from "../pages/job/Job";
import logo from "../../assets/logo.png";
import { isAuth, userType } from "../../libs/isAuth";
import ApplicantNavBar from "../pages/applicant/ApplicantNavBar";
import AdminNavbar from "../pages/admin/AdminNavbar";

function Header() {
    const { user, isSignedIn } = useUser();
    const location = useLocation();
    const isBlogHome = location.pathname.startsWith("/blog-home");
    const isBlog = location.pathname.startsWith("/blog");

    return (
        <div className="relative z-50 p-3 px-5 flex justify-between items-center shadow-lg bg-white h-[60px]">
            <Link to="/" className="flex items-center">
                <img src="/logo.svg" className="w-[100px]" />
                <h1 className="text-xl pl-2 font-bold text-[#2c6170] leading-none">HirePoint</h1>
            </Link>

            {isAuth() ? (
                userType() === "applicant" ? (
                    <>
                        <div className="flex items-center gap-8">
                            {isBlogHome ? (
                                <>
                                    <Link to="/" className="text-base text-gray-800 hover:text-[#147882] leading-none">Home</Link>
                                    <Link to="/" className="text-base text-gray-800 hover:text-[#147882] leading-none">Messages</Link>
                                    <Link to="/" className="text-base text-gray-800 hover:text-[#147882] leading-none">Notifications</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/create-cv-with-ai" className="text-base text-gray-800 hover:text-[#147882] leading-none">Create CV with AI</Link>
                                    <Link to="/create-cv-with-ai/my-resume/analyzer" className="text-base text-gray-800 hover:text-[#147882] leading-none">Resume Analyzer</Link>
                                    <Jobs to="/jobs" className="text-base text-gray-800 hover:text-[#147882]leading-none">Jobs</Jobs>
                                    <Link to="/companies" className="text-base text-gray-800 hover:text-[#147882] leading-none">Companies</Link>
                                </>
                            )}
                        </div>
                        <ApplicantNavBar />
                    </>
                ) : userType() === "recruiter" ? (
                    <>
                        <RecruiterNavbar />
                    </>
                ) : userType() === "admin" ? (
                    <div className="flex items-center gap-8">
                        <AdminNavbar />
                    </div>
                ) : null
            ) : isBlogHome ? (
                <>
                    <div className="flex items-center gap-8">
                        <Link to="/" className="text-base text-gray-800 hover:text-[#147882] leading-none">Home</Link>
                        <Link to="/" className="text-base text-gray-800 hover:text-[#147882] leading-none">Messages</Link>
                        <Link to="/" className="text-base text-gray-800 hover:text-[#147882] leading-none">Notifications</Link>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-8">
                        <Link to="/recruiter-homepage" className="text-base text-gray-800 hover:text-[#147882] leading-none">Nhà tuyển dụng</Link>
                        <Jobs to="/jobs" className="text-base text-gray-800 hover:text-[#147882] leading-none">Jobs</Jobs>
                        <Link to="/companies" className="text-base text-gray-800 hover:text-[#147882] leading-none">Companies</Link>
                        <Link to="/create-cv-with-ai/my-resume/analyzer" className="text-base text-gray-800 hover:text-[#147882] leading-none">Resume Analyzer</Link>
                    </div>
                </>
            )}
            {!isAuth() && !isBlog && (
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2">
                        <Link to="/sign-in" className="text-base text-gray-800 hover:text-[#213A57] leading-none">Sign in</Link>
                        <Link to="/sign-up">
                            <span className="flex items-center justify-center h-10 bg-[#213A57] text-white rounded-full px-3 py-1 text-base hover:bg-[#213A57] leading-none">
                                Sign up
                            </span>
                        </Link>
                    </div>
                </div>
            )}
            {isSignedIn && <UserButton />}
        </div>
    );
}

export default Header;
