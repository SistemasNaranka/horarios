import { create } from 'zustand';

export const employeeStore = create(set => ({
	employees: null,
	setEmployees: employees => set(() => ({ employees })),
}));
