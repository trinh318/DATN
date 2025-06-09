import React from 'react'

function ProjectPreview({ resumeInfo }) {
    if (!resumeInfo || !Array.isArray(resumeInfo.project)) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    };

    return (
        <div className="my-6">
            <h2 className="text-center font-bold text-sm mb-2">Projects</h2>
            <hr />

            {resumeInfo.project.map((project, index) => (
                <div className="my-5" key={index}>
                    <h2 className="text-sm font-bold">{project.name}</h2>
                    <h2 className="text-xs italic">{project.organization}</h2>

                    <h2 className="text-xs flex justify-between mt-1">
                        <span>{project.description}</span>
                        <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                    </h2>

                    {project.technologies && project.technologies.length > 0 && (
                        <p className="text-xs mt-1">Technologies: {project.technologies}</p>
                    )}

                    {project.additionalInfo && (
                        <p className="text-xs my-2">{project.additionalInfo}</p>
                    )}

                    {project.link && (
                        <p className="text-xs my-2">
                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                                View Project: {project.link}
                            </a>
                        </p>
                    )}
                </div>
            ))}
        </div>
    )
}

export default ProjectPreview
