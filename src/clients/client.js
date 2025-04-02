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
	const { isOnline } = useConnectionStore.getState(); // Obtener el estado de conexión

	if (isOnline) {
		// // Modo online: autenticar en Directus
		// console.log('Intentando autenticar en Directus...');
		try {
			const response = await client.login(data.email, data.password, { mode: 'json' });
			// console.log('Autenticación exitosa en Directus:', response);
			return response;
		} catch (error) {
			// console.error('Error al autenticar en Directus:', error);
			// throw new Error('Error al autenticar en Directus.');
		}
	} else {
		// // Modo offline: autenticar localmente
		// console.log('Intentando autenticar localmente...');
		const user = await db.users.get({ email: data.email });

		// console.log('Usuario encontrado en la base de datos local:', user);

		if (user) {
			// Comparar la contraseña en texto plano con la contraseña cifrada
			const passwordMatch = await bcrypt.compare(data.password, user.password);
			// console.log('¿Coinciden las contraseñas?', passwordMatch);

			if (passwordMatch) {
				// console.log('Autenticación local exitosa:', user);

				// Guardar el estado de autenticación local en localStorage
				localStorage.setItem('localAuth', JSON.stringify({ email: user.email, role: user.role }));

				return { localStorage };
			}
			// console.error('Contraseña incorrecta.');
			// throw new Error('Credenciales incorrectas.');
		}
		// console.error('Usuario no encontrado en la base de datos local.');
		// throw new Error('Usuario no registrado localmente.');
	}
};
