import React, { useEffect } from 'react'

function SummeryPreview({ resumeInfo }) {
  if (!resumeInfo || !resumeInfo.profile) return null;
  
  return (
    <p className='text-xs'>
        {resumeInfo.profile?.professionalSummary}
    </p>
  )
}

export default SummeryPreview