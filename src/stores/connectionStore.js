// src/stores/connectionStore.js
import { create } from 'zustand';
import { client } from '../clients/client';

const useConnectionStore = create((set, get) => ({
	isOnline: false,
	isChecking: true,
	wasOffline: false, // Nuevo estado para rastrear cambios

	checkConnection: async () => {
		try {
			const prevStatus = get().isOnline; // Guardamos el estado anterior

			const response = await fetch(`${client.url}`);
			if (response.ok) {
				set({
					isOnline: true,
					isChecking: false,
					wasOffline: prevStatus === false, // Solo true si antes estaba offline
				});
				// console.log('\x1b[32m%s\x1b[0m', 'Conexión con el directus: online');
			} else {
				set({ isOnline: false, isChecking: false, wasOffline: prevStatus === true });
				// console.log('\x1b[31m%s\x1b[0m', 'Conexión con el directus: offline');
			}
		} catch (error) {
			set({ isOnline: false, isChecking: false });
			// console.log('\x1b[31m%s\x1b[0m', 'Error grave con:', client.url);
		}
	},

	// TUS MÉTODOS EXISTENTES (sin cambios)
	checkConnectionImmediately: async () => {
		await get().checkConnection();
	},
	simulateConnection: status => {
		const prev = get().isOnline;
		set({
			isOnline: status,
			wasOffline: prev && !status, // Simula cambio de estado
		});
		// console.log(`[SIMULACIÓN] Conexión: ${status ? 'ONLINE' : 'OFFLINE'}`);
	},
	startConnectionCheck: (interval = 4000) => {
		const intervalId = setInterval(() => {
			get().checkConnection();
		}, interval);
		return () => clearInterval(intervalId);
	},
}));

export default useConnectionStore;
