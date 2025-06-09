import Header from '@/components/CVAI/custom/Header'
import { Button } from '@/components/control/ui/button'
import { ResumeInfoContext } from '@/components/CVAI/context/ResumeInfoContext'
import ResumePreview from '@/components/CVAI/dashboard/resume/components/ResumePreview'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { RWebShare } from 'react-web-share'
import axios from 'axios'

function ViewResume() {
    const [resumeInfo, setResumeInfo] = useState();
    const { resumeId } = useParams();

    useEffect(() => {
        GetResumeInfo();
    }, [])

    const GetResumeInfo = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                console.error('Token is missing, please login again.');
                return;
            }

            const response = await axios.get(`http://localhost:5000/api/aicv/resume/${resumeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log("response.data", response.data);
            setResumeInfo(response.data);
        } catch (error) {
            console.error('Error fetching resume info:', error);
        }
    };

    const HandleDownload = () => {
        window.print();
    }

    return (
        <ResumeInfoContext.Provider value={{ resumeInfo, setResumeInfo }} >
            <div id="no-print">
                <Header />
                <div className='my-10 mx-10 md:mx-20 lg:mx-36'>
                    <h2 className='text-center text-2xl font-medium'>Congrats! Your Ultimate AI generates Resume is ready!</h2>
                    <p className='text-center text-gray-400'>Now you are ready to download your resume and you can share unique resume url with your friends and family</p>
                    <div className='flex justify-between px-44 my-10'>
                        <Button onClick={HandleDownload}>Download</Button>
                        <RWebShare data={{
                            text: "Hello Everyone, This is my resume please open url to see it",
                            url: process.env.REACT_APP_API_BASE_URL + "/create-cv-with-ai/my-resume/" + resumeId + "/view",
                            title: resumeInfo?.firstName + " " + resumeInfo?.lastName + " resume",
                        }} onClick={() => console.log("shared successfully!")}>
                            <Button>Share</Button>
                        </RWebShare>
                    </div>
                </div>
            </div>
            <div className='my-10 mx-10 md:mx-20 lg:mx-36'>
                <div id="print-area" >
                    <ResumePreview className="h-full overflow-hidden"/>
                </div>
            </div>
        </ResumeInfoContext.Provider>
    )
}

export default ViewResume