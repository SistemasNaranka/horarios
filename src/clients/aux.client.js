import { createItem, readItems, readMe } from '@directus/sdk';
import { client } from './client';

/**
 *Return role of actual user and loations
 * @returns
 */
export const roleQuery = () => ({
	queryKey: ['role'],
	queryFn: async () => await client.request(readMe({ fields: [{ role: ['name'] }, 'ubicacion'] })),
	refetchOnWindowFocus: false,
});

/**
 * return the shifts available
 * @returns
 */
export const shiftQuery = () => ({
	queryKey: ['shifts'],
	queryFn: async () =>
		await client.request(
			readItems('turnos', {
				fields: [
					'id',
					'inicio_turno',
					'final_turno',
					'tiempo_laborado',
					'tiempo_almuerzo',
					{ turnos_tienda: ['ubicaciones_id'] },
				],
			}),
		),
	refetchOnWindowFocus: false,
});

/**
 * Return employees in one store
 * @returns
 */
export const employeesLocationQuery = location => ({
	queryKey: ['employees'],
	queryFn: async () =>
		await client.request(
			readItems('empleados', {
				fields: ['nombre', 'id'],
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
		),
	refetchOnWindowFocus: false,
	enabled: !!location,
});

/**
 * Get the events
 * @returns
 */
export const eventsQuery = () => ({
	queryKey: ['events'],
	queryFn: async () =>
		await client.request(readItems('eventos', { fields: ['nombre', 'id'], sort: 'nombre' })),
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
