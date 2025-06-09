import { Button } from '@/components/control/ui/button'
import { Input } from '@/components/control/ui/input'
import { Textarea } from '@/components/control/ui/textarea'
import { LoaderCircle, Trash2 } from 'lucide-react'
import { ResumeInfoContext } from '@/components/CVAI/context/ResumeInfoContext'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'

function Education({ enabledNext }) {
  const { resumeId } = useParams()
  const [loading, setLoading] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false);
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
  const [deletedEducationIds, setDeletedEducationIds] = useState([]);
  const [educationalList, setEducationalList] = useState([
    {
      university: '',
      city: '',
      gpa: '',
      degree: '',
      major: '',
      startDate: '',
      endDate: '',
      additionalInfo: ''
    }
  ])

  useEffect(() => {
    if (!hasInitialized && resumeInfo && Array.isArray(resumeInfo.education)) {
      setEducationalList(resumeInfo.education);
      setHasInitialized(true);
    }
  }, [resumeInfo, hasInitialized]);

  const handleChange = (event, index) => {
    enabledNext(false)
    const newEntries = [...educationalList]
    const { name, value } = event.target
    newEntries[index][name] = value
    setEducationalList(newEntries)
  }

  const AddNewEducation = () => {
    setEducationalList([...educationalList,
    {
      university: '',
      city: '',
      gpa: '',
      degree: '',
      major: '',
      startDate: '',
      endDate: '',
      additionalInfo: ''
    }])
  }

  const RemoveEducation = (index) => {
    const removedItem = educationalList[index];
    if (removedItem._id) {
      setDeletedEducationIds(prev => [...prev, removedItem._id]);
    }

    const updatedList = educationalList.filter((_, i) => i !== index);
    setEducationalList(updatedList);
  };

  const onSave = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');


    try {
      if (deletedEducationIds) {
        await Promise.all(
          deletedEducationIds.map(id => {
            return axios.delete(`http://localhost:5000/api/aicv/resume/education/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { cvId: resumeId }
            });
          })
        );
      }

      await Promise.all(
        educationalList.map((edu) => {
          if (edu._id) {
            // Update existing education
            return axios.put(
              `http://localhost:5000/api/aicv/resume/education/${edu._id}`,
              { ...edu, cvId: resumeId },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } else {
            // Create new education
            return axios.post(
              `http://localhost:5000/api/aicv/resume/education`,
              { ...edu, cvId: resumeId },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        })
      );
      enabledNext(true)
      setDeletedEducationIds([]);
      toast('Education saved successfully!');
    } catch (err) {
      console.error(err);
      toast('Failed to save education!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setResumeInfo({
      ...resumeInfo,
      education: educationalList
    })
  }, [educationalList])

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="h-[81vh] shadow-lg rounded-lg border-t-primary border-t-4 mt-2">
      <div className='p-5 pb-2 shadow-md w-full'>
        <h2 className='font-bold text-lg'>Education</h2>
        <p>Add Your educational details</p>
      </div>

      <div className='h-[59vh] overflow-y-auto p-5 pt-0'>
        {educationalList.map((item, index) => (
          <div key={index} className='grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg'>
            <div className='col-span-2'>
              <label>University</label>
              <Input className="border-gray-300" name='university' value={item.university} onChange={(e) => handleChange(e, index)} />
            </div>
            <div>
              <label>City</label>
              <Input className="border-gray-300" name='city' value={item.city} onChange={(e) => handleChange(e, index)} />
            </div>
            <div>
              <label>GPA</label>
              <Input className="border-gray-300" name='gpa' value={item.gpa} onChange={(e) => handleChange(e, index)} />
            </div>
            <div>
              <label>Degree</label>
              <Input className="border-gray-300" name='degree' value={item.degree} onChange={(e) => handleChange(e, index)} />
            </div>
            <div>
              <label>Major</label>
              <Input className="border-gray-300" name='major' value={item.major} onChange={(e) => handleChange(e, index)} />
            </div>
            <div>
              <label>Start Date</label>
              <Input className="border-gray-300" type='date' name='startDate' value={formatDate(item.startDate)} onChange={(e) => handleChange(e, index)} />
            </div>
            <div>
              <label>End Date</label>
              <Input className="border-gray-300" type='date' name='endDate' value={formatDate(item.endDate)} onChange={(e) => handleChange(e, index)} />
            </div>
            <div className='col-span-2'>
              <label>Additional Info</label>
              <Textarea className="border-gray-300" name='additionalInfo' value={item.additionalInfo} onChange={(e) => handleChange(e, index)} />
            </div>
            <div className='flex justify-end ml-1 col-span-2 text-right'>
              <Button variant="outline" onClick={() => RemoveEducation(index)} className="text-primary">- Remove</Button>
            </div>
          </div>
        ))}
      </div>

      <div className='p-4 pr-5 pt-2 rounded-b-lg shadow-md border-t-primary border-t-2 flex justify-between'>
        <div className='flex justify-between'>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={AddNewEducation} className='text-primary'>
              + Add More Education
            </Button>
          </div>
        </div>

        <Button disabled={loading} onClick={onSave}>
          {loading ? <LoaderCircle className='animate-spin' /> : 'Save'}
        </Button>
      </div>
    </div>
  );
}

export default Education;
