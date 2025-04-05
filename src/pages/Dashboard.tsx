// import React, { useEffect, useState } from 'react';
// // import StatCard from '../components/ui/StatCard';
// import ProjectBar from '../components/ui/ProjectBar';
// import useCollection from '../hooks/useCollection';
// import { User, Project, Seat, OfficeStats } from '../types';
// import { WithId } from '../types/firebase';

// const Dashboard: React.FC = () => {
//   const [officeStats, setOfficeStats] = useState({
//     totalEmployees: 0,
//     occupiedSeats: 0,
//     availableSeats: 0,
//     collaborationScore: 0,
//     utilizationRate: 0,
//   });

//   // Fetch users, projects and seats
//   const { documents: users } = useCollection<User>('users');
//   const { documents: projects } = useCollection<Project>(
//     'projects', 
//     [{ field: 'status', operator: '==', value: 'active' }]
//   );
//   const { documents: seats } = useCollection<Seat>('seats');

//   // Calculate statistics
//   useEffect(() => {
//     if (users.length && seats.length) {
//       const totalEmployees = users.length;
//       const occupiedSeats = seats.filter(seat => 
//         seat.status === 'occupied' || seat.status === 'reserved'
//       ).length;
//       const availableSeats = seats.filter(seat => 
//         seat.status === 'available'
//       ).length;
      
//       // Calculate utilization rate
//       const totalUsableSeats = occupiedSeats + availableSeats;
//       const utilizationRate = totalUsableSeats > 0 
//         ? Math.round((occupiedSeats / totalUsableSeats) * 100) 
//         : 0;
      
//       // For collaboration score, this would typically be a more complex calculation
//       // This is a simplified placeholder
//       const collaborationScore = 87; // Placeholder value
      
//       setOfficeStats({
//         totalEmployees,
//         occupiedSeats,
//         availableSeats,
//         collaborationScore,
//         utilizationRate
//       });
//     }
//   }, [users, seats]);

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         {/* <StatCard title="Total Employees" value={officeStats.totalEmployees} />
//         <StatCard title="Occupied Seats" value={officeStats.occupiedSeats} />
//         <StatCard title="Available Seats" value={officeStats.availableSeats} />
//         <StatCard title="Collaboration Score" value={officeStats.collaborationScore} suffix="%" /> */}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
import React, { useEffect, useState } from 'react';
import StatCard from '../components/ui/StatCard';
import ProjectBar from '../components/ui/ProjectBar';
import OfficeStats from '../components/dashboard/OfficeStats';
import OfficeLayoutMap from '../components/dashboard/OfficeLayoutMap';
import ProjectDistribution from '../components/dashboard/ProjectDistribution';
import useCollection from '../hooks/useCollection';
import { User, Project, Seat, OfficeStats as OfficeStatsType } from '../types';
import { WithId } from '../types/firebase';
import { UserService } from '../services/users';
import { ProjectService } from '../services/projects';
import { LayoutService } from '../services/layouts';
import { FloorService } from '../services/floors';
import { ZoneService } from '../services/zones';
import { SeatService } from '../services/seats';
import { NotificationService } from '../services/notifications';
import { useUI } from '../contexts/UIContext';
import { Users, LayoutGrid, FileCheck } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { showToast } = useUI();
  const [officeStats, setOfficeStats] = useState({
    totalEmployees: 0,
    occupiedSeats: 0,
    availableSeats: 0,
    collaborationScore: 0,
    utilizationRate: 0,
  });
  const [initializingData, setInitializingData] = useState(false);

  // Fetch users, projects and seats
  const { documents: users, loading: loadingUsers } = useCollection<User>('users');
  const { documents: projects, loading: loadingProjects } = useCollection<Project>(
    'projects', 
    [{ field: 'status', operator: '==', value: 'active' }]
  );
  const { documents: seats, loading: loadingSeats } = useCollection<Seat>('seats');

  // Calculate statistics
  useEffect(() => {
    if (users.length && !loadingUsers) {
      const totalEmployees = users.length;
      const occupiedSeats = seats.filter(seat => 
        seat.status === 'occupied' || seat.status === 'reserved'
      ).length;
      const availableSeats = seats.filter(seat => 
        seat.status === 'available'
      ).length;
      
      // Calculate utilization rate
      const totalUsableSeats = occupiedSeats + availableSeats;
      const utilizationRate = totalUsableSeats > 0 
        ? Math.round((occupiedSeats / totalUsableSeats) * 100) 
        : 0;
      
      // For collaboration score, this would typically be a more complex calculation
      // This is a simplified placeholder
      const collaborationScore = 87; // Placeholder value
      
      setOfficeStats({
        totalEmployees,
        occupiedSeats,
        availableSeats,
        collaborationScore,
        utilizationRate
      });
    }
  }, [users, seats, loadingUsers, loadingSeats]);

  // Initialize demo data function
  const initializeDemoData = async () => {
    if (users.length > 0 || projects.length > 0 || seats.length > 0) {
      showToast('Data already exists in the database', 'info');
      return;
    }

    setInitializingData(true);
    try {
      // 1. Create sample employees
      const sampleEmployees = [
        {
          displayName: 'John Smith',
          email: 'john@example.com',
          role: 'admin',
          department: 'Engineering',
          employeeId: 'EMP-1001',
          techSkills: ['React', 'Node.js', 'AWS'],
          currentProjects: []
        },
        {
          displayName: 'Sarah Johnson',
          email: 'sarah@example.com',
          role: 'pm',
          department: 'Product',
          employeeId: 'EMP-1002',
          techSkills: ['Product Management', 'Scrum Master'],
          currentProjects: []
        },
        {
          displayName: 'Michael Chen',
          email: 'michael@example.com',
          role: 'employee',
          department: 'Engineering',
          employeeId: 'EMP-1003',
          techSkills: ['React', 'Angular', 'TypeScript'],
          currentProjects: []
        },
        {
          displayName: 'Emily Davis',
          email: 'emily@example.com',
          role: 'employee',
          department: 'Design',
          employeeId: 'EMP-1004',
          techSkills: ['UI/UX', 'Figma'],
          currentProjects: []
        },
        {
          displayName: 'David Wilson',
          email: 'david@example.com',
          role: 'doe',
          department: 'Engineering',
          employeeId: 'EMP-1005',
          techSkills: ['Java', 'Python', 'DevOps'],
          currentProjects: []
        }
      ];
      
      const employeeIds = [];
      
      // Create users
      for (const employee of sampleEmployees) {
        const id = await UserService.createUser(`user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, employee);
        employeeIds.push(id);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure unique IDs
      }
      
      // 2. Create sample projects
      const sampleProjects = [
        {
          name: 'Frontend Redesign',
          description: 'Redesign the frontend UI with modern React components',
          startDate: new Date('2023-01-15'),
          endDate: new Date('2023-06-30'),
          priority: 4,
          status: 'active',
          techStack: ['React', 'TypeScript', 'Tailwind CSS']
        },
        {
          name: 'API Integration',
          description: 'Integrate third-party APIs for expanded functionality',
          startDate: new Date('2023-03-01'),
          endDate: new Date('2023-08-15'),
          priority: 3,
          status: 'active',
          techStack: ['Node.js', 'Express', 'REST API']
        },
        {
          name: 'Mobile App Development',
          description: 'Develop a mobile app version of the platform',
          startDate: new Date('2023-02-10'),
          endDate: new Date('2023-09-30'),
          priority: 5,
          status: 'active',
          techStack: ['React Native', 'Firebase', 'Redux']
        }
      ];
      
      const projectIds = [];
      
      // Create projects (simplified - in a real app we'd properly set up the project manager reference)
      for (const project of sampleProjects) {
        const projectId = await ProjectService.createProject(
          project.name,
          project.description,
          project.startDate,
          project.endDate,
          employeeIds[1], // Sarah as PM
          project.priority,
          project.techStack,
          'active' as any
        );
        projectIds.push(projectId);
      }
      
      // 3. Create a sample office layout
      const layoutId = await LayoutService.createLayout('Main Office');
      
      // 4. Create a floor
      const floorId = await FloorService.createFloor('Floor 1', 1, layoutId);
      
      // 5. Create zones
      const zoneIds = {
        engineering: await ZoneService.createZone('Engineering Zone', floorId, 'team_area', '#4C6EF5'),
        design: await ZoneService.createZone('Design Zone', floorId, 'team_area', '#40C057'),
        meeting: await ZoneService.createZone('Meeting Area', floorId, 'meeting', '#FA5252'),
        collaboration: await ZoneService.createZone('Collaboration Space', floorId, 'collaboration', '#FD7E14')
      };
      
      // 6. Create seats
      const seatLabels = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
      
      for (let i = 0; i < 5; i++) {
        const zoneId = i < 3 ? zoneIds.engineering : zoneIds.design;
        const seatId = await SeatService.createSeat(seatLabels[i], floorId, zoneId);
        
        // Assign some seats to employees
        if (i < employeeIds.length) {
          await SeatService.assignSeatToUser(seatId, employeeIds[i]);
        }
      }
      
      // 7. Create notifications
      await NotificationService.createAnnouncementNotification(
        'Welcome to Smart Office!',
        'The new smart office platform is now live. Explore the features and provide feedback.',
        employeeIds,
        'medium'
      );
      
      await NotificationService.createMaintenanceNotification(
        employeeIds,
        'Meeting Room Zone',
        new Date(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      );
      
      showToast('Demo data initialized successfully!', 'success');
    } catch (error) {
      console.error('Error initializing demo data:', error);
      showToast('Failed to initialize demo data', 'error');
    } finally {
      setInitializingData(false);
    }
  };

  const isLoading = loadingUsers || loadingProjects || loadingSeats;
  const isEmpty = !isLoading && users.length === 0 && projects.length === 0 && seats.length === 0;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        
        {isEmpty && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            onClick={initializeDemoData}
            disabled={initializingData}
          >
            {initializingData ? 'Initializing Data...' : 'Initialize Demo Data'}
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      ) : isEmpty ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-4">Welcome to Smart Office!</h3>
          <p className="text-gray-500 mb-6">
            Your database is currently empty. Initialize with demo data to explore the features.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border rounded-lg p-6 text-center">
              <Users className="h-10 w-10 mx-auto mb-4 text-blue-600" />
              <h4 className="font-medium mb-2">Employees</h4>
              <p className="text-gray-500 text-sm">Create employee profiles with roles and skills</p>
            </div>
            
            <div className="border rounded-lg p-6 text-center">
              <LayoutGrid className="h-10 w-10 mx-auto mb-4 text-green-600" />
              <h4 className="font-medium mb-2">Office Layout</h4>
              <p className="text-gray-500 text-sm">Set up office floors, zones, and seats</p>
            </div>
            
            <div className="border rounded-lg p-6 text-center">
              <FileCheck className="h-10 w-10 mx-auto mb-4 text-purple-600" />
              <h4 className="font-medium mb-2">Projects</h4>
              <p className="text-gray-500 text-sm">Manage projects and team assignments</p>
            </div>
          </div>
          
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            onClick={initializeDemoData}
            disabled={initializingData}
          >
            {initializingData ? 'Initializing Data...' : 'Initialize Demo Data'}
          </button>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <OfficeStats stats={officeStats} />
          
          {/* Office Layout Preview */}
          <OfficeLayoutMap />
          
          {/* Project Distribution */}
          <ProjectDistribution 
            projects={projects} 
            totalEmployees={officeStats.totalEmployees} 
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;