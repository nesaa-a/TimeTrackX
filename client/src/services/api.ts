import axios from 'axios';
import { User, TimeEntry, Project, ProjectTask } from '../types';

// 1) ZGJIDH BASE URL TË SAKTË (8080) + mbështet .env për Vite/CRA
const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL ||
  (process.env as any)?.REACT_APP_API_URL ||
  'http://localhost:8080';

// 2) KRIJO axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  // nëse backend-i përdor cookies/session, shto: withCredentials: true,
});

// 3) TOKEN interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 4) (Opsionale) log & error details për debugging më të qartë
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      'Request failed';
    return Promise.reject(new Error(msg));
  }
);

// ---------------------- AUTH ----------------------

export interface LoginRequest {
  username: string;
  password: string;
}
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}
export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  userId: number;
}

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  // server/index.js -> app.use('/api/auth', authRoutes)
  const res = await api.post<AuthResponse>('/api/auth/login', data);
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('user', JSON.stringify(res.data));
  return res.data;
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/api/auth/register', data);
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('user', JSON.stringify(res.data));
  return res.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ---------------------- USERS (protected) ----------------------

export const getUsers = async (): Promise<User[]> => {
  const res = await api.get<User[]>('/users');
  return res.data;
};

export const getUser = async (id: number): Promise<User> => {
  const res = await api.get<User>(`/users/${id}`);
  return res.data;
};

export const createUser = async (user: Partial<User>): Promise<User> => {
  const res = await api.post<User>('/users', user);
  return res.data;
};

export const updateUser = async (id: number, user: Partial<User>): Promise<void> => {
  await api.put<void>(`/users/${id}`, user);
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete<void>(`/users/${id}`);
};

// ---------------------- TIME ENTRIES ----------------------

export const getTimeEntries = async (): Promise<TimeEntry[]> => {
  const res = await api.get<TimeEntry[]>('/timeentries');
  return res.data;
};

export const getUserTimeEntries = async (userId: number): Promise<TimeEntry[]> => {
  const res = await api.get<TimeEntry[]>(`/timeentries/user/${userId}`);
  return res.data;
};

export const createTimeEntry = async (entry: Partial<TimeEntry>): Promise<TimeEntry> => {
  const res = await api.post<TimeEntry>('/timeentries', entry);
  return res.data;
};

export const stopTimeEntry = async (id: number): Promise<void> => {
  await api.put<void>(`/timeentries/${id}/stop`);
};

export const updateTimeEntry = async (id: number, entry: Partial<TimeEntry>): Promise<void> => {
  await api.put<void>(`/timeentries/${id}`, entry);
};

export const deleteTimeEntry = async (id: number): Promise<void> => {
  await api.delete<void>(`/timeentries/${id}`);
};

// ---------------------- PROJECTS ----------------------

export const getProjects = async (): Promise<Project[]> => {
  const res = await api.get<Project[]>('/projects');
  return res.data;
};

export const getUserProjects = async (userId: number): Promise<Project[]> => {
  const res = await api.get<Project[]>(`/projects/user/${userId}`);
  return res.data;
};

export const getProject = async (id: number): Promise<Project> => {
  const res = await api.get<Project>(`/projects/${id}`);
  return res.data;
};

export const createProject = async (project: Partial<Project>): Promise<Project> => {
  const res = await api.post<Project>('/projects', project);
  return res.data;
};

export const updateProject = async (id: number, project: Partial<Project>): Promise<void> => {
  await api.put<void>(`/projects/${id}`, project);
};

// ⚠️ Më mirë dërgo objekt, jo array “lakuriq” – varet si e ke backend-in
export const assignUsersToProject = async (projectId: number, userIds: number[]): Promise<void> => {
  await api.post<void>(`/projects/${projectId}/users`, { userIds });
};

export const deleteProject = async (id: number): Promise<void> => {
  await api.delete<void>(`/projects/${id}`);
};

// ---------------------- TASKS ----------------------

export const getTasks = async (): Promise<ProjectTask[]> => {
  const res = await api.get<ProjectTask[]>('/tasks');
  return res.data;
};

export const getProjectTasks = async (projectId: number): Promise<ProjectTask[]> => {
  const res = await api.get<ProjectTask[]>(`/tasks/project/${projectId}`);
  return res.data;
};

export const getUserTasks = async (userId: number): Promise<ProjectTask[]> => {
  const res = await api.get<ProjectTask[]>(`/tasks/user/${userId}`);
  return res.data;
};

export const createTask = async (task: Partial<ProjectTask>): Promise<ProjectTask> => {
  const res = await api.post<ProjectTask>('/tasks', task);
  return res.data;
};

export const updateTask = async (id: number, task: Partial<ProjectTask>): Promise<void> => {
  await api.put<void>(`/tasks/${id}`, task);
};

// ⚠️ dërgo JSON objekt { status }, jo string të serializuar
export const updateTaskStatus = async (id: number, status: string): Promise<void> => {
  await api.put<void>(`/tasks/${id}/status`, { status });
};

// ⚠️ dërgo JSON objekt { userId }, jo numër “lakuriq”
export const assignTask = async (id: number, userId: number | null): Promise<void> => {
  await api.put<void>(`/tasks/${id}/assign`, { userId });
};

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete<void>(`/tasks/${id}`);
};

// ---------------------- STATISTICS ----------------------

export interface StatisticsResponse {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  tasksByStatus: { [key: string]: number };
  averageTimePerProject: { [key: string]: number };
  topUsersByHours: Array<{
    username: string;
    totalHours: number;
    completedTasks: number;
  }>;
  shiftDistribution: { [key: string]: number };
}

export const getStatistics = async (): Promise<StatisticsResponse> => {
  const res = await api.get<StatisticsResponse>('/statistics');
  return res.data;
};
