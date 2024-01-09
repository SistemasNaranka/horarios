import { create } from 'zustand';

export const roleStore = create(set => ({
	role: null,
	location: null,
	setRole: data => set(() => ({ role: data.role.name, location: data.ubicacion })),
}));
