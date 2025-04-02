// src/routes/AppRoutes.jsx
import { Route, Routes } from 'react-router-dom';
import PrivateRoutes from '../components/utils/PrivateRoutes';
import { HOME_PATH } from '../utils/path';
import { useEffect } from 'react';
import { syncCriticalData, syncNonCriticalData, syncUsers } from '../clients/syncData';
import useConnectionStore from '../stores/connectionStore';
import { lazy } from 'react';
const NotMatch = lazy(() => import('../pages/NotMatch'));
const SignIn = lazy(() => import('../pages/SignIn'));
const Structure = lazy(() => import('../components/utils/Structure'));

function AppRoutes() {
	const { startConnectionCheck, checkConnectionImmediately, isOnline } = useConnectionStore();

	useEffect(() => {
		const initializeApp = async () => {
			try {
				if (isOnline) {
					await syncCriticalData(); // Sincronizar registros pendientes primero
				}
			} catch (error) {
				console.error('Error en sincronizacion critica:', error);
			}
		};

		initializeApp();
	}, [isOnline]);

	// Comienza a verificar la conexión de forma periódica
	useEffect(() => {
		const stopConnectionCheck = startConnectionCheck(); // Verificar la conexión periódicamente.

		// Al principio, realizamos una verificación inmediata de la conexión al montar la app
		checkConnectionImmediately(); // Verificación inicial.

		// Detener la verificación cuando la aplicación se desmonta
		return () => stopConnectionCheck();
	}, [startConnectionCheck, checkConnectionImmediately]);

	// Sincronización periódica cada 60 segundos (otros datos)
	useEffect(() => {
		const intervalId = setInterval(async () => {
			try {
				if (isOnline) {
					await syncNonCriticalData(); // Sincronizar otros datos en segundo plano
					await syncUsers();
				}
			} catch (error) {
				console.error('Error durante la sincronización periódica:', error);
			}
		}, 40000); // 40 segundos

		return () => clearInterval(intervalId);
	}, [isOnline]);

	return (
		<Routes>
			<Route index element={<SignIn />} />
			<Route
				path={`${HOME_PATH}/*`}
				element={
					<PrivateRoutes>
						<Structure />
					</PrivateRoutes>
				}
			/>
			<Route path='*' element={<NotMatch />} />
		</Routes>
	);
}

export default AppRoutes;
