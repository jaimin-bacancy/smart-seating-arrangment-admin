import React from 'react';
import { User } from '../../types';
import { WithId } from '../../types/firebase';

interface EmployeeTableProps {
    projects: WithId<User>[];
  onEdit: (employee: WithId<User>) => void;
  onRemove: (employeeId: string) => void;
}

const ProjectTable: React.FC<EmployeeTableProps> = ({ 
projects, 
  onEdit, 
  onRemove 
}) => {
  return (
    <div className="overflow-hidden shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tech Skills
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Team
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map((employee, index) => (
            <tr key={employee.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    {employee.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{employee.displayName}</div>
                    <div className="text-sm text-gray-500">{employee.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 space-x-1">
                  {employee.techSkills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-blue-800">
                {employee.team.map((item, i) => (
                    <span key={i} className="px-2 py-1 mr-2 bg-gray-100 rounded text-xs">
                      {item.displayName}
                    </span>
                  ))}
                </span>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;
