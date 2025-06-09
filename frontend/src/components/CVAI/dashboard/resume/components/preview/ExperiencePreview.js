import React from 'react'

function ExperiencePreview({ resumeInfo }) {
    if (!resumeInfo || !Array.isArray(resumeInfo.workExperience)) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    };

    return (
        <div className='my-6'>
            <h2 className='text-center font-bold text-sm mb-2'>Work Experience</h2>
            <hr />
            {resumeInfo.workExperience.map((experience, index) => (
                <div key={index} className='my-5'>
                    <h2 className='text-sm font-bold'>
                        {experience?.position || 'Unknown Position'}
                    </h2>
                    <h2 className='text-xs flex justify-between'>
                        <span>
                            {experience?.companyName || 'Unknown Company'}
                            {experience?.location ? `, ${experience.location}` : ''}
                        </span>
                        <span>
                            {formatDate(experience?.startDate) || 'N/A'} to{' '}
                            {!experience?.endDate
                                ? 'Present'
                                : formatDate(experience?.endDate)}
                        </span>
                    </h2>
                    <div
                        className='text-xs my-2'
                        dangerouslySetInnerHTML={{ __html: experience?.description || '' }}
                    />
                </div>
            ))}
        </div>
    );
}

export default ExperiencePreview