import React from 'react'

function PersonalDetailPreview({ resumeInfo }) {
  if (!resumeInfo || !resumeInfo.profile) return null;

  return (
    <div className="text-sm space-y-2">
      <h2 className='font-bold text-xl text-center'>{resumeInfo.profile?.firstName} {resumeInfo.profile?.lastName}</h2>
      {resumeInfo.profile?.title && <h3 className='text-center text-sm font-medium'>{resumeInfo.profile?.title}</h3>}
      {resumeInfo.profile?.address && <p className='text-center text-xs text-gray-600'>{resumeInfo.profile?.address}</p>}

      <div className='flex justify-between text-xs'>
        <span>{resumeInfo.profile?.phoneNumber}</span>
        <span>{resumeInfo.profile?.email}</span>
      </div>

      {(resumeInfo.profile?.gender || resumeInfo.profile?.dateOfBirth) && (
        <div className='text-xs text-gray-700'>
          {resumeInfo.profile?.gender && <span>Gender: {resumeInfo.profile?.gender}</span>} {' '}
          {resumeInfo.profile?.dateOfBirth && <span> | DOB: {new Date(resumeInfo.profile?.dateOfBirth).toLocaleDateString()}</span>}
        </div>
      )}

      {resumeInfo.profile?.socialLinks && (
        <div>
          <h3 className='font-semibold text-sm mt-4'>Social Links</h3>
          <ul className='text-xs space-y-1'>
            {Object.entries(resumeInfo.profile?.socialLinks).map(([key, value]) =>
              value ? (
                <li key={key}>
                  <span className='capitalize'>{key}:</span>{' '}
                  <a href={value} target="_blank" rel="noreferrer" className='text-blue-600 underline'>
                    {value}
                  </a>
                </li>
              ) : null
            )}
          </ul>
        </div>
      )}

      <hr className='border-[1.5px] my-3' />
    </div>
  );
}

export default PersonalDetailPreview;
