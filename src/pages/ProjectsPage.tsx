import React, { useState, useEffect } from 'react';
import EmployeeTable from '../components/ui/EmployeeTable';
import Pagination from '../components/ui/Pagination';
import SearchInput from '../components/ui/SearchInput';
import EmployeeFilters from '../components/employees/EmployeeFilters';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import useCollection from '../hooks/useCollection';
import { UserService } from '../services/users';
import { User } from '../types';
import { WithId } from '../types/firebase';
import { useUI } from '../contexts/UIContext';
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