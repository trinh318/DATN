import { Button } from '@/components/control/ui/button';
import { Input } from '@/components/control/ui/input';
import { LoaderCircle } from 'lucide-react';
import { ResumeInfoContext } from '@/components/CVAI/context/ResumeInfoContext';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

function Skill({ enabledNext }) {
    const { resumeId } = useParams();
    const [loading, setLoading] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
    const [deletedSkillIds, setDeletedSkillIds] = useState([]);
    const [skillList, setSkillList] = useState([
        {
            category: '',
            skills: [{ name: '', description: '' }]
        }
    ]);

    useEffect(() => {
        if (!hasInitialized && resumeInfo && Array.isArray(resumeInfo.skill)) {
            setSkillList(resumeInfo.skill);
            setHasInitialized(true);
        }
    }, [resumeInfo, hasInitialized]);

    const handleCategoryChange = (event, index) => {
        enabledNext(false);
        const updated = [...skillList];
        updated[index].category = event.target.value;
        setSkillList(updated);
    };

    const handleSkillChange = (event, catIndex, skillIndex) => {
        enabledNext(false);
        const updated = [...skillList];
        const { name, value } = event.target;
        updated[catIndex].skills[skillIndex][name] = value;
        setSkillList(updated);
    };

    const addSkillGroup = () => {
        setSkillList([...skillList, { category: '', skills: [{ name: '', description: '' }] }]);
    };

    const addSkillToGroup = (catIndex) => {
        const updated = [...skillList];
        updated[catIndex].skills.push({ name: '', description: '' });
        setSkillList(updated);
    };

    const removeSkillFromGroup = (catIndex, skillIndex) => {
        const updated = [...skillList];
        updated[catIndex].skills.splice(skillIndex, 1);
        setSkillList(updated);
    };

    const removeSkillGroup = (catIndex) => {
        const removedItem = skillList[catIndex];
        if (removedItem._id) {
            setDeletedSkillIds(prev => [...prev, removedItem._id]);
        }
        const updated = skillList.filter((_, i) => i !== catIndex);
        setSkillList(updated);
    };

    const onSave = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            if (deletedSkillIds.length) {
                await Promise.all(
                    deletedSkillIds.map(id =>
                        axios.delete(`http://localhost:5000/api/aicv/resume/skill/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                            params: { cvId: resumeId }
                        })
                    )
                );
            }

            await Promise.all(
                skillList.map(skillGroup => {
                    if (skillGroup._id) {
                        return axios.put(
                            `http://localhost:5000/api/aicv/resume/skill/${skillGroup._id}`,
                            { ...skillGroup, cvId: resumeId },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                    } else {
                        return axios.post(
                            `http://localhost:5000/api/aicv/resume/skill`,
                            { ...skillGroup, cvId: resumeId },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                    }
                })
            );

            enabledNext(true);
            setDeletedSkillIds([]);
            toast('Skills saved successfully!');
        } catch (err) {
            console.error(err);
            toast('Failed to save skills.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setResumeInfo({
            ...resumeInfo,
            skill: skillList
        });
    }, [skillList]);

    return (
        <div className="h-[81vh] shadow-lg rounded-lg border-t-primary border-t-4 mt-2">
            <div className="p-5 pb-2 shadow-md w-full">
                <h2 className="font-bold text-lg">Skills</h2>
                <p>Add your technical, soft, or domain-specific skills</p>
            </div>

            <div className="h-[59vh] overflow-y-auto p-5 pt-0">
                {skillList.map((group, groupIdx) => (
                    <div key={groupIdx} className="gap-3 border p-3 my-5 rounded-lg">
                        <div className='col-span-2'>
                            <label>Category</label>
                            <Input className="border-gray-300" name='category' value={group.category} onChange={(e) => handleCategoryChange(e, groupIdx)} />
                        </div>
                        {group.skills.map((skill, skillIdx) => (
                            <div key={skillIdx} className="flex items-end gap-3 mb-3">
                                <div className="w-1/4">
                                    <label>Skill Name</label>
                                    <Input className="border-gray-300" name="name" value={skill.name} onChange={(e) => handleSkillChange(e, groupIdx, skillIdx)} />
                                </div>
                                <div className="flex-1">
                                    <label>Description (optional)</label>
                                    <Input className="border-gray-300" name="description" value={skill.description} onChange={(e) => handleSkillChange(e, groupIdx, skillIdx)} />
                                </div>
                                <div className="h-9">
                                    <Button variant="outline" className="text-primary" size="icon" onClick={() => removeSkillFromGroup(groupIdx, skillIdx)}>-</Button>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-between mt-2">
                            <Button variant="outline" className="text-primary" onClick={() => addSkillToGroup(groupIdx)}>
                                + Add Skill
                            </Button>
                            <Button variant="outline" className="text-primary" onClick={() => removeSkillGroup(groupIdx)}>
                                - Remove Group
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 pr-5 pt-2 rounded-b-lg shadow-md border-t-primary border-t-2 flex justify-between">
                <Button variant="outline" onClick={addSkillGroup} className="text-primary">
                    + Add More Skill Group
                </Button>
                <Button disabled={loading} onClick={onSave}>
                    {loading ? <LoaderCircle className="animate-spin" /> : 'Save'}
                </Button>
            </div>
        </div>
    );
}

export default Skill;
