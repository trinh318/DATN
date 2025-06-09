import React from 'react'

function EducationalPreview({ resumeInfo }) {
    if (!resumeInfo || !Array.isArray(resumeInfo.education)) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    };

    return (
        <div className='my-6'>
            <h2 className='text-center font-bold text-sm mb-2'>Education</h2>
            <hr />

            {resumeInfo.education.map((edu, index) => (
                <div className='my-5' key={index}>
                    <h2 className='text-sm font-bold'>{edu.university}</h2>
                    <h2 className='text-xs italic'>{edu.city}</h2>

                    <h2 className='text-xs flex justify-between mt-1'>
                        {edu.degree} in {edu.major}
                        <span>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
                    </h2>

                    {edu.gpa && <p className='text-xs mt-1'>GPA: {edu.gpa}</p>}

                    {edu.additionalInfo && (
                        <p className='text-xs my-2'>{edu.additionalInfo}</p>
                    )}
                </div>
            ))}
        </div>
    )
}

export default EducationalPreview
