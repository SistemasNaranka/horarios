import { useQueries } from '@tanstack/react-query';
import { roleQuery, shiftQuery } from '../../clients/aux.client';
import Loading from './Loading';
import { useEffect } from 'react';
import { roleStore } from '../../stores/roleStore';
import { shiftStore } from '../../stores/shiftStore';
import StructureRoutes from '../../routes/StructureRoutes';
import Header from './Header';

function Structure() {
	const queryResults = useQueries({
		queries: [roleQuery(), shiftQuery()],
	});

	const setRole = roleStore(state => state.setRole);
	const setShifts = shiftStore(state => state.setShifts);

	const isLoading = queryResults.some(query => query.isLoading || query.isRefetching);

	useEffect(() => {
		if (queryResults[0].data) {
			setRole(queryResults[0].data);
		}
		if (queryResults[1].data) {
			setShifts(queryResults[1].data);
		}
	}, [queryResults, setRole, setShifts]);

	if (isLoading) return <Loading />;

	return (
		<>
			<Header />
			<StructureRoutes />
		</>
	);
}
export default Structure;
