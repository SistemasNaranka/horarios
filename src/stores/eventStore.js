import { create } from 'zustand';

export const eventStore = create(set => ({
	events: new Map(),
	eventsList: [],
	setEvents: events =>
		set(() => ({ events: new Map(events.map(i => [i.id, i])), eventsList: events })),
}));
