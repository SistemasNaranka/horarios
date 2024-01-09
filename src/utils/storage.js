/**
 * Create a local storage for auth
 */
export const memoryStorage = () => {
	const localValue = localStorage.getItem('storage');
	let store = localValue ? JSON.parse(localValue) : null;

	return {
		get: async () => store,
		set: async value => {
			store = value;
			localStorage.setItem('storage', JSON.stringify(value));
		},
	};
};
