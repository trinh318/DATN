import { Button } from '@/components/control/ui/button'
import { Input } from '@/components/control/ui/input'
import { LoaderCircle } from 'lucide-react'
import { ResumeInfoContext } from '@/components/CVAI/context/ResumeInfoContext'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'

function Certification({ enabledNext }) {
    const { resumeId } = useParams()
    const [loading, setLoading] = useState(false)
    const [hasInitialized, setHasInitialized] = useState(false);
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
    const [deletedCertificationIds, setDeletedCertificationIds] = useState([]);
    const [certificationList, setCertificationList] = useState([
        {
            name: '',
            score: '',
            startDate: '',
            endDate: ''
        }
    ])

    useEffect(() => {
        if (!hasInitialized && resumeInfo && Array.isArray(resumeInfo.certification)) {
            setCertificationList(resumeInfo.certification);
            setHasInitialized(true);
        }
    }, [resumeInfo, hasInitialized]);

    const handleChange = (event, index) => {
        enabledNext(false)
        const newEntries = [...certificationList]
        const { name, value } = event.target
        newEntries[index][name] = value
        setCertificationList(newEntries)
    }

    const AddNewCertification = () => {
        setCertificationList([...certificationList,
        {
            name: '',
            score: '',
            startDate: '',
            endDate: ''
        }])
    }

    const RemoveCertification = (index) => {
        const removedItem = certificationList[index];
        if (removedItem._id) {
            setDeletedCertificationIds(prev => [...prev, removedItem._id]);
        }

        const updatedList = certificationList.filter((_, i) => i !== index);
        setCertificationList(updatedList);
    }

    const onSave = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            if (deletedCertificationIds) {
                await Promise.all(
                    deletedCertificationIds.map(id => {
                        return axios.delete(`http://localhost:5000/api/aicv/resume/certification/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                            params: { cvId: resumeId }
                        });
                    })
                );
            }

            await Promise.all(
                certificationList.map((certification) => {
                    if (certification._id) {
                        return axios.put(
                            `http://localhost:5000/api/aicv/resume/certification/${certification._id}`,
                            { ...certification, cvId: resumeId },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                    } else {
                        return axios.post(
                            `http://localhost:5000/api/aicv/resume/certification`,
                            { ...certification, cvId: resumeId },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                    }
                })
            );
            enabledNext(true)
            setDeletedCertificationIds([]);
            toast('Certification saved successfully!');
        } catch (err) {
            console.error(err);
            toast('Failed to save certification!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setResumeInfo({
            ...resumeInfo,
            certification: certificationList
        })
    }, [certificationList])

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    };

    return (
        <div className="h-[81vh] shadow-lg rounded-lg border-t-primary border-t-4 mt-2">
            <div className='p-5 pb-2 shadow-md w-full'>
                <h2 className='font-bold text-lg'>Certification</h2>
                <p>Add Your certification details</p>
            </div>

            <div className='h-[59vh] overflow-y-auto p-5 pt-0'>
                {certificationList.map((item, index) => (
                    <div key={index} className='grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg'>
                        <div className='col-span-2'>
                            <label>Certification</label>
                            <Input className="border-gray-300" name='name' value={item.name} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div className='col-span-2'>
                            <label>Score or Level</label>
                            <Input className="border-gray-300" name='score' value={item.score} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div>
                            <label>Start Date</label>
                            <Input className="border-gray-300" type='date' name='startDate' value={formatDate(item.startDate)} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div>
                            <label>End Date</label>
                            <Input className="border-gray-300" type='date' name='endDate' value={formatDate(item.endDate)} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div className='flex justify-end ml-1 col-span-2 text-right'>
                            <Button variant="outline" onClick={() => RemoveCertification(index)} className="text-primary">- Remove</Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className='p-4 pr-5 pt-2 rounded-b-lg shadow-md border-t-primary border-t-2 flex justify-between'>
                <div className='flex justify-between'>
                    <div className='flex gap-2'>
                        <Button variant='outline' onClick={AddNewCertification} className='text-primary'>
                            + Add More Certification
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

export default Certification;
