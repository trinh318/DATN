import { Button } from '@/components/control/ui/button';
import { Input } from '@/components/control/ui/input';
import { Textarea } from '@/components/control/ui/textarea';
import { LoaderCircle } from 'lucide-react';
import { ResumeInfoContext } from '@/components/CVAI/context/ResumeInfoContext';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

function Volunteering({ enabledNext }) {
    const { resumeId } = useParams();
    const [loading, setLoading] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
    const [deletedVolunteeringIds, setDeletedVolunteeringIds] = useState([]);
    const [volunteeringList, setVolunteeringList] = useState([
        {
            organization: '',
            involvement: '',
            city: '',
            startDate: '',
            endDate: '',
            additionalInfo: ''
        }
    ]);

    useEffect(() => {
        if (!hasInitialized && resumeInfo && Array.isArray(resumeInfo.volunteering)) {
            setVolunteeringList(resumeInfo.volunteering);
            setHasInitialized(true);
        }
    }, [resumeInfo, hasInitialized]);

    const handleChange = (event, index) => {
        enabledNext(false);
        const newEntries = [...volunteeringList];
        const { name, value } = event.target;
        newEntries[index][name] = value;
        setVolunteeringList(newEntries);
    };

    const AddNewVolunteering = () => {
        setVolunteeringList([...volunteeringList, {
            organization: '',
            involvement: '',
            city: '',
            startDate: '',
            endDate: '',
            additionalInfo: ''
        }]);
    };

    const RemoveVolunteering = (index) => {
        const removedItem = volunteeringList[index];
        if (removedItem._id) {
            setDeletedVolunteeringIds(prev => [...prev, removedItem._id]);
        }

        const updatedList = volunteeringList.filter((_, i) => i !== index);
        setVolunteeringList(updatedList);
    }

    const onSave = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            if (deletedVolunteeringIds) {
                await Promise.all(
                    deletedVolunteeringIds.map(id => {
                        return axios.delete(`http://localhost:5000/api/aicv/resume/volunteering/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                            params: { cvId: resumeId }
                        });
                    })
                );
            }

            await Promise.all(
                volunteeringList.map((item) => {
                    if (item._id) {
                        return axios.put(
                            `http://localhost:5000/api/aicv/resume/volunteering/${item._id}`,
                            { ...item, cvId: resumeId },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                    } else {
                        return axios.post(
                            `http://localhost:5000/api/aicv/resume/volunteering`,
                            { ...item, cvId: resumeId },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                    }
                })
            );
            enabledNext(true);
            setDeletedVolunteeringIds([]);
            toast('Volunteering saved successfully!');
        } catch (err) {
            console.error(err);
            toast('Failed to save volunteering!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setResumeInfo({
            ...resumeInfo,
            volunteering: volunteeringList
        });
    }, [volunteeringList]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    };

    return (
        <div className="h-[81vh] shadow-lg rounded-lg border-t-primary border-t-4 mt-2">
            <div className='p-5 pb-2 shadow-md w-full'>
                <h2 className='font-bold text-lg'>Volunteering</h2>
                <p>Add your volunteering experiences</p>
            </div>

            <div className='h-[59vh] overflow-y-auto p-5 pt-0'>
                {volunteeringList.map((item, index) => (
                    <div key={index} className='grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg'>
                        <div className='col-span-2'>
                            <label>Organization</label>
                            <Input className="border-gray-300" name='organization' value={item.organization} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div className='col-span-2'>
                            <label>Involvement</label>
                            <Input className="border-gray-300" name='involvement' value={item.involvement} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div>
                            <label>City</label>
                            <Input className="border-gray-300" name='city' value={item.city} onChange={(e) => handleChange(e, index)} />
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
                            <Button variant="outline" onClick={() => RemoveVolunteering(index)} className="text-primary">- Remove</Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className='p-4 pr-5 pt-2 rounded-b-lg shadow-md border-t-primary border-t-2 flex justify-between'>
                <div className='flex gap-2'>
                    <Button variant='outline' onClick={AddNewVolunteering} className='text-primary'>
                        + Add More Volunteering
                    </Button>
                </div>

                <Button disabled={loading} onClick={onSave}>
                    {loading ? <LoaderCircle className='animate-spin' /> : 'Save'}
                </Button>
            </div>
        </div>
    );
}

export default Volunteering;
