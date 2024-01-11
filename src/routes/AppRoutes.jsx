import { Route, Routes } from 'react-router-dom';
import PrivateRoutes from '../components/utils/PrivateRoutes';
import { HOME_PATH } from '../utils/path';

const NotMatch = lazy(() => import('../pages/NotMatch'));
const SignIn = lazy(() => import('../pages/SignIn'));
const Structure = lazy(() => import('../components/utils/Structure'));

function AppRoutes() {
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
