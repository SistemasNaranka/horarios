import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const Home = lazy(() => import('../pages/Home'));

function StructureRoutes() {
	return (
		<Routes>
			<Route index element={<Home />} />
		</Routes>
	);
}
export default StructureRoutes;
