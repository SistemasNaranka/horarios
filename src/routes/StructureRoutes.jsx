import { useQueries } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';
import { lazy, useEffect } from 'react';
import { HISTORY_RELATIVE, NEWS_RELATIVE } from '../utils/path';
import { employeesLocationQuery } from '../clients/aux.client';
import { employeeStore } from '../stores/employeeStore';
import Loading from '../components/utils/Loading';
import { roleStore } from '../stores/roleStore';

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
