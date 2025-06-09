import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/control/ui/dialog"
import { Button } from '@/components/control/ui/button'
import { Input } from '@/components/control/ui/input'
import { Loader2, PlusSquare } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import "../../../../index.css";

function AddResume({ refreshData }) {
    const [openDialog, setOpenDialog] = useState(false)
    const [resumeTitle, setResumeTitle] = useState('')
    const [loading, setLoading] = useState(false)
    const navigation = useNavigate()

    const onCreate = async () => {
        setLoading(true)

        try {
            const token = localStorage.getItem('token')
            if (!token) {
                alert('Missing token. Please login again.')
                setLoading(false)
                return
            }

            const response = await axios.post('http://localhost:5000/api/aicv/resume', {
                title: resumeTitle,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const createdResume = response.data
            navigation(`/create-cv-with-ai/resume/${createdResume.profile?._id}/edit`)
            if (refreshData) refreshData()
            setOpenDialog(false)
        } catch (err) {
            console.error('Failed to create resume:', err)
            alert('Failed to create resume')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className='p-14 py-24 items-center flex justify-center bg-gray-100 rounded-lg h-[280px] hover:scale-105 transition-all hover:shadow-md cursor-pointer hover:bg-gray-100'
                onClick={() => setOpenDialog(true)}
            >
                <PlusSquare />
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Resume</DialogTitle>
                        <DialogDescription>
                            <p>Add a title for your new resume</p>
                            <Input
                                className="my-2"
                                placeholder="e.g. Full Stack Resume"
                                onChange={(e) => setResumeTitle(e.target.value)}
                                value={resumeTitle}
                            />
                        </DialogDescription>
                        <div className='flex justify-end gap-5'>
                            <Button onClick={() => setOpenDialog(false)} variant="ghost">Cancel</Button>
                            <Button disabled={!resumeTitle || loading} onClick={onCreate}>
                                {loading ? <Loader2 className='animate-spin' /> : 'Create'}
                            </Button>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddResume
