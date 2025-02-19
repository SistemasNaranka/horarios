import { useQueries } from '@tanstack/react-query';
import { lazy, useEffect, useMemo } from 'react';
import { eventsQuery, roleQuery, shiftQuery } from '../../clients/aux.client';
import { eventStore } from '../../stores/eventStore';
import { shiftStore } from '../../stores/shiftStore';
import { roleStore } from '../../stores/roleStore';
import Loading from './Loading';
import Header from './Header';

const StructureRoutesCom = lazy(() => import('../../routes/StructureRoutesCom'));
const StructureRoutes = lazy(() => import('../../routes/StructureRoutes'));

function Structure() {
	const queryResults = useQueries({
		queries: [roleQuery(), eventsQuery(), shiftQuery()],
	});

	const setRole = roleStore(state => state.setRole);
	const setEvents = eventStore(state => state.setEvents);
	const setShifts = shiftStore(state => state.setShifts);

	const refetch = () => queryResults.map(query => query.refetch());

	const isLoading = queryResults.some(query => query.isPending || query.isRefetching);

	const roleData = queryResults[0].data;
	const shiftsData = queryResults[2].data;

	const filteredShifts = useMemo(() => {
		if (!roleData || !shiftsData) return [];

		const ubicacionUsuario = Number(roleData.ubicacion);

		if (roleData.role.name === 'almacenes' || roleData.role.name === 'test') {
			return shiftsData.filter(shift => {
				return Number(shift.ubicacion.id) === ubicacionUsuario;
			});
		}

		return shiftsData;
	}, [roleData, shiftsData]);

	useEffect(() => {
		if (roleData) {
			setRole(roleData);
		}
		if (queryResults[1].data) {
			setEvents(queryResults[1].data);
		}

		if (roleData && (roleData.role.name === 'almacenes' || roleData.role.name === 'test')) {
			setShifts(filteredShifts);
		} else if (shiftsData) {
			setShifts(shiftsData);
		}
	}, [roleData, queryResults, setRole, setEvents, setShifts, shiftsData, filteredShifts]);

	if (isLoading) return <Loading />;

	return (
		<>
			<Header refetch={refetch} />
			{roleData.role.name === 'almacenes' || roleData.role.name === 'test' ? (
				<StructureRoutes location={roleData.ubicacion} />
			) : (
				<StructureRoutesCom location={roleData.ubicacion} />
			)}
		</>
	);
}
export default Structure;
