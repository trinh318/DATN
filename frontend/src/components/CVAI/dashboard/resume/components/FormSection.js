import React, { useState } from 'react'
import PersonalDetail from './forms/PersonalDetail'
import { Button } from '@/components/control/ui/button'
import { ArrowLeft, ArrowRight, Home } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom';
import Experience from './forms/Experience';
import Education from './forms/Education';
import Summery from './forms/Summery';
import Certification from './forms/Certification';
import Award from './forms/Award';
import Project from './forms/Project';
import Volunteering from './forms/Volunteering';
import Publication from './forms/Publication';
import Skill from './forms/Skill';

function FormSection() {
    const [activeFormIndex, setActiveFormIndex] = useState(1);
    const [enableNext, setEnableNext] = useState(true);
    const { resumeId } = useParams();
    return (
        <div>
            <div className='flex justify-between items-center'>
                <div className='flex gap-5'>
                    <Link to={"/create-cv-with-ai/dashboard"}>
                        <Button><Home /></Button>
                    </Link>

                </div>
                <div className='flex gap-2'>
                    {activeFormIndex > 1 && <Button size="sm" onClick={() => setActiveFormIndex(activeFormIndex - 1)}> <ArrowLeft /> </Button>}
                    <Button disabled={!enableNext} className="flex gap-2" size="sm" onClick={() => setActiveFormIndex(activeFormIndex + 1)}>Next
                        <ArrowRight />
                    </Button>
                </div>
            </div>
            {/* Personal Detail  */}
            {activeFormIndex == 1 ?
                <PersonalDetail enabledNext={(v) => setEnableNext(v)} />
                : activeFormIndex == 2 ?
                    <Education enabledNext={(v) => setEnableNext(v)} />
                    : activeFormIndex == 3 ?
                        <Experience enabledNext={(v) => setEnableNext(v)} />
                        : activeFormIndex == 4 ?
                            <Summery enabledNext={(v) => setEnableNext(v)} />
                            : activeFormIndex == 5 ?
                                <Skill enabledNext={(v) => setEnableNext(v)} />
                                : activeFormIndex == 6 ?
                                    <Certification enabledNext={(v) => setEnableNext(v)} />
                                    : activeFormIndex == 7 ?
                                        <Award enabledNext={(v) => setEnableNext(v)} />
                                        : activeFormIndex == 8 ?
                                            <Project enabledNext={(v) => setEnableNext(v)} />
                                            : activeFormIndex == 9 ?
                                                <Volunteering enabledNext={(v) => setEnableNext(v)} />
                                                : activeFormIndex == 10 ?
                                                    <Publication enabledNext={(v) => setEnableNext(v)} />
                                                    : activeFormIndex == 11 ?
                                                        <Navigate to={'/create-cv-with-ai/my-resume/' + resumeId + '/view'} />
                                                        : null
            }
        </div>
    )
}

export default FormSection