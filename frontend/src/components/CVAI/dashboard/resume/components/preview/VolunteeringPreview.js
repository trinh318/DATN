import React from 'react';

function VolunteeringPreview({ resumeInfo }) {
    if (!resumeInfo || !Array.isArray(resumeInfo.volunteering)) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    };

    return (
        <div className='my-6'>
            <h2 className='text-center font-bold text-sm mb-2'>Volunteering</h2>
            <hr />

            {resumeInfo.volunteering.map((item, index) => (
                <div className='my-5' key={index}>
                    <h2 className='text-sm font-bold'>{item.organization}</h2>
                    <h2 className='text-xs italic'>{item.city}</h2>

                    <h2 className='text-xs flex justify-between mt-1'>
                        {item.involvement}
                        <span>{formatDate(item.startDate)} - {formatDate(item.endDate)}</span>
                    </h2>

                    {item.additionalInfo && (
                        <p className='text-xs my-2'>{item.additionalInfo}</p>
                    )}
                </div>
            ))}
        </div>
    );
}

export default VolunteeringPreview;
