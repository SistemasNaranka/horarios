import { useQueries } from '@tanstack/react-query';
import { lazy, useEffect, useMemo } from 'react';
import { eventsQuery, roleQuery, shiftQuery } from '../../clients/aux_client';
import { eventStore } from '../../stores/eventStore';
import { shiftStore } from '../../stores/shiftStore';
import { roleStore } from '../../stores/roleStore';
import Loading from './Loading';
import InvalidRole from '../../pages/InvalidRole'; // asegúrate de que el path es correcto
import Header from './Header';
import useConnectionStore from '../../stores/connectionStore';

const StructureRoutesCom = lazy(() => import('../../routes/StructureRoutesCom'));
const StructureRoutes = lazy(() => import('../../routes/StructureRoutes'));

function Structure() {
	const { isOnline } = useConnectionStore();

	const queries = [roleQuery(), eventsQuery()];
	if (isOnline) {
		queries.push(shiftQuery());
	}

	const queryResults = useQueries({
		queries,
	});

	const setRole = roleStore(state => state.setRole);
	const setEvents = eventStore(state => state.setEvents);
	const setShifts = shiftStore(state => state.setShifts);

	const refetch = () => queryResults.map(query => query.refetch());

	const isLoading = queryResults.some(query => query.isPending || query.isRefetching);

	const roleData = queryResults[0].data;
	const eventsData = queryResults[1].data;
	const shiftsData = isOnline ? queryResults[2]?.data : [];
	const filteredShifts = useMemo(() => {
		if (!roleData || !shiftsData) return [];

		const ubicacionUsuario = Number(roleData.ubicacion);

		if (roleData.role.name === 'almacenes' || roleData.role.name === 'test') {
			return shiftsData.filter(shift => Number(shift.ubicacion.id) === ubicacionUsuario);
		}

		return shiftsData;
	}, [roleData, shiftsData]);

	useEffect(() => {
		if (roleData) {
			setRole(roleData);
		}
		if (eventsData) {
			setEvents(eventsData);
		}

		if (
			isOnline &&
			roleData &&
			(roleData.role.name === 'almacenes' || roleData.role.name === 'test')
		) {
			setShifts(filteredShifts);
		} else if (isOnline && shiftsData) {
			setShifts(shiftsData);
		}
	}, [roleData, eventsData, shiftsData, setRole, setEvents, setShifts, isOnline, filteredShifts]);

	if (isLoading) return <Loading />;

	
	const ValidRoles = ['almacenes', 'test', 'comercial'];
	if (roleData && !ValidRoles.includes(roleData.role.name)) {
		return <InvalidRole />;
	}

	return (
		<>
			<Header refetch={refetch} />
			{roleData.role.name === 'comercial' ? (
				<StructureRoutesCom location={roleData.ubicacion} />
			) : (
				<StructureRoutes location={roleData.ubicacion} />
			)}
		</>
	);
}

export default Structure;
