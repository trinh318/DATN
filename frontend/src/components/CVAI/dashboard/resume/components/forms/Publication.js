import React, { useContext, useEffect, useState } from 'react';
import { Input } from '@/components/control/ui/input';
import { Textarea } from '@/components/control/ui/textarea';
import { Button } from '@/components/control/ui/button';
import { LoaderCircle } from 'lucide-react';
import { ResumeInfoContext } from '@/components/CVAI/context/ResumeInfoContext';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

function Publication({ enabledNext }) {
    const { resumeId } = useParams();
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
    const [loading, setLoading] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    const [deletedPublicationIds, setDeletedPublicationIds] = useState([]);
    const [publicationList, setPublicationList] = useState([{
        name: '',
        publisher: '',
        date: '',
        additionalInfo: ''
    }]);

    useEffect(() => {
        if (!hasInitialized && resumeInfo && Array.isArray(resumeInfo.publication)) {
            setPublicationList(resumeInfo.publication);
            setHasInitialized(true);
        }
    }, [resumeInfo, hasInitialized]);

    const handleChange = (event, index) => {
        enabledNext(false);
        const { name, value } = event.target;
        const newList = [...publicationList];
        newList[index][name] = value;
        setPublicationList(newList);
    };

    const AddPublication = () => {
        setPublicationList([...publicationList, {
            name: '',
            publisher: '',
            date: '',
            additionalInfo: ''
        }]);
    };

    const RemovePublication = (index) => {
        const removedItem = publicationList[index];
        if (removedItem._id) {
            setDeletedPublicationIds(prev => [...prev, removedItem._id]);
        }

        const updatedList = publicationList.filter((_, i) => i !== index);
        setPublicationList(updatedList);
    }

    const onSave = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            if (deletedPublicationIds) {
                await Promise.all(
                    deletedPublicationIds.map(id => {
                        return axios.delete(`http://localhost:5000/api/aicv/resume/publication/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                            params: { cvId: resumeId }
                        });
                    })
                );
            }

            await Promise.all(publicationList.map(pub => {
                if (pub._id) {
                    return axios.put(
                        `http://localhost:5000/api/aicv/resume/publication/${pub._id}`,
                        { ...pub, cvId: resumeId },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                } else {
                    return axios.post(
                        `http://localhost:5000/api/aicv/resume/publication`,
                        { ...pub, cvId: resumeId },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                }
            }));
            toast('Publications saved successfully!');
            setDeletedPublicationIds([]);
            enabledNext(true);
        } catch (err) {
            console.error(err);
            toast('Failed to save publications!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setResumeInfo({
            ...resumeInfo,
            publication: publicationList
        });
    }, [publicationList]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    };

    return (
        <div className="h-[81vh] shadow-lg rounded-lg border-t-primary border-t-4 mt-2">
            <div className='p-5 pb-2 shadow-md w-full'>
                <h2 className='font-bold text-lg'>Publications</h2>
                <p>Add your publications</p>
            </div>

            <div className='h-[59vh] overflow-y-auto p-5 pt-0'>
                {publicationList.map((item, index) => (
                    <div key={index} className='grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg'>
                        <div className='col-span-2'>
                            <label>Publication Name</label>
                            <Input className="border-gray-300" name='name' value={item.name} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div>
                            <label>Publisher</label>
                            <Input className="border-gray-300" name='publisher' value={item.publisher} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div>
                            <label>Date</label>
                            <Input className="border-gray-300" type='date' name='date' value={formatDate(item.date)} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div className='col-span-2'>
                            <label>Additional Info</label>
                            <Textarea className="border-gray-300" name='additionalInfo' value={item.additionalInfo} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div className='flex justify-end ml-1 col-span-2 text-right'>
                            <Button variant="outline" onClick={() => RemovePublication(index)} className="text-primary">- Remove</Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className='p-4 pr-5 pt-2 rounded-b-lg shadow-md border-t-primary border-t-2 flex justify-between'>
                <div className='flex gap-2'>
                    <Button variant='outline' onClick={AddPublication} className='text-primary'>
                        + Add More Publication
                    </Button>
                </div>

                <Button disabled={loading} onClick={onSave}>
                    {loading ? <LoaderCircle className='animate-spin' /> : 'Save'}
                </Button>
            </div>
        </div>
    );
}

export default Publication;
