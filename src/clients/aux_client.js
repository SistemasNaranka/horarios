import { createItem, readItems, readMe } from '@directus/sdk';
import { client } from './client';
import db from '../utils/localDB';
import useConnectionStore from '../stores/connectionStore';

/**
 *Funcion para obtener el rol y ubicacion del usuario haciendo una consulta a la base de datos en caso de tener conexión con esta misma o por su defecto
 * a la base de datos local y mostrando avisos de error en caso de no encontrar el rol o el usuario no este autenticado
 * @returns {Object} - Un objeto que contiene el rol y la ubicación del usuario
 * @param {String} role - El rol del usuario
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
 * Funcion encargada de obtener los turnos activos de la base de datos  funcion unicamente habilitada en caso de tener conexion con la base de datos principal
 * @returns {Array} - Un array con los ids de los turnos activos 
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
 * Funcion encargada de traer los turnos activos de una ubicacion situados en una tabla pivote en caso de tener conexion con la base de datos principal 
 * atravez de la consulta a la base de datos funcion unicamente habilitada en caso de tener conexion con la base de datos principal 
 * en caso contrario se devuelve un array vacio
 * @returns {Array} - Un array con los turnos de la ubicacion 
 * @param {String} location - El id de la ubicacion
 * @param {String} activeShiftIds - El id de los turnos activos|
 *  */
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
 * Funcion usada para traer la informacion de los empleados activos de una ubicacion de la base de datos principal o de la base de datos local
 * en caso de no tener conexion con la base de datos principal
 * @returns {Array} - Un array con los empleados de la ubicacion y sus respectivos datos
 * @param {String} location - El id de la ubicacion
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
 * Funcion usada para traer la informacion de los eventos de la base de datos principal o de la base de datos local 
 * @returns {Array} - Un array con los eventos de la base de datos
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
 * Funcion utilizada por el cliente para crear un evento en la base de datos
 * @param {String} event - El evento a crear
 * @param {String} cc - El id del empleado
 * @param {String} review - La Observaciones del evento (opcional)
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
