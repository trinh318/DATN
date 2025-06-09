import { Button } from '@/components/control/ui/button'
import { Input } from '@/components/control/ui/input'
import { LoaderCircle } from 'lucide-react'
import { ResumeInfoContext } from '@/components/CVAI/context/ResumeInfoContext'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'

function Award({ enabledNext }) {
    const { resumeId } = useParams()
    const [loading, setLoading] = useState(false)
    const [hasInitialized, setHasInitialized] = useState(false);
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
    const [deletedAwardIds, setDeletedAwardIds] = useState([]);
    const [awardList, setAwardList] = useState([
        {
            name: '',
            organization: '',
            dateEarned: ''
        }
    ])

    useEffect(() => {
        if (!hasInitialized && resumeInfo && Array.isArray(resumeInfo.award)) {
            setAwardList(resumeInfo.award);
            setHasInitialized(true);
        }
    }, [resumeInfo, hasInitialized]);

    const handleChange = (event, index) => {
        enabledNext(false)
        const newEntries = [...awardList]
        const { name, value } = event.target
        newEntries[index][name] = value
        setAwardList(newEntries)
    }

    const AddNewAward = () => {
        setAwardList([...awardList,
        {
            name: '',
            organization: '',
            dateEarned: ''
        }])
    }

    const RemoveAward = (index) => {
        const removedItem = awardList[index];
        if (removedItem._id) {
            setDeletedAwardIds(prev => [...prev, removedItem._id]);
        }

        const updatedList = awardList.filter((_, i) => i !== index);
        setAwardList(updatedList);
    }

    const onSave = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            if (deletedAwardIds) {
                await Promise.all(
                    deletedAwardIds.map(id => {
                        return axios.delete(`http://localhost:5000/api/aicv/resume/award/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                            params: { cvId: resumeId }
                        });
                    })
                );
            }

            await Promise.all(
                awardList.map((award) => {
                    if (award._id) {
                        return axios.put(
                            `http://localhost:5000/api/aicv/resume/award/${award._id}`,
                            { ...award, cvId: resumeId },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                    } else {
                        return axios.post(
                            `http://localhost:5000/api/aicv/resume/award`,
                            { ...award, cvId: resumeId },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                    }
                })
            );
            enabledNext(true)
            setDeletedAwardIds([]);
            toast('Award or Scholarship saved successfully!');
        } catch (err) {
            console.error(err);
            toast('Failed to save Award or Scholarship!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setResumeInfo({
            ...resumeInfo,
            award: awardList
        })
    }, [awardList])

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    };

    return (
        <div className="h-[81vh] shadow-lg rounded-lg border-t-primary border-t-4 mt-2">
            <div className='p-5 pb-2 shadow-md w-full'>
                <h2 className='font-bold text-lg'>Award or Scholarship</h2>
                <p>Add Your Award or Scholarship details</p>
            </div>

            <div className='h-[59vh] overflow-y-auto p-5 pt-0'>
                {awardList.map((item, index) => (
                    <div key={index} className='grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg'>
                        <div className='col-span-2'>
                            <label>Award or Scholarship</label>
                            <Input className="border-gray-300" name='name' value={item.name} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div>
                            <label>Organization</label>
                            <Input className="border-gray-300" name='organization' value={item.organization} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div>
                            <label>Date Earned</label>
                            <Input className="border-gray-300" type='date' name='dateEarned' value={formatDate(item.startDate)} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div className='flex justify-end ml-1 col-span-2 text-right'>
                            <Button variant="outline" onClick={() => RemoveAward(index)} className="text-primary">- Remove</Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className='p-4 pr-5 pt-2 rounded-b-lg shadow-md border-t-primary border-t-2 flex justify-between'>
                <div className='flex justify-between'>
                    <div className='flex gap-2'>
                        <Button variant='outline' onClick={AddNewAward} className='text-primary'>
                            + Add More Award or Scholarship
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

export default Award;
