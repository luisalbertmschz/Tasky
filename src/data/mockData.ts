import { User, Task, Project } from '../types';

export const users: User[] = [
  {
    id: 1,
    name: 'Jacob Janson',
    longName: 'Jacob Alexander Janson',
    email: 'jacob.janson@taskie.com',
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
    role: 'Project Manager',
    department: 'Management'
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    longName: 'Sarah Michelle Wilson',
    email: 'sarah.wilson@taskie.com',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
    role: 'UI/UX Designer',
    department: 'Design'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    longName: 'Michael Robert Johnson',
    email: 'mike.johnson@taskie.com',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
    role: 'Full Stack Developer',
    department: 'Development'
  },
  {
    id: 4,
    name: 'Emma Davis',
    longName: 'Emma Catherine Davis',
    email: 'emma.davis@taskie.com',
    avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
    role: 'Marketing Specialist',
    department: 'Marketing'
  }
];

export const getCurrentWeekMonday = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return monday.toISOString().split('T')[0];
};

export const getWeekRange = (mondayDate: string): { start: string; end: string } => {
  const monday = new Date(mondayDate);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  
  return {
    start: monday.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    end: friday.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  };
};

export const weeklyTasks: Task[] = [
  // Jacob's tasks
  {
    id: 101,
    title: 'Review Project Proposals',
    description: 'Analyze and approve new project proposals from clients',
    status: 'in-progress',
    priority: 'high',
    assigneeId: 1,
    dueDate: '2024-01-15',
    weekOf: getCurrentWeekMonday(),
    estimatedHours: 4,
    actualHours: 2,
    tags: ['management', 'review']
  },
  {
    id: 102,
    title: 'Team Performance Meeting',
    description: 'Conduct weekly team performance review meeting',
    status: 'todo',
    priority: 'medium',
    assigneeId: 1,
    dueDate: '2024-01-16',
    weekOf: getCurrentWeekMonday(),
    estimatedHours: 2,
    tags: ['meeting', 'team']
  },
  {
    id: 103,
    title: 'Budget Planning Q1',
    description: 'Plan budget allocation for Q1 projects',
    status: 'completed',
    priority: 'high',
    assigneeId: 1,
    dueDate: '2024-01-14',
    weekOf: getCurrentWeekMonday(),
    estimatedHours: 6,
    actualHours: 5,
    tags: ['planning', 'budget']
  },

  // Sarah's tasks
  {
    id: 201,
    title: 'Mobile App Wireframes',
    description: 'Create wireframes for the new mobile application',
    status: 'in-progress',
    priority: 'high',
    assigneeId: 2,
    dueDate: '2024-01-17',
    weekOf: getCurrentWeekMonday(),
    estimatedHours: 8,
    actualHours: 4,
    tags: ['design', 'wireframes']
  },
  {
    id: 202,
    title: 'User Research Analysis',
    description: 'Analyze user feedback from recent surveys',
    status: 'todo',
    priority: 'medium',
    assigneeId: 2,
    dueDate: '2024-01-18',
    weekOf: getCurrentWeekMonday(),
    estimatedHours: 4,
    tags: ['research', 'analysis']
  },
  {
    id: 203,
    title: 'Design System Updates',
    description: 'Update design system components and documentation',
    status: 'completed',
    priority: 'low',
    assigneeId: 2,
    dueDate: '2024-01-15',
    weekOf: getCurrentWeekMonday(),
    estimatedHours: 3,
    actualHours: 3,
    tags: ['design-system', 'documentation']
  },

  // Mike's tasks
  {
    id: 301,
    title: 'API Integration',
    description: 'Integrate third-party payment API',
    status: 'in-progress',
    priority: 'high',
    assigneeId: 3,
    dueDate: '2024-01-16',
    weekOf: getCurrentWeekMonday(),
    estimatedHours: 12,
    actualHours: 8,
    tags: ['development', 'api']
  },
  {
    id: 302,
    title: 'Database Optimization',
    description: 'Optimize database queries for better performance',
    status: 'todo',
    priority: 'medium',
    assigneeId: 3,
    dueDate: '2024-01-19',
    weekOf: getCurrentWeekMonday(),
    estimatedHours: 6,
    tags: ['database', 'optimization']
  },
  {
    id: 303,
    title: 'Unit Tests Implementation',
    description: 'Write unit tests for new features',
    status: 'completed',
    priority: 'medium',
    assigneeId: 3,
    dueDate: '2024-01-14',
    weekOf: getCurrentWeekMonday(),
    estimatedHours: 4,
    actualHours: 5,
    tags: ['testing', 'quality']
  },

  // Emma's tasks
  {
    id: 401,
    title: 'Social Media Campaign',
    description: 'Launch new product social media campaign',
    status: 'in-progress',
    priority: 'high',
    assigneeId: 4,
    dueDate: '2024-01-17',
    weekOf: getCurrentWeekMonday(),
    estimatedHours: 6,
    actualHours: 3,
    tags: ['marketing', 'social-media']
  },
  {
    id: 402,
    title: 'Content Calendar Planning',
    description: 'Plan content calendar for next month',
    status: 'todo',
    priority: 'medium',
    assigneeId: 4,
    dueDate: '2024-01-18',
    weekOf: getCurrentWeekMonday(),
    estimatedHours: 3,
    tags: ['content', 'planning']
  },
  {
    id: 403,
    title: 'Market Research Report',
    description: 'Complete market research analysis report',
    status: 'completed',
    priority: 'high',
    assigneeId: 4,
    dueDate: '2024-01-15',
    weekOf: getCurrentWeekMonday(),
    estimatedHours: 8,
    actualHours: 7,
    tags: ['research', 'report']
  }
];

export const projects: Project[] = [
  {
    id: 1,
    name: 'Product Design',
    category: 'UI/UX Design',
    progress: 85,
    color: 'bg-blue-500',
    tasks: 12,
    daysLeft: 3,
    team: [1, 2]
  },
  {
    id: 2,
    name: 'Visual Identity',
    category: 'Branding',
    progress: 62,
    color: 'bg-purple-500',
    tasks: 8,
    daysLeft: 5,
    team: [2, 4]
  },
  {
    id: 3,
    name: 'Web Development',
    category: 'Development',
    progress: 92,
    color: 'bg-green-500',
    tasks: 15,
    daysLeft: 2,
    team: [3, 1]
  },
  {
    id: 4,
    name: 'Mobile App Design',
    category: 'UI/UX Design',
    progress: 43,
    color: 'bg-orange-500',
    tasks: 20,
    daysLeft: 8,
    team: [2]
  }
];