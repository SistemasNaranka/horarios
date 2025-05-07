// src/components/ConnectionManager.jsx
import { useEffect, useRef } from 'react';
import useConnectionStore from '../../stores/connectionStore';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '../../utils/queryClient';
import toast from 'react-hot-toast';
const ConnectionListener = () => {
	const { isOnline, isChecking } = useConnectionStore();
	const navigate = useNavigate();
	const hasHandled = useRef(false);

	useEffect(() => {
		if (isChecking) return;

		const token = localStorage.getItem('storage');
		const localAuth = localStorage.getItem('localAuth');

		if (hasHandled.current) return;
		hasHandled.current = true;

		// 1. ONLINE + sin token pero con localAuth → cerrar sesión
		if (isOnline && !token && localAuth) {
			// toast.error('Conexión restablecida. Inicie sesión nuevamente.');
			localStorage.removeItem('localAuth');
			navigate('/');
			return;
		}

		// 2. OFFLINE + con token pero sin localAuth → cerrar sesión
		if (!isOnline && token && !localAuth) {
			// toast.error('Conexión perdida. Cerrando sesión por seguridad.');
			localStorage.removeItem('storage');
			navigate('/');
			return;
		}

		if (isOnline && token) {
			queryClient.invalidateQueries();
		}

		const reset = setTimeout(() => {
			hasHandled.current = false;
		}, 3000);

		return () => clearTimeout(reset);
	}, [isOnline, isChecking, navigate]);

	return null;
};

export default ConnectionListener;
