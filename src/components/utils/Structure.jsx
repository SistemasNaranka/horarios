import { useQueries } from '@tanstack/react-query';
import { useEffect } from 'react';
import { roleQuery, shiftQuery } from '../../clients/aux.client';
import StructureRoutes from '../../routes/StructureRoutes';
import { shiftStore } from '../../stores/shiftStore';
import { roleStore } from '../../stores/roleStore';
import Loading from './Loading';
import Header from './Header';

function Structure() {
	const queryResults = useQueries({
		queries: [roleQuery() /**shiftQuery()*/],
	});

	const setRole = roleStore(state => state.setRole);
	//const setShifts = shiftStore(state => state.setShifts);

	const refetch = () => queryResults.map(query => query.refetch());

	const isLoading = queryResults.some(query => query.isPending || query.isRefetching);

	useEffect(() => {
		if (queryResults[0].data) {
			setRole(queryResults[0].data);
		}
		//if (queryResults[1].data) {
		//	setShifts(queryResults[1].data);
		//}
	}, [queryResults, setRole /**,setShifts*/]);

	if (isLoading) return <Loading />;

	return (
		<>
			<Header refetch={refetch} />
			<StructureRoutes />
		</>
	);
}
export default Structure;
