import React from 'react';

function PublicationPreview({ resumeInfo }) {
    if (!resumeInfo || !Array.isArray(resumeInfo.publication)) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    };

    return (
        <div className='my-6'>
            <h2 className='text-center font-bold text-sm mb-2'>Publications</h2>
            <hr />

            {resumeInfo.publication.map((pub, index) => (
                <div className='my-5' key={index}>
                    <h2 className='text-sm font-bold'>{pub.name}</h2>
                    <h2 className='text-xs italic'>{pub.publisher}</h2>

                    <h2 className='text-xs mt-1'>
                        <span>{formatDate(pub.date)}</span>
                    </h2>

                    {pub.additionalInfo && (
                        <p className='text-xs my-2'>{pub.additionalInfo}</p>
                    )}
                </div>
            ))}
        </div>
    );
}

export default PublicationPreview;
