import { BrowserRouter as Router, Route, Routes, useLocation, matchPath } from "react-router-dom";
import { NotificationProvider } from "./libs/NotificationContext";
import { Toaster } from "@/components/control/ui/sonner"
import Navbar from "./components/UI/NavBar";
import HomePage from "./components/pages/home-main/HomePage";
import BestJobBoard from "./components/pages/job/BestJobBoard";
import FindJobBoard from "./components/pages/job/FindJobBoard";
import JobRecommendation from "./components/pages/job/JobRecommendation";
import JobDetail from "./components/pages/job/JobDetail";
import Footer from "./components/UI/Footer";
import TopCompany from "./components/pages/company/TopCompany";
import CompanyDetail from "./components/pages/company/CompanyDetail";
import SignIn from "./components/pages/authentication/SignIn";
import SignUp from "./components/pages/authentication/SignUp";
import Jobs from "./components/pages/job/SearchJob"
import BlogHome from "./components/pages/blog/BlogHome";
import RecruiterDashboard from "./components/pages/recruiter/RecruiterDashboard";
import ApplicantDashboard from "./components/pages/applicant/ApplicantDashboard";
import AdminDashboard from "./components/pages/admin/AdminDashboard";
import JobSaved from "./components/pages/job/JobSaved";
import RecruiterSignIn from "./components/pages/authentication/RecruiterSignIn";
import RecruiterSignUp from "./components/pages/authentication/RecruiterSignUp";
import RecruiterHomePage from "./components/pages/recruiter/RecruiterHomePage";
import ApplicantProfile from "./components/pages/recruiter/ApplicantProfile";
import Applicant from "./components/pages/admin/Applicant";
import ScrollToTop from "./hooks/ScrollToTop";
import TestEdit from "./components/pages/recruiter/TestEdit";
import Profile from "./components/pages/recruiter/Profile";
import Home from "./components/CVAI/Home";
import CVDashboard from "./components/CVAI/dashboard/CVDashboard";
import EditResume from "./components/CVAI/dashboard/resume/[resumeId]/edit/EditResume";
import MyResumeView from "./components/CVAI/my-resume/[resumeId]/view/MyResumeView";
import ResumeAnalyzer from "./components/analyzer/ResumeAnalyzer";
import HomeJS from "./components/pages/applicant/HomeJS";
import ReviewComponent from "./components/pages/applicant/ReviewComponent";
import PackageDetail from "./components/pages/recruiter/PackageDetail";
import TestPage from "./components/pages/applicant/TestPage";
import Header from "./components/UI/Header";

function Layout() {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === "/applicants/apply-job/doing-test" || location.pathname === "/home" || location.pathname === "/sign-in" || location.pathname === "/sign-up" || location.pathname === "/recruiter-sign-in" || location.pathname === "/recruiter-homepage" || location.pathname === "/recruiter-sign-in" || location.pathname === "/recruiter-sign-up" || location.pathname === "/create-cv-with-ai" || location.pathname === "/create-cv-with-ai/dashboard" || location.pathname === "/create-cv-with-ai/my-resume/analyzer" || matchPath("/create-cv-with-ai/resume/:resumeId/edit", location.pathname) || matchPath("/create-cv-with-ai/my-resume/:resumeId/view", location.pathname) || matchPath("/applicants/applicant-profile/:applicantId", location.pathname) || matchPath("/applicants/applicant-profile/viewed/:applicantId", location.pathname);

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="/applicant-page" element={<HomePage />} />
        <Route exact path="/jobs/bestjobs" element={<BestJobBoard />} />
        <Route exact path="/jobs/findjobs" element={<FindJobBoard />} />
        <Route exact path="/jobs/job-recommendation" element={<JobRecommendation />} />
        <Route exact path="/jobs/job-saved" element={<JobSaved />} />
        <Route exact path="/jobs/jobdetail/:id" element={<JobDetail />} key={location.pathname} />
        <Route exact path="/companies" element={<TopCompany />} />
        <Route exact path="/companies/companydetail/:companyId" element={<CompanyDetail />} />
        <Route exact path="/sign-in" element={<SignIn />} />
        <Route exact path="/sign-up" element={<SignUp />} />
        <Route exact path="/search-job" element={<Jobs />} />
        <Route exact path="/blog-home" element={<BlogHome />} />
        <Route exact path="/admin-page" element={<AdminDashboard />} />
        <Route exact path="/recruiter-page" element={<RecruiterDashboard />} />
        <Route exact path="/applicant-dashboard" element={<ApplicantDashboard />} />
        <Route exact path="/recruiter-sign-in" element={<RecruiterSignIn />} />
        <Route exact path="/recruiter-sign-up" element={<RecruiterSignUp />} />
        <Route exact path="/recruiter-homepage" element={<RecruiterHomePage />} />
        <Route exact path="/applicants/applicant-profile/:applicantId" element={<ApplicantProfile />} />
        <Route exact path="/applicants/applicant-profile/viewed/:applicantId" element={<Profile />} />
        <Route exact path="/admin/applicant-profile/:userId" element={<Applicant />} />
        <Route exact path="/tests/edit/:id" element={<TestEdit />} />
        <Route exact path="/write-review" element={<ReviewComponent />} />
        <Route exact path="/create-cv-with-ai" element={<Home />} />
        <Route exact path="/create-cv-with-ai/dashboard" element={<CVDashboard />} />
        <Route exact path="/create-cv-with-ai/resume/:resumeId/edit" element={<EditResume />} />
        <Route exact path="/create-cv-with-ai/my-resume/:resumeId/view" element={<MyResumeView />} />
        <Route exact path="/create-cv-with-ai/my-resume/analyzer" element={<ResumeAnalyzer />} />
        <Route exact path="/home" element={<HomeJS />} />
        <Route exact path="/write-review" element={<ReviewComponent />} />
        <Route exact path="/package/:id" element={<PackageDetail />} />
        <Route exact path="/applicants/apply-job/doing-test" element={<TestPage />} />
      </Routes>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop /> {/* Thêm vào Router để theo dõi thay đổi đường dẫn */}
      <NotificationProvider>
        <Toaster />
        <Layout />
      </NotificationProvider>
    </Router>
  );
}

export default App;
