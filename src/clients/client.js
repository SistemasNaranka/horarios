// src/clients/client.js
import { createDirectus, rest, authentication } from '@directus/sdk';
import { memoryStorage } from '../utils/storage';
import { HOST_ENV } from '../utils/env';
import db from '../utils/localDB';
import suspendAlert from '../components/alerts/SuspendAlert';
import SignInAlert from '../components/alerts/SignInAlert';
import bcrypt from 'bcryptjs';
import UserErroralert from '../components/alerts/UserErrorAlert';
import useConnectionStore from '../stores/connectionStore';

// Funcion para definir el cliente de directus y la autenticacion guardada en memoria 
export const client = createDirectus(HOST_ENV)
	.with(rest())
	.with(authentication('json', { storage: memoryStorage() }));

/**
 * Funcion para inicicar sesion en la aplicacion, si el usuario tiene conexion a internet se hace la autenticacion con la base de datos principal en caso de 
 * no tener conexion se hace la autenticacion con la base de datos local 
 * @Error - En caso de que el usuario no exista en la base de datos local o la contraseña no coincida se lanza un error
 * @param {Object} data - Objeto que contiene el email y la contraseña del usuario
 * @returns {Object} - Objeto que contiene el email del usuario 
*/
export const signIn = async data => {
	const { isOnline } = useConnectionStore.getState();

	try {
		if (isOnline) {
			try {
				const response = await client.login(data.email, data.password, { mode: 'json' });
				return response;
			} catch (error) {
				if (error.errors?.[0]?.extensions?.code === 'USER_SUSPENDED') {
					suspendAlert();
					return;
				}
				SignInAlert();
			}
		} else {
			const user = await db.users.get({ email: data.email });

			if (!user) {
				UserErroralert();
				return;
			}

			const passwordMatch = await bcrypt.compare(data.password, user.password);
			if (!passwordMatch) {
				SignInAlert();
				return;
			}

			localStorage.setItem('localAuth', JSON.stringify({ email: user.email }));
			return { email: user.email };
		}
	} catch (error) {
		console.error('Error.....', error);
		throw error;
	}
};
