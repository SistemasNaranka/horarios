import { useNavigate } from 'react-router-dom';
import { useLayoutEffect, useState } from 'react';
import { client } from '../../clients/client';
import db from '../../utils/localDB'; // Importar la base de datos local

/**
 *
 * @param {Object} props
 * @param {ReactNode} props.children
 * @returns
 */
const PrivateRoutes = ({ children }) => {
	const navigate = useNavigate();
	const [component, setComponent] = useState(null);

	useLayoutEffect(() => {
		const checkAuth = async () => {
			// Verificar si hay un token de autenticación en Directus
			const token = await client.getToken();

			if (token) {
				// Si hay token, el usuario está autenticado en Directus
				setComponent(children);
			} else {
				// Si no hay token, verificar la autenticación local
				const localAuth = localStorage.getItem('localAuth');
				if (localAuth) {
					const { email, role } = JSON.parse(localAuth);

					// Verificar si el usuario existe en la base de datos local
					const user = await db.users.get({ email });

					if (user) {
						// Si el usuario existe, permitir el acceso
						setComponent(children);
					} else {
						// Si el usuario no existe, redirigir al inicio de sesión
						navigate('/');
					}
				} else {
					// Si no hay autenticación local, redirigir al inicio de sesión
					navigate('/');
				}
			}
		};

		checkAuth();
	}, [children, navigate]);

	return <>{component}</>;
};

export default PrivateRoutes;
