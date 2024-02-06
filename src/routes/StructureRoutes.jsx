import { useQueries } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';
import { lazy, useEffect } from 'react';
import { HISTORY_RELATIVE, MESH_RELATIVE, NEWS_RELATIVE } from '../utils/path';
import { employeesLocationQuery } from '../clients/aux.client';
import { employeeStore } from '../stores/employeeStore';
import Loading from '../components/utils/Loading';

const NotMatch = lazy(() => import('../pages/NotMatch'));
const Home = lazy(() => import('../pages/Home'));
const News = lazy(() => import('../pages/News'));
const History = lazy(() => import('../pages/History'));
const Mesh = lazy(() => import('../pages/Mesh'));

/**
 *
 * @param {Object} props
 * @param {String} props.location
 * @param {String} props.role
 * @returns
 */
function StructureRoutes({ location, role }) {
	const setEmployees = employeeStore(state => state.setEmployees);
	const queryResults = useQueries({
		queries: [employeesLocationQuery(location)],
	});

	useEffect(() => {
		if (queryResults) {
			setEmployees(queryResults[0].data);
		}
	}, [queryResults, setEmployees]);

	const isLoading = queryResults.some(query => query.isRefetching || query.isPending);

	if (isLoading) return <Loading />;

	return (
		<Routes>
			<Route index element={<Home />} />
			<Route path={NEWS_RELATIVE} element={<News />} />
			<Route path={HISTORY_RELATIVE} element={<History />} />
			<Route path={MESH_RELATIVE} element={<Mesh />} />
			<Route path='*' element={<NotMatch />} />
		</Routes>
	);
}
export default StructureRoutes;
