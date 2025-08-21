import React, { useState } from 'react';
import { Calendar, Search, Bell, Settings, Users, FolderKanban, CheckSquare, MessageSquare, User, Plus, Filter, Clock, Target, TrendingUp, MoreHorizontal, CalendarDays } from 'lucide-react';
import WeeklyTaskView from './components/WeeklyTaskView';
import { users, projects, weeklyTasks } from './data/mockData';
import { Project } from './types';

const App = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedUserId, setSelectedUserId] = useState(1);

  // Convert project team arrays to use user IDs instead of avatar URLs
  const projectsWithUserIds: Project[] = projects.map(project => ({
    ...project,
    team: project.team // Already using user IDs in mockData
  }));

  // Convert tasks to include user data
  const tasksWithUsers = weeklyTasks.slice(0, 2).map(task => {
    const user = users.find(u => u.id === task.assigneeId)!;
    return {
      ...task,
      assignee: {
        name: user.name,
        avatar: user.avatar
      },
      dueDate: task.dueDate.includes('T') ? 
        new Date(task.dueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 
        task.dueDate,
      project: task.project || 'General'
    };
  });

  const upcomingMeetings = [
    {
      id: 1,
      title: 'Wallet App Meeting',
      type: 'Online Meeting',
      time: '09:40 am',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      title: 'Deal With New Client',
      type: 'Zoom Meeting',
      time: '11:30 am',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 3,
      title: 'Medical Web Meeting',
      type: 'Zoom Meeting',
      time: '04:00 pm',
      color: 'bg-green-100 text-green-600'
    }
  ];

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Target, active: true },
    { id: 'projects', label: 'Projects', icon: FolderKanban, active: false },
    { id: 'weekly-tasks', label: 'Weekly Tasks', icon: CalendarDays, active: false },
    { id: 'calendar', label: 'Calendar', icon: Calendar, active: false },
    { id: 'team', label: 'Team', icon: Users, active: false },
    { id: 'messages', label: 'Messages', icon: MessageSquare, active: false, badge: 3 },
    { id: 'settings', label: 'Settings', icon: Settings, active: false }
  ];

  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = '#3B82F6' }: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{percentage}%</div>
            <div className="text-sm text-gray-500">Task Finished</div>
          </div>
        </div>
      </div>
    );
  };

  const ProjectCard = ({ project }: { project: Project }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${project.color} rounded-lg flex items-center justify-center`}>
          <FolderKanban className="w-6 h-6 text-white" />
        </div>
        <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
      <p className="text-sm text-gray-500 mb-4">{project.category}</p>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${project.color}`}
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {project.team.map((userId, index) => {
            const user = users.find(u => u.id === userId);
            return user ? (
            <img
              key={index}
              className="w-8 h-8 rounded-full border-2 border-white"
              src={user.avatar}
              alt={user.name}
              title={user.name}
            />
            ) : null;
          })}
        </div>
        <div className="text-sm text-gray-500">
          {project.daysLeft} days left
        </div>
      </div>
    </div>
  );

  const TaskItem = ({ task }: { task: {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    assignee: {
      name: string;
      avatar: string;
    };
  } }) => (
    <div className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{task.title}</h4>
            <p className="text-sm text-gray-500">{task.description}</p>
          </div>
        </div>
        <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100 transition-colors">
          Reminder
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">{task.dueDate}</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-400">4 comments</span>
          <img
            className="w-6 h-6 rounded-full"
            src={task.assignee.avatar}
            alt={task.assignee.name}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-sm border-r border-gray-200 z-50">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TASKIE</span>
          </div>
        </div>
        
        <nav className="mt-6 px-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <div className="border-t border-gray-200 pt-4">
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <User className="w-5 h-5" />
              <span>Help & Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hello Jacob !!!</h1>
              <p className="text-gray-500">Welcome Back !</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="font-medium text-gray-900">Jacob Janson</div>
                  <div className="text-sm text-gray-500">jacob.janson@taskie.com</div>
                </div>
                <img
                  className="w-10 h-10 rounded-full"
                  src="https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2"
                  alt="User"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {activeSection === 'weekly-tasks' ? (
            <WeeklyTaskView 
              selectedUserId={selectedUserId}
              onUserChange={setSelectedUserId}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                {/* Statistics Cards */}
                <div className="lg:col-span-3">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <FolderKanban className="w-6 h-6" />
                        </div>
                        <TrendingUp className="w-5 h-5 opacity-80" />
                      </div>
                      <div className="text-2xl font-bold mb-1">12</div>
                      <div className="text-blue-100">Active Projects</div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">8</div>
                      <div className="text-gray-500">Team Members</div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                          <CheckSquare className="w-6 h-6 text-green-600" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">156</div>
                      <div className="text-gray-500">Tasks Completed</div>
                    </div>
                  </div>
                </div>

                {/* Overall Progress */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Overall Progress</h3>
                  <div className="flex justify-center">
                    <CircularProgress percentage={61} color="#EF4444" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Projects Section */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Plus className="w-4 h-4" />
                      <span>New Project</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {projectsWithUserIds.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>

                  {/* Tasks Today */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Task Today</h2>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                        <Filter className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {tasksWithUsers.map((task) => (
                        <TaskItem key={task.id} task={task} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                  {/* Calendar */}
                  <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Dec 2021</h3>
                      <div className="flex space-x-1">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                      <div className="text-gray-400 py-2">Sun</div>
                      <div className="text-gray-400 py-2">Mon</div>
                      <div className="text-gray-400 py-2">Tue</div>
                      <div className="text-gray-400 py-2">Wed</div>
                      <div className="text-gray-400 py-2">Thu</div>
                      <div className="text-gray-400 py-2">Fri</div>
                      <div className="text-gray-400 py-2">Sat</div>
                      
                      {[...Array(31)].map((_, i) => (
                        <div
                          key={i}
                          className={`py-2 text-sm hover:bg-gray-50 rounded cursor-pointer ${
                            i + 1 === 13 ? 'bg-red-500 text-white' : 'text-gray-700'
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Meetings */}
                  <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Upcoming</h3>
                    <div className="space-y-4">
                      {upcomingMeetings.map((meeting) => (
                        <div key={meeting.id} className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${meeting.color.includes('blue') ? 'bg-blue-500' : meeting.color.includes('purple') ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">{meeting.title}</div>
                            <div className="text-xs text-gray-500">{meeting.type}</div>
                          </div>
                          <div className="text-xs text-gray-400">{meeting.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;