import { createItem, deleteItems, readItems, updateItem } from '@directus/sdk';
import dayjs from 'dayjs';
import { client } from './client';

const table = 'registros';

/**
 * Get registers in one date for a store
 * @returns
 */
export const registersQuery = date => ({
	queryKey: ['registersStore', date],
	queryFn: async () =>
		await client.request(
			readItems(table, {
				fields: ['id', 'evento', 'hora', 'observaciones', { empleado: ['id', 'nombre'] }],
				filter: {
					fecha: {
						_eq: date,
					},
				},
			}),
		),
	refetchOnWindowFocus: false,
});
