import { create } from 'zustand';

export const employeeStore = create(set => ({
	employees: [],
	setEmployees: employees => set(() => ({ employees })),
}));
