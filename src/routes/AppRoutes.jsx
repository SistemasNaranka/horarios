import { Route, Routes } from 'react-router-dom';
import PrivateRoutes from '../components/utils/PrivateRoutes';
import NotMatch from '../pages/NotMatch';
import SignIn from '../pages/SignIn';
import { HOME_PATH } from '../utils/path';
import Structure from '../components/utils/Structure';

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
