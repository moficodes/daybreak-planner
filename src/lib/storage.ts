/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority: Priority;
  dueDate?: number;
}

const STORAGE_KEY = 'daybreak_tasks';
const LAST_RESET_KEY = 'daybreak_last_reset';

export const getStoredTasks = (): Task[] => {
  const lastReset = localStorage.getItem(LAST_RESET_KEY);
  const now = new Date();
  const todayStr = now.toDateString();

  if (lastReset !== todayStr) {
    // It's a new day! Clear tasks.
    localStorage.setItem(LAST_RESET_KEY, todayStr);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};
