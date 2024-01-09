import { readItems, readMe } from '@directus/sdk';
import { client } from './client';

/**
 *Return role of actual user and loations
 * @returns
 */
export const roleQuery = () => ({
	queryKey: ['roleQuery'],
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
					{ turno_tienda: ['lugares_id'] },
				],
			}),
		),
	refetchOnWindowFocus: false,
});
