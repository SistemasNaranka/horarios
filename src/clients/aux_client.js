import { createItem, readItems, readMe } from '@directus/sdk';
import { client } from './client';
import db from '../utils/localDB';
import useConnectionStore from '../stores/connectionStore';

/**
 *Return role of actual user and loations
 * @returns
 */
export const roleQuery = () => ({
	queryKey: ['role'],
	queryFn: async () => {
		try {
			const onlineResponse = await client.request(
				readMe({
					fields: [{ role: ['name', 'id'] }, 'ubicacion'],
				}),
			);

			if (onlineResponse?.role) {
				return {
					role: {
						name: onlineResponse.role.name,
						id: onlineResponse.role.id,
					},
					ubicacion: onlineResponse.ubicacion,
				};
			}
		} catch (error) {}

		const localAuth = JSON.parse(localStorage.getItem('localAuth'));
		if (!localAuth) throw new Error('No hay autenticación local');

		const user = await db.users.get({ email: localAuth.email });
		if (!user) throw new Error('Usuario no encontrado localmente');

		return {
			role: {
				name: user.role.name,
			},
			ubicacion: user.ubicacion,
		};
	},
});
/**
 * Fetch active shifts from the 'turnos' table.
 * @returns {Array} - An array of IDs for active shifts.
 */
const getActiveShifts = async () => {
	const activeShifts = await client.request(
		readItems('turnos', {
			fields: ['id'],
			filter: {
				activo: {
					_eq: true,
				},
			},
		}),
	);

	return activeShifts.map(shift => shift.id);
};

/**
 * Fetch shifts and their associated locations, filtered by active shifts.
 * @returns {Array} - An array of shifts with their locations and details.
 */
export const shiftQuery = () => ({
	queryKey: ['shifts'],
	queryFn: async () => {
		const { isOnline } = useConnectionStore.getState();
		if (isOnline) {
			const activeShiftIds = await getActiveShifts();

			return await client.request(
				readItems('turnos_ubicaciones', {
					fields: [
						'id',
						{ ubicacion: ['id', 'nombre', 'zona'] },
						{
							turno: [
								'id',
								'inicio_turno',
								'final_turno',
								'tiempo_laborado',
								'tiempo_almuerzo',
								'activo',
							],
						},
					],
					filter: {
						turno: {
							_in: activeShiftIds,
						},
					},
				}),
			);
		}

		return [];
	},
	refetchOnWindowFocus: false,
});

/**
 * Return employees in one store
 * @returns
 */

export const employeesLocationQuery = location => ({
	queryKey: ['employees', location],
	queryFn: async () => {
		const { isOnline } = useConnectionStore.getState();

		if (isOnline) {
			return await client.request(
				readItems('empleados', {
					fields: ['id', 'nombre', 'tienda', 'estado'],
					sort: 'nombre',
					filter: {
						tienda: {
							_eq: location,
						},
						estado: {
							_eq: 'Activo',
						},
					},
				}),
			);
		}

		const empleados = await db.empleados
			.where('tienda')
			.equals(location)
			.and(empleado => empleado.estado === 'Activo')
			.toArray();

		return empleados;
	},
	refetchOnWindowFocus: false,
	enabled: !!location,
});

/**
 * Get the events
 * @returns
 */
export const eventsQuery = () => ({
	queryKey: ['events'],
	queryFn: async () => {
		const { isOnline } = useConnectionStore.getState();
		if (isOnline) {
			return await client.request(
				readItems('eventos', { fields: ['nombre', 'id'], sort: 'nombre' }),
			);
		}

		return await db.eventos.toArray();
	},
});
export const shopsQuery = () => ({
	queryKey: ['tiendas'],
	queryFn: async () =>
		await client.request(readItems('ubicaciones', { fields: ['nombre', 'id'], sort: 'nombre' })),
});

/**
 * Create a new break
 * @param {String} event
 * @param {String} cc
 * @param {String} review
 * @returns
 */
export const createBreak = async (event, cc, review) =>
	await client.request(
		createItem(
			'interrupciones',
			{
				empleado: cc,
				evento: event,
				...(review && { observaciones: review }),
			},
			{ fields: ['id'] },
		),
	);
