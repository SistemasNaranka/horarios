import { useNavigate } from 'react-router-dom';
import { useLayoutEffect, useState } from 'react';
import { client } from '../../clients/client';

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
		client.getToken().then(res => (res ? setComponent(children) : navigate('/')));
	}, [children, navigate]);

	return <>{component}</>;
};

export default PrivateRoutes;
