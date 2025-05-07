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
					await syncCriticalData();
				}
			} catch (error) {
				console.error('Error en sincronizacion critica:', error);
			}
		};

		initializeApp();
	}, [isOnline]);

	useEffect(() => {
		const stopConnectionCheck = startConnectionCheck();
		checkConnectionImmediately();

		return () => stopConnectionCheck();
	}, [startConnectionCheck, checkConnectionImmediately]);

	useEffect(() => {
		const intervalId = setInterval(async () => {
			try {
				if (isOnline) {
					await syncNonCriticalData();
					await syncUsers();
				}
			} catch (error) {
				console.error('Error durante la sincronización periódica:', error);
			}
		}, 40000);

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
