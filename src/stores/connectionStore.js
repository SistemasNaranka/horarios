// src/stores/connectionStore.js
import { create } from 'zustand';
import { client } from '../clients/client';

const useConnectionStore = create((set, get) => ({
	isOnline: false,
	isChecking: true,
	wasOffline: false,
	checkConnection: async () => {
		try {
			const prevStatus = get().isOnline;

			const response = await fetch(`${client.url}`);
			if (response.ok) {
				set({
					isOnline: true,
					isChecking: false,
					wasOffline: prevStatus === false,
				});
			} else {
				set({ isOnline: false, isChecking: false, wasOffline });
			}
		} catch (error) {
			set({ isOnline: false, isChecking: false });
		}
	},

	checkConnectionImmediately: async () => {
		await get().checkConnection();
	},
	startConnectionCheck: (interval = 4000) => {
		const intervalId = setInterval(() => {
			get().checkConnection();
		}, interval);
		return () => clearInterval(intervalId);
	},
}));

export default useConnectionStore;
