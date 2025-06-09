import { Button } from '@/components/control/ui/button'
import { Input } from '@/components/control/ui/input'
import { Textarea } from '@/components/control/ui/textarea'
import { LoaderCircle, Trash2 } from 'lucide-react'
import { ResumeInfoContext } from '@/components/CVAI/context/ResumeInfoContext'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'
import { ScatterPlotRounded } from '@mui/icons-material'

function Project({ enabledNext }) {
    const { resumeId } = useParams()
    const [loading, setLoading] = useState(false)
    const [hasInitialized, setHasInitialized] = useState(false)
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext)
    const [deletedProjectIds, setDeletedProjectIds] = useState([]);
    const [projectList, setProjectList] = useState([
        {
            name: '',
            organization: '',
            description: '',
            technologies: '',
            startDate: '',
            endDate: '',
            additionalInfo: '',
            link: ''
        }
    ])

    useEffect(() => {
        if (!hasInitialized && resumeInfo && Array.isArray(resumeInfo.project)) {
            setProjectList(resumeInfo.project)
            setHasInitialized(true)
        }
    }, [resumeInfo, hasInitialized])

    const handleChange = (e, index) => {
        enabledNext(false)
        const { name, value } = e.target
        const updatedProjects = [...projectList]
        updatedProjects[index][name] = value
        setProjectList(updatedProjects)
    }

    const AddNewProject = () => {
        setProjectList([
            ...projectList,
            {
                name: '',
                organization: '',
                description: '',
                technologies: '',
                startDate: '',
                endDate: '',
                additionalInfo: '',
                link: ''
            }
        ])
    }

    const RemoveProject = (index) => {
        const removedItem = projectList[index];
        if (removedItem._id) {
            setDeletedProjectIds(prev => [...prev, removedItem._id]);
        }

        const updatedList = projectList.filter((_, i) => i !== index);
        setProjectList(updatedList);
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        const d = new Date(dateStr)
        return d.toISOString().split('T')[0]
    }

    const onSave = async () => {
        setLoading(true)
        const token = localStorage.getItem('token')

        try {
            if (deletedProjectIds) {
                await Promise.all(
                    deletedProjectIds.map(id => {
                        return axios.delete(`http://localhost:5000/api/aicv/resume/project/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                            params: { cvId: resumeId }
                        });
                    })
                );
            }

            await Promise.all(
                projectList.map((project) => {
                    if (project._id) {
                        return axios.put(
                            `http://localhost:5000/api/aicv/resume/project/${project._id}`,
                            { ...project, cvId: resumeId },
                            { headers: { Authorization: `Bearer ${token}` } }
                        )
                    } else {
                        return axios.post(
                            `http://localhost:5000/api/aicv/resume/project`,
                            { ...project, cvId: resumeId },
                            { headers: { Authorization: `Bearer ${token}` } }
                        )
                    }
                })
            )
            enabledNext(true)
            setDeletedProjectIds([]);
            toast('Projects saved successfully!')
        } catch (err) {
            console.error(err)
            toast('Failed to save projects!')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setResumeInfo(prev => ({
            ...prev,
            project: projectList
        }))
    }, [projectList])

    return (
        <div className="h-[81vh] shadow-lg rounded-lg border-t-primary border-t-4 mt-2">
            <div className="p-5 pb-2 shadow-md w-full">
                <h2 className="font-bold text-lg">Projects</h2>
                <p>List your key project experiences</p>
            </div>

            <div className="h-[59vh] overflow-y-auto p-5 pt-0">
                {projectList.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg">
                        <div className="col-span-2">
                            <label>Project Name</label>
                            <Input className="border-gray-300" name="name" value={item.name} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div className="col-span-2">
                            <label>Organization</label>
                            <Input className="border-gray-300" name="organization" value={item.organization} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div className="col-span-2">
                            <label>Description</label>
                            <Textarea className="border-gray-300" name="description" value={item.description} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div className="col-span-2">
                            <label>Technologies (comma-separated)</label>
                            <Input className="border-gray-300" name="technologies" value={item.technologies} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div>
                            <label>Start Date</label>
                            <Input className="border-gray-300" type="date" name="startDate" value={formatDate(item.startDate)} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div>
                            <label>End Date</label>
                            <Input className="border-gray-300" type="date" name="endDate" value={formatDate(item.endDate)} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div className="col-span-2">
                            <label>Additional Info</label>
                            <Textarea className="border-gray-300" name="additionalInfo" value={item.additionalInfo} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div className="col-span-2">
                            <label>Link</label>
                            <Input className="border-gray-300" name="link" value={item.link} onChange={(e) => handleChange(e, index)} />
                        </div>
                        <div className='flex justify-end ml-1 col-span-2 text-right'>
                            <Button variant="outline" onClick={() => RemoveProject(index)} className="text-primary">- Remove</Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 pr-5 pt-2 rounded-b-lg shadow-md border-t-primary border-t-2 flex justify-between">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={AddNewProject} className="text-primary">
                        + Add More Project
                    </Button>
                </div>
                <Button disabled={loading} onClick={onSave}>
                    {loading ? <LoaderCircle className="animate-spin" /> : 'Save'}
                </Button>
            </div>
        </div>
    )
}

export default Project
