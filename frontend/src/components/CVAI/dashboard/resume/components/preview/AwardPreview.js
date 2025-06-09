import React from 'react'

function AwardPreview({ resumeInfo }) {
    if (!resumeInfo || !Array.isArray(resumeInfo.award)) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    };

    return (
        <div className='my-6'>
            <h2 className='text-center font-bold text-sm mb-2'>Award and Scholarship</h2>
            <hr />

            {resumeInfo.award.map((award, index) => (
                <div className='my-5' key={index}>
                    <h2 className='text-sm font-bold'>{award.name}</h2>
                    <div className='flex justify-between text-xs mt-1'>
                        <span>{award.organization}</span>
                        <span>{formatDate(award.dateEarned)}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default AwardPreview
