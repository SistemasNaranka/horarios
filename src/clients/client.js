// src/clients/client.js
import { createDirectus, rest, authentication } from '@directus/sdk';
import { memoryStorage } from '../utils/storage';
import { HOST_ENV } from '../utils/env';
import db from '../utils/localDB';
import bcrypt from 'bcryptjs';
import useConnectionStore from '../stores/connectionStore';

// Client with REST support and authetication, using local storage for json
export const client = createDirectus(HOST_ENV)
	.with(rest())
	.with(authentication('json', { storage: memoryStorage() }));

/**
 * Sign In
 * @param data The email and password of user
 * @returns Authentication Data
 */
export const signIn = async data => {
	const { isOnline } = useConnectionStore.getState();

	if (isOnline) {
		try {
			const response = await client.login(data.email, data.password, { mode: 'json' });
			return response;
		} catch (error) {}
	} else {
		const user = await db.users.get({ email: data.email });

		if (user) {
			const passwordMatch = await bcrypt.compare(data.password, user.password);

			if (passwordMatch) {
				localStorage.setItem('localAuth', JSON.stringify({ email: user.email, role: user.role }));

				return { localStorage };
			}
		}
	}
};
