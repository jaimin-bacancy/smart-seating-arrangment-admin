import React from 'react';
import ProjectTable from '../components/ui/ProjectTable';
import { projects } from '../utils/projects';

const ProjectsPage: React.FC = () => {

    return (
        <div className="p-6">

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <ProjectTable
                    projects={projects}
                />
            </div>

        </div>
    );
};

export default ProjectsPage;