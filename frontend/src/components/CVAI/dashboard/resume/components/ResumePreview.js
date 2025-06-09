import { ResumeInfoContext } from '@/components/CVAI/context/ResumeInfoContext';
import React, { useContext } from 'react';
import PersonalDetailPreview from './preview/PersonalDetailPreview';
import EducationalPreview from './preview/EducationalPreview';
import ExperiencePreview from './preview/ExperiencePreview';
import SummeryPreview from './preview/SummeryPreview';
import CertificationPreview from './preview/CertificationPreview';
import AwardPreview from './preview/AwardPreview';
import ProjectPreview from './preview/ProjectPreview';
import VolunteeringPreview from './preview/VolunteeringPreview';
import PublicationPreview from './preview/PublicationPreview';
import SkillPreview from './preview/SkillPreview';

function ResumePreview({ className = "" }) {
    const { resumeInfo } = useContext(ResumeInfoContext);

    const hasValidItems = (arr) => {
        return Array.isArray(arr) && arr.some(item => {
            if (typeof item !== 'object' || item === null) return false;
            return Object.values(item).some(value => value !== null && value !== undefined && value !== '');
        });
    };

    return (
        <div className={`shadow-lg p-14 border-t-[20px] ${className}`}>
            {/* Personal Detail  */}
            <PersonalDetailPreview resumeInfo={resumeInfo} />

            {/* Summary */}
            <SummeryPreview resumeInfo={resumeInfo} />

            {/* Education */}
            {hasValidItems(resumeInfo?.education) && <EducationalPreview resumeInfo={resumeInfo} />}

            {/* Work Experience */}
            {hasValidItems(resumeInfo?.workExperience) && <ExperiencePreview resumeInfo={resumeInfo} />}
            
            {/* Skill */}
            {hasValidItems(resumeInfo?.skill) && <SkillPreview resumeInfo={resumeInfo} />}
            
            {/* Certification */}
            {hasValidItems(resumeInfo?.certification) && <CertificationPreview resumeInfo={resumeInfo} />}

            {/* Award */}
            {hasValidItems(resumeInfo?.award) && <AwardPreview resumeInfo={resumeInfo} />}

            {/* Project */}
            {hasValidItems(resumeInfo?.project) && <ProjectPreview resumeInfo={resumeInfo} />}

            {/* Volunteering */}
            {hasValidItems(resumeInfo?.volunteering) && <VolunteeringPreview resumeInfo={resumeInfo} />}

            {/* Publication */}
            {hasValidItems(resumeInfo?.publication) && <PublicationPreview resumeInfo={resumeInfo} />}
        </div>
    );
}

export default ResumePreview;