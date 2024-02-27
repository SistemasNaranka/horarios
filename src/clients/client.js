import { createDirectus, rest, authentication, readItems, readMe } from '@directus/sdk';
import { memoryStorage } from '../utils/storage';
import { HOST_ENV } from '../utils/env';

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
	return await client.login(data.email, data.password, { mode: 'json' });
};
