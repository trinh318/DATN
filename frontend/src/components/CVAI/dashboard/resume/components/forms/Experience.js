import { Button } from '@/components/control/ui/button'
import { Input } from '@/components/control/ui/input'
import React, { useContext, useEffect, useState } from 'react'
import RichTextEditor from '../RichTextEditor'
import { ResumeInfoContext } from '@/components/CVAI/context/ResumeInfoContext'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { LoaderCircle } from 'lucide-react'
import axios from 'axios'

function Experience({ enabledNext }) {
    const { resumeId } = useParams()
    const [loading, setLoading] = useState(false)
    const [hasInitialized, setHasInitialized] = useState(false);
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
    const [deletedExperienceIds, setDeletedExperienceIds] = useState([]);
    const [experienceList, setExperienceList] = useState([
        {
            companyName: '',
            position: '',
            location: '',
            startDate: '',
            endDate: '',
            description: '',
            isCurrent: false
        }
    ])

    useEffect(() => {
        if (!hasInitialized && resumeInfo && Array.isArray(resumeInfo.workExperience)) {
            setExperienceList(resumeInfo.workExperience);
            setHasInitialized(true);
        }
    }, [resumeInfo, hasInitialized]);

    const handleChange = (index, e) => {
        enabledNext(false)
        const newList = [...experienceList]
        newList[index][e.target.name] = e.target.value
        setExperienceList(newList)
    }

    const handleRichTextEditor = (e, index) => {
        const newList = [...experienceList]
        newList[index].description = e.target.value
        setExperienceList(newList)
    }

    const AddNewExperience = () => {
        setExperienceList([...experienceList,
        {
            companyName: '',
            position: '',
            location: '',
            startDate: '',
            endDate: '',
            description: '',
            isCurrent: false
        }])
    }

    const RemoveExperience = (index) => {
        const removedItem = experienceList[index];
        if (removedItem._id) {
            setDeletedExperienceIds(prev => [...prev, removedItem._id]);
        }

        const updatedList = experienceList.filter((_, i) => i !== index);
        setExperienceList(updatedList);
    }

    const onSave = async (e) => {
        e?.preventDefault?.()
        setLoading(true)
        const token = localStorage.getItem('token')

        try {
            if (deletedExperienceIds) {
                await Promise.all(
                    deletedExperienceIds.map(id => {
                        return axios.delete(`http://localhost:5000/api/aicv/resume/work-experience/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                            params: { cvId: resumeId }
                        });
                    })
                );
            }

            await Promise.all(
                experienceList.map((exp) => {

                    if (exp._id) {
                        return axios.put(`http://localhost:5000/api/aicv/resume/work-experience/${exp._id}`,
                            { ...exp, cvId: resumeId },
                            {
                                headers: { Authorization: `Bearer ${token}` }
                            }
                        )
                    } else {
                        return axios.post(`http://localhost:5000/api/aicv/resume/work-experience`,
                            { ...exp, cvId: resumeId },
                            {
                                headers: { Authorization: `Bearer ${token}` }
                            }
                        )
                    }
                })
            );
            enabledNext(true)
            setDeletedExperienceIds([]);
            toast('Experience saved successfully!')
        } catch (err) {
            console.error(err)
            toast('Failed to save experience!')
        } finally {
            setLoading(false)
        }
    }

    const toggleIsCurrent = (index) => {
        const newList = [...experienceList]
        newList[index].isCurrent = !newList[index].isCurrent
        if (newList[index].isCurrent) {
            newList[index].endDate = ''
        }
        setExperienceList(newList)
    }

    useEffect(() => {
        setResumeInfo({
            ...resumeInfo,
            workExperience: experienceList
        })
    }, [experienceList])

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    };

    return (
        <div className="h-[81vh] shadow-lg rounded-lg border-t-primary border-t-4 mt-2">
            <div className='p-5 pb-2 shadow-md w-full'>
                <h2 className='font-bold text-lg'>Work Experience</h2>
                <p>Add your previous job experience</p>
            </div>

            <div className='h-[59vh] overflow-y-auto p-5 pt-0'>
                {experienceList.map((item, index) => (
                    <div key={item._id || index} className='grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg'>
                        <div className='col-span-2'>
                            <label className='text-xs'>Company Name</label>
                            <Input className="border-gray-300" name="companyName" value={item.companyName || ''} onChange={(e) => handleChange(index, e)} />
                        </div>
                        <div>
                            <label className='text-xs'>Location</label>
                            <Input className="border-gray-300" name="location" value={item.location || ''} onChange={(e) => handleChange(index, e)} />
                        </div>
                        <div>
                            <label className='text-xs'>Position Title</label>
                            <Input className="border-gray-300" name="position" value={item.position || ''} onChange={(e) => handleChange(index, e)} />
                        </div>
                        <div>
                            <label className='text-xs'>Start Date</label>
                            <Input className="border-gray-300" type="date" name="startDate" value={formatDate(item.startDate)?.slice(0, 10) || ''} onChange={(e) => handleChange(index, e)} />
                        </div>
                        <div>
                            <label className={`text-xs ${item.isCurrent ? 'text-gray-400' : 'text-black'}`}>End Date</label>
                            <Input className="border-gray-300" type="date" name="endDate" value={formatDate(item.endDate)?.slice(0, 10) || ''} onChange={(e) => handleChange(index, e)} disabled={item.isCurrent} />
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={item.isCurrent}
                                onChange={() => toggleIsCurrent(index)}
                                className="w-4 h-4"
                            />
                            <label className='text-xs'>I am currently in this position</label>
                        </div>
                        <div className='col-span-2'>
                            <RichTextEditor
                                index={index}
                                defaultValue={item.description || ''}
                                onRichTextEditorChange={(e) => handleRichTextEditor(e, index)}
                            />
                        </div>
                        <div className='flex justify-end ml-1 col-span-2 text-right'>
                            <Button variant="outline" onClick={() => RemoveExperience(index)} className="text-primary">- Remove</Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className='p-4 pr-5 pt-2 rounded-b-lg shadow-md border-t-primary border-t-2 flex justify-between'>
                <div className='flex justify-between'>
                    <div className='flex gap-2'>
                        <Button variant="outline" onClick={AddNewExperience} className="text-primary">+ Add More Experience</Button>
                    </div>
                </div>

                <Button disabled={loading} onClick={onSave}>
                    {loading ? <LoaderCircle className='animate-spin' /> : 'Save'}
                </Button>
            </div>
        </div>
    )
}

export default Experience
