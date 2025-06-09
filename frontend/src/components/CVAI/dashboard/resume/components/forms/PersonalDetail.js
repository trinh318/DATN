import { Button } from '@/components/control/ui/button'
import { Input } from '@/components/control/ui/input'
import { LoaderCircle } from 'lucide-react'
import React, { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { ResumeInfoContext } from '@/components/CVAI/context/ResumeInfoContext'
import axios from 'axios'
import { toast } from 'sonner'

import { FaLinkedin, FaTwitter, FaFacebook, FaGithub, FaGlobe } from 'react-icons/fa'

const SOCIAL_FIELDS = [
    { name: 'linkedIn', icon: FaLinkedin },
    { name: 'twitter', icon: FaTwitter },
    { name: 'facebook', icon: FaFacebook },
    { name: 'github', icon: FaGithub },
    { name: 'website', icon: FaGlobe }
]

function PersonalDetail({ enabledNext }) {
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext)
    const { resumeId } = useParams()
    const [formData, setFormData] = useState({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (resumeInfo && resumeInfo.profile?.cvId === resumeId) {
            setFormData(resumeInfo.profile);
        }
    }, [resumeInfo, resumeId]);

    const handleInputChange = (e) => {
        enabledNext(false)
        const { name, value } = e.target

        let updatedProfile = {}

        const isSocialField = SOCIAL_FIELDS.some(field => field.name === name)

        if (isSocialField) {
            updatedProfile = {
                ...formData,
                socialLinks: {
                    ...formData.socialLinks,
                    [name]: value
                }
            }
        } else {
            updatedProfile = {
                ...formData,
                [name]: value
            }
        }

        setFormData(updatedProfile)

        const updatedResumeInfo = {
            ...resumeInfo,
            profile: updatedProfile
        }

        setResumeInfo(updatedResumeInfo)
    }

    const onSave = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await axios.put(`http://localhost:5000/api/aicv/resume/profile/${resumeId}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )
            toast('Details updated!')
            enabledNext(true)
        } catch (err) {
            console.error(err)
            toast('Update failed!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-[81vh] shadow-lg rounded-lg border-t-primary border-t-4 mt-2">
            <div className='p-5 pb-2 shadow-md w-full'>
                <h2 className='font-bold text-lg'>Personal Profile</h2>
                <p>Fill in your personal and contact details</p>
            </div>

            <form onSubmit={onSave} className='max-h-[59vh] overflow-y-auto p-5 pt-0'>
                <div className='grid grid-cols-2 gap-4 mt-2'>
                    <div>
                        <label className='text-sm'>First Name</label>
                        <Input className="border-gray-300" name="firstName" value={formData?.firstName || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label className='text-sm'>Last Name</label>
                        <Input className="border-gray-300" name="lastName" value={formData?.lastName || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label className='text-sm'>Gender</label>
                        <select name="gender" value={formData?.gender || ''} onChange={handleInputChange} className='h-9 border-gray-300 w-full border p-2 rounded'>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className='text-sm'>Date of Birth</label>
                        <Input className="border-gray-300" type="date" name="dateOfBirth" value={formData?.dateOfBirth?.slice(0, 10) || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label className='text-sm'>Phone Number</label>
                        <Input className="border-gray-300" name="phoneNumber" value={formData?.phoneNumber || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label className='text-sm'>Email</label>
                        <Input className="border-gray-300" name="email" value={formData?.email || ''} onChange={handleInputChange} />
                    </div>
                    <div className='col-span-2'>
                        <label className='text-sm'>Address</label>
                        <Input className="border-gray-300" name="address" value={formData?.address || ''} onChange={handleInputChange} />
                    </div>

                    <div className='col-span-2'>
                        <h3 className='font-semibold mt-2 mb-2'>Social Links</h3>
                        <div className='flex gap-4 mb-3'>
                            {SOCIAL_FIELDS.map(({ name, icon: Icon }) => {
                                const isActive = formData?.socialLinks?.[name] !== undefined
                                return (
                                    <div
                                        key={name}
                                        className={`cursor-pointer p-2 rounded-full border transition ${isActive ? 'bg-blue-100 border-blue-400' : 'border-gray-300'}`}
                                        onClick={() => {
                                            enabledNext(false)
                                            const isRemoving = isActive
                                            const updatedSocialLinks = {
                                                ...formData.socialLinks,
                                                ...(isRemoving ? { [name]: undefined } : { [name]: '' })
                                            }

                                            Object.keys(updatedSocialLinks).forEach((key) => {
                                                if (updatedSocialLinks[key] === undefined) {
                                                    delete updatedSocialLinks[key]
                                                }
                                            })

                                            const updatedProfile = {
                                                ...formData,
                                                socialLinks: updatedSocialLinks
                                            }

                                            setFormData(updatedProfile)
                                            setResumeInfo({
                                                ...resumeInfo,
                                                profile: updatedProfile
                                            })
                                        }}
                                    >
                                        <Icon size={24} />
                                    </div>
                                )
                            })}
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            {SOCIAL_FIELDS.map(({ name }) =>
                                formData?.socialLinks?.[name] !== undefined ? (
                                    <div key={name}>
                                        <label className='text-sm capitalize'>{name}</label>
                                        <Input
                                            className="border-gray-300"
                                            name={name}
                                            value={formData?.socialLinks?.[name] || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                ) : null
                            )}
                        </div>
                    </div>
                </div>
            </form>

            <div className='p-4 pr-5 pt-2 rounded-b-lg shadow-md border-t-primary border-t-2 flex justify-end'>
                <Button type="submit" disabled={loading} onClick={onSave}>
                    {loading ? <LoaderCircle className='animate-spin' /> : 'Save'}
                </Button>
            </div>
        </div>
    )
}

export default PersonalDetail
