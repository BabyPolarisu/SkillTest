export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  categoryId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  taggedUserIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: (User & { password?: string })[];
  categories: Category[];
  tasks: Task[];
}
