import React from 'react'

function CertificationPreview({ resumeInfo }) {
    if (!resumeInfo || !Array.isArray(resumeInfo.certification)) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    };

    return (
        <div className='my-6'>
            <h2 className='text-center font-bold text-sm mb-2'>Certifications</h2>
            <hr />

            {resumeInfo.certification.map((cert, index) => (
                <div className='flex justify-between my-5' key={index}>
                    <h2 className='text-sm font-bold'>{cert.name} {cert.score}</h2>
                    <span className='text-xs'>{formatDate(cert.startDate)} - {formatDate(cert.endDate)}</span>
                </div>
            ))}
        </div>
    )
}

export default CertificationPreview
