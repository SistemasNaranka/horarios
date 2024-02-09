import { create } from 'zustand';

export const shopStore = create(set => ({
	shops: new Map(),
	shopsList: [],
	setShops: shops => set(() => ({ shops: new Map(shops.map(i => [i.id, i])), shopsList: shops })),
}));
