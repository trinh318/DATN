import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import FormSection from '../../components/FormSection';
import ResumePreview from '../../components/ResumePreview';
import { ResumeInfoContext } from '@/components/CVAI/context/ResumeInfoContext';
import axios from 'axios'

function EditResume() {
  const { resumeId } = useParams();
  const [resumeInfo, setResumeInfo] = useState();

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

  return (
    <ResumeInfoContext.Provider value={{ resumeInfo, setResumeInfo }}>
      <div className='grid grid-cols-1 md:grid-cols-2 p-10 gap-10'>
        {/* Form Section  */}
        <FormSection />
        {/* Preview Section  */}
        <ResumePreview className='h-[88vh] overflow-y-auto'/>
      </div>
    </ResumeInfoContext.Provider>
  )
}

export default EditResume