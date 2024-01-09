import { createDirectus, rest, authentication, readItems, readMe } from '@directus/sdk';
import { HOST_ENV } from '../utils/env';
import { memoryStorage } from '../utils/storage';

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

/**
 * Return employees in the store
 * @returns
 */
export const getEmployees = async () =>
	await client.request(
		readItems('empleados', {
			fields: ['nombre', 'id'],
			sort: 'nombre',
		}),
	);

/**
 * Return employees in one store
 * @returns
 */
export const getEmployeesLocation = async location =>
	await client.request(
		readItems('empleados', {
			fields: ['nombre', 'id'],
			sort: 'nombre',
			filter: {
				tienda: {
					_eq: location,
				},
			},
		}),
	);

/**
 * Return all locations
 * @returns
 */
export const getLocations = async () =>
	await client.request(readItems('lugares', { fields: ['id'] }));
