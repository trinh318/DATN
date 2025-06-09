import React, { useEffect, useState } from 'react';
import { FaBuilding, FaClock, FaDollarSign, FaMapMarkerAlt } from "react-icons/fa";
import "../../../styles/applicantprofile.css";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { useParams } from "react-router-dom";  // Import useParams
import axios from 'axios';

pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs';

const Applicant = () => {
    const fileUrl = '';////////////link pdf 
    const { userId } = useParams();
    const [profile, setProfile] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/profiles/admin/applicant-profile/${userId}`);
                setProfile(response.data);
                setLoading(false);
            } catch (error) {
                setError('Error fetching company data');
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    const [numPages, setNumPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Called when the document is loaded successfully
    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setCurrentPage(1); // Reset to the first page
    };

    // Handle navigation to the previous page
    const goToPrevPage = () =>
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));

    // Handle navigation to the next page
    const goToNextPage = () =>
        setCurrentPage((prevPage) => Math.min(prevPage + 1, numPages));

    const click = () => {
        console.log(userId);
        console.log(profile);

    }

    return (
        <div className='applicant-detail-info-wrapper'>
            <div className="applicants-profile-card">
                <div className="applicants-profile-header">
                    <div className="applicants-profile-info">
                        <img
                            src={"https://via.placeholder.com/50"}
                            alt="Profile Avatar"
                            className="applicants-profile-avatar"
                        />
                        <div>
                            <h3 className="applicants-profile-name">{profile?.first_name} {profile?.last_name}</h3>
                            <p className="applicants-profile-title">{profile?.current_industry}</p>
                        </div>
                    </div>
                </div>
                <div className="applicants-profile-details">
                    <p>
                        <FaClock /> {profile?.years_of_experience} năm
                    </p>
                    <p>
                        <FaDollarSign /> {profile?.current_salary}
                    </p>
                    <p>
                        <FaMapMarkerAlt /> {profile?.location}
                    </p>
                </div>
                <div className="applicants-profile-footer">
                    <button className="applicants-profile-view-btn" onClick={click}>
                        Xem thông tin liên hệ
                    </button>
                    <button className="applicants-profile-invite-btn">
                        Gửi lời mời ứng tuyển
                    </button>
                    <div className="applicants-profile-actions">
                        <button className="action-btn share-btn">⟲</button>
                        <button className="action-btn save-btn">★</button>
                    </div>
                </div>
                <div className="profile-details-container">
                    <h2>Thông tin chung</h2>
                    <div className="profile-details-table">
                        <div className="profile-detail">
                            <span className="label">Vị trí hiện tại:</span>
                            <span className="value">{profile?.job_title}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Cấp bậc hiện tại:</span>
                            <span className="value">{profile?.job_level}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Ngành nghề:</span>
                            <span className="value">{profile?.current_industry}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Lĩnh Vực:</span>
                            <span className="value">{profile?.current_field}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Cấp bậc mong muốn:</span>
                            <span className="value">{profile?.job_level}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Mức lương mong muốn:</span>
                            <span className="value">{profile?.desired_salary} USD</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Ngày sinh:</span>
                            <span className="value">{new Date(profile?.date_of_birth).toLocaleDateString()}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Giới tính:</span>
                            <span className="value">{profile?.gender}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Địa chỉ:</span>
                            <span className="value">{profile?.specific_address}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Nơi làm việc mong muốn:</span>
                            <span className="value">{profile?.desired_work_location}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Bằng cấp:</span>
                            <span className="value">{profile?.education}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Kĩ năng</span>
                            <span className="value">{profile?.skills
                                ? (Array.isArray(profile.skills)
                                    ? profile.skills.join(' | ')
                                    : String(profile.skills).split(',').join(' | '))
                                : 'Không có kỹ năng'}</span>
                        </div>
                    </div>
                </div>
                <div className="pdf-viewer-container">
                    <div className="pdf-controls">
                        <button onClick={goToPrevPage} disabled={currentPage === 1}>
                            Previous
                        </button>
                        <span>
                            Page {currentPage} of {numPages}
                        </span>
                        <button onClick={goToNextPage} disabled={currentPage === numPages}>
                            Next
                        </button>
                    </div>
                    <div className="pdf-document">
                        <Document
                            file={fileUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="pdf-document-container"
                        >
                            <Page pageNumber={currentPage} />
                        </Document>
                    </div>
                </div>
            </div>
            <div className="applicants-profile-card-right"></div>
        </div>
    );
};

export default Applicant;