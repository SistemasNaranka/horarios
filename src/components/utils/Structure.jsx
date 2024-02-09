import { useQueries } from '@tanstack/react-query';
import { lazy, useEffect } from 'react';
import { eventsQuery, roleQuery, shiftQuery } from '../../clients/aux.client';
import { shiftStore } from '../../stores/shiftStore';
import { roleStore } from '../../stores/roleStore';
import Loading from './Loading';
import Header from './Header';
import { eventStore } from '../../stores/eventStore';

const StructureRoutesCom = lazy(() => import('../../routes/StructureRoutesCom'));
const StructureRoutes = lazy(() => import('../../routes/StructureRoutes'));

function Structure() {
	const queryResults = useQueries({
		queries: [roleQuery(), eventsQuery() /**shiftQuery()*/],
	});

	const setRole = roleStore(state => state.setRole);
	const setEvents = eventStore(state => state.setEvents);
	//const setShifts = shiftStore(state => state.setShifts);

	const refetch = () => queryResults.map(query => query.refetch());

	const isLoading = queryResults.some(query => query.isPending || query.isRefetching);

	useEffect(() => {
		if (queryResults[0].data) {
			setRole(queryResults[0].data);
		}
		if (queryResults[1].data) {
			setEvents(queryResults[1].data);
		}
		//if (queryResults[1].data) {
		//	setShifts(queryResults[1].data);
		//}
	}, [queryResults, setRole, setEvents /**,setShifts*/]);

	if (isLoading) return <Loading />;

	return (
		<>
			<Header refetch={refetch} />
			{queryResults[0].data.role.name === 'almacenes' ? (
				<StructureRoutes location={queryResults[0].data.ubicacion} />
			) : (
				<StructureRoutesCom location={queryResults[0].data.ubicacion} />
			)}
		</>
	);
}
export default Structure;
