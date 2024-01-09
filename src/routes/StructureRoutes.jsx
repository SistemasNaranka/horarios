import { lazy, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { roleStore } from '../stores/roleStore';
import { employeesLocationQuery } from '../clients/aux.client';
import { useQueries } from '@tanstack/react-query';
import Loading from '../components/utils/Loading';
import { employeeStore } from '../stores/employeeStore';
import { HISTORY_RELATIVE, NEWS_RELATIVE } from '../utils/path';

const NotMatch = lazy(() => import('../pages/NotMatch'));
const Home = lazy(() => import('../pages/Home'));
const News = lazy(() => import('../pages/News'));
const History = lazy(() => import('../pages/History'));

function StructureRoutes() {
	const location = roleStore(state => state.location);
	const setEmployees = employeeStore(state => state.setEmployees);
	const queryResults = useQueries({
		queries: [employeesLocationQuery(location)],
	});

	useEffect(() => {
		if (queryResults) {
			setEmployees(queryResults[0].data);
		}
	}, [queryResults, setEmployees]);

	const isLoading = queryResults.some(query => query.isLoading || query.isRefetching);

	if (isLoading) return <Loading />;

	return (
		<Routes>
			<Route index element={<Home />} />
			<Route path={NEWS_RELATIVE} element={<News />} />
			<Route path={HISTORY_RELATIVE} element={<History />} />
			<Route path='*' element={<NotMatch />} />
		</Routes>
	);
}
export default StructureRoutes;
