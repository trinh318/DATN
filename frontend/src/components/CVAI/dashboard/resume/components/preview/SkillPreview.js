import React from 'react';

function SkillPreview({ resumeInfo }) {
    if (!resumeInfo || !Array.isArray(resumeInfo.skill)) return null;

    return (
        <div className='my-6'>
            <h2 className='text-center font-bold text-sm mb-2'>Skills</h2>
            <hr />

            {resumeInfo.skill.map((skillGroup, index) => (
                <div className='my-5' key={index}>
                    <h2 className='text-sm font-bold mb-1'>{skillGroup.category}</h2>
                    <ul className='list-disc list-inside text-xs'>
                        {skillGroup.skills.map((skill, idx) => (
                            <li key={idx}>
                                <span className='font-medium'>{skill.name}</span>
                                {skill.description && (
                                    <p className='text-gray-600'>{skill.description}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default SkillPreview;
