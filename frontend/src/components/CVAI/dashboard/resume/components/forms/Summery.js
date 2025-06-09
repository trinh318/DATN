import { Button } from '@/components/control/ui/button'
import { Textarea } from '@/components/control/ui/textarea'
import { ResumeInfoContext } from '@/components/CVAI/context/ResumeInfoContext';
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { Brain, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AIChatSession } from '@/service/AIModal';
import axios from 'axios'

const PROMPT_TEMPLATE = `
Based on the following work experience details, write a concise and professional summary (3–5 sentences) suitable for a resume. 
The tone should be confident and formal. Highlight transferable skills, attitude, and achievements. 
Do not repeat company names or specific job titles—focus on the value brought as a professional.

Work Experience:
{experienceDetails}
`;
function Summery({ enabledNext }) {
    const { resumeId } = useParams()
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
    const [summery, setSummery] = useState();
    const [loading, setLoading] = useState(false);
    const [aiGeneratedSummeryList, setAiGenerateSummeryList] = useState();

    useEffect(() => {
        if (resumeInfo?.profile?.professionalSummary && !summery) {
            setSummery(resumeInfo.profile.professionalSummary);
        }
    }, [resumeInfo]);

    function cleanHTMLDescription(html) {
        return html
            .replace(/<\/?ul>/g, '')
            .replace(/<\/li>/g, '')
            .replace(/<li>/g, '')
            .trim();
    }

    const GenerateSummeryFromAI = async () => {
        if (!resumeInfo?.workExperience?.length) {
            toast('Please Add Work Experience');
            return;
        }

        setLoading(true);

        try {
            const experienceDetails = resumeInfo.workExperience.map((exp, idx) => {
                const cleanedDescription = cleanHTMLDescription(exp.description);

                return `${idx + 1}. Company Name: ${exp.companyName}
            Location: ${exp.location}
            Position Title: ${exp.position}
            Start Date: ${new Date(exp.startDate).toLocaleDateString()}
            End Date: ${new Date(exp.endDate).toLocaleDateString()}
            Description: ${cleanedDescription}`;
            }).join('\n\n');

            const prompt = PROMPT_TEMPLATE.replace('{experienceDetails}', experienceDetails);

            const result = await AIChatSession.sendMessage(prompt);
            const rawText = await result.response.text();
            const parsed = JSON.parse(rawText);
            if (!parsed.summary) throw new Error('Missing summary in AI response');

            setAiGenerateSummeryList(parsed.summary);

        } catch (err) {
            console.error(err);
            toast.error('Failed to generate summary. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onSave = async (e) => {
        e.preventDefault();
        setLoading(true)
        const data = {
            cvId: resumeId,
            professionalSummary: summery
        };

        try {
            const token = localStorage.getItem('token')
            const res = await axios.put(`http://localhost:5000/api/aicv/resume/profile/${resumeId}`,
                data,
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

    useEffect(() => {
        setResumeInfo({
            ...resumeInfo,
            profile: {
                ...resumeInfo.profile,
                professionalSummary: summery,
            },
        });
    }, [summery]);

    return (
        <div>
            <div className='p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-2'>
                <h2 className='font-bold text-lg'>Professional Summary</h2>
                <p className='text-xs'>Add professional summary for your job title</p>

                <form className='mt-7' onSubmit={onSave}>
                    <div className='flex justify-between items-end'>
                        <label>Add Professional Summary</label>
                        <Button variant="outline" onClick={() => GenerateSummeryFromAI()} type="button" size="sm" className="border-primary text-primary flex gap-2">
                            <Brain className='h-4 w-4' />  Generate from AI
                        </Button>
                    </div>
                    <Textarea className="mt-5 border-gray-300" required value={summery ?? resumeInfo.profile?.professionalSummary ?? ''} onChange={(e) => setSummery(e.target.value)} />
                    <div className='mt-2 flex justify-end'>
                        <Button type="submit" disabled={loading}>
                            {loading ? <LoaderCircle className='animate-spin' /> : 'Save'}
                        </Button>
                    </div>
                </form>
            </div>

            {aiGeneratedSummeryList &&
                <div className='my-5'>
                    <h2 className='font-bold text-lg'>Suggestions</h2>
                    {/* Nếu aiGeneratedSummeryList là một chuỗi */}
                    <div onClick={() => setSummery(aiGeneratedSummeryList)} className='p-5 shadow-lg my-4 rounded-lg cursor-pointer'>
                        <p>{aiGeneratedSummeryList}</p>
                    </div>
                </div>
            }
        </div>
    )
}

export default Summery