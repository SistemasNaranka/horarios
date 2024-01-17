import { readItems } from '@directus/sdk';
import { client } from './client';

const mesh = 'malla';

export const meshRangeQuery = (startDate, endDate, location) => ({
	queryKey: ['mesh', location],
	queryFn: async () =>
		await client.request(
			readItems(mesh, {
				fields: ['fecha', 'turno', { empleado: ['id', 'nombre'] }],
				filter: {
					fecha: {
						_between: [startDate, endDate],
					},
					tienda: {
						_eq: location,
					},
				},
				sort: ['id', 'fecha'],
				limit: -1,
			}),
		),
	refetchOnWindowFocus: false,
	enabled: !!location && !!startDate,
});
