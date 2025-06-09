import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddResume from './components/AddResume'
import { useUser } from '@clerk/clerk-react';
import ResumeCardItem from './components/ResumeCardItem';
import "../../../index.css";

function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resumeList, setResumeList] = useState([]);

    const user = useUser();

    // Hàm để lấy danh sách Resume
    const GetResumesList = async () => {
        try {
            const token = localStorage.getItem('token'); // Lấy token từ localStorage

            // Kiểm tra nếu không có token
            if (!token) {
                setError('Token is missing, please login again.');
                setLoading(false);
                return;
            }

            // Gửi yêu cầu GET để lấy danh sách Resume
            const response = await axios.get('http://localhost:5000/api/aicv/resume', {
                headers: {
                    Authorization: `Bearer ${token}`, // Gửi token trong header
                },
            });

            // Cập nhật dữ liệu Resume
            setResumeList(response.data);
            console.log(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching resume list:', err);
            setError('Failed to fetch resume list.');
            setLoading(false);
        }
    };

    // Khi component được mount hoặc user thay đổi, gọi GetResumesList
    useEffect(() => {
        if (user) {
            GetResumesList();
        }
    }, [user]);

    return (
        <div className='p-10 md:px-20 lg:px-32'>
            <h2 className='font-bold text-3xl'>My Resume</h2>
            <p>Start Creating AI resume to your next Job role</p>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-10'>
                <AddResume />
                {resumeList.length > 0 ? resumeList.map((resume, index) => (
                    <ResumeCardItem
                        resume={resume}
                        key={index}
                        refreshData={GetResumesList}  // Truyền refreshData là GetResumesList
                    />
                )) :
                    [1, 2, 3, 4].map((item, index) => (
                        <div className='h-[280px] rounded-lg bg-slate-200 animate-pulse' key={index}>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export default Dashboard;
