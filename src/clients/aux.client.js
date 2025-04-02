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
		const { isOnline } = useConnectionStore.getState(); // Obtener el estado de la conexión
		// console.log('valor de online de role query', isOnline);
		if (isOnline) {
			// Modo online: usar Directus
			const result = await client.request(readMe({ fields: [{ role: ['name'] }, 'ubicacion'] }));
			// console.log('roleQuery es usado (modo online)', result);
			return result;
		}

		// Modo offline: usar la base de datos local
		const localAuth = JSON.parse(localStorage.getItem('localAuth'));
		if (localAuth) {
			const user = await db.users.get({ email: localAuth.email });
			if (user) {
				const role = user.role.name;
				const ubicacion = user.ubicacion;
				// console.log('roleQuery es usado (modo offline)', { role, ubicacion });
				return { role: { name: role }, ubicacion };
			}
		}

		// Si no hay autenticación local o el usuario no se encuentra
		// throw new Error('No hay autenticación local o el usuario no fue encontrado');
	},
	refetchOnWindowFocus: false,
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
	// console.log('turnos activos es usado');
	return activeShifts.map(shift => shift.id);
};

/**
 * Fetch shifts and their associated locations, filtered by active shifts.
 * @returns {Array} - An array of shifts with their locations and details.
 */
export const shiftQuery = () => ({
	queryKey: ['shifts'],
	queryFn: async () => {
		const { isOnline } = useConnectionStore.getState(); // Obtener el estado de la conexión
		// console.log('valor de online de shifts query', isOnline);
		if (isOnline) {
			// Modo online: usar Directus
			const activeShiftIds = await getActiveShifts();
			// console.log('turnos query es usado (modo online)');
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
		// Modo offline: no hacer nada o devolver un valor predeterminado
		// console.log('turnos query no se usa en modo offline');
		return []; // Devuelve un array vacío o lanza un error
	},
	refetchOnWindowFocus: false,
});

/**
 * Return employees in one store
 * @returns
 */

export const employeesLocationQuery = location => ({
	queryKey: ['employees', location], // Incluir la ubicación en la clave de la consulta
	queryFn: async () => {
		const { isOnline } = useConnectionStore.getState(); // Obtener el estado de la conexión
		// console.log('empleados ubicacion query es usado. Modo:', isOnline ? 'online' : 'offline');

		if (isOnline) {
			// Modo online: usar Directus
			return await client.request(
				readItems('empleados', {
					fields: ['id', 'nombre', 'tienda', 'estado'],
					sort: 'nombre',
					filter: {
						tienda: { _eq: location },
						estado: { _eq: 'Activo' },
					},
				}),
			);
		}

		// Modo offline: usar la base de datos local
		const empleados = await db.empleados
			.where('tienda')
			.equals(location)
			.and(empleado => empleado.estado === 'Activo')
			.toArray();

		// console.log('Empleados obtenidos de la base de datos local:', empleados);
		return empleados;
	},
	refetchOnWindowFocus: false,
	enabled: !!location, // Solo ejecutar la consulta si hay una ubicación válida
});

/**
 * Get the events
 * @returns
 */
export const eventsQuery = () => ({
	queryKey: ['events'],
	queryFn: async () => {
		const { isOnline } = useConnectionStore.getState(); // Obtener el estado de la conexión
		// console.log('valor de online de eventsquery query', isOnline);
		if (isOnline) {
			// Modo online: usar Directus
			// console.log('evento query es usado (modo online)');
			return await client.request(
				readItems('eventos', { fields: ['nombre', 'id'], sort: 'nombre' }),
			);
		}

		// Modo offline: usar la base de datos local
		// console.log('evento query es usado (modo offline)');
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
