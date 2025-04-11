import { useNavigate } from 'react-router-dom';
import { useLayoutEffect, useState } from 'react';
import { client } from '../../clients/client';
import db from '../../utils/localDB';

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
			const token = await client.getToken();

			if (token) {
				setComponent(children);
			} else {
				const localAuth = localStorage.getItem('localAuth');
				if (localAuth) {
					const { email, role } = JSON.parse(localAuth);

					const user = await db.users.get({ email });

					if (user) {
						setComponent(children);
					} else {
						navigate('/');
					}
				} else {
					navigate('/');
				}
			}
		};

		checkAuth();
	}, [children, navigate]);

	return <>{component}</>;
};

export default PrivateRoutes;
