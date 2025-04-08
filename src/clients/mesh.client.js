import { createItem, deleteItems, readItems, updateItem } from '@directus/sdk';
import { limitPage } from '../utils/constants';
import { client } from './client';
import db from '../utils/localDB';
import useConnectionStore from '../stores/connectionStore';
const mesh = 'malla';

/**
 *
 * @param {String} startDate
 * @param {String} endDate
 * @param {String} location
 * @returns
 */
export const meshRangeQuery = (startDate, endDate, location) => ({
	queryKey: ['mesh', location, startDate, endDate],
	queryFn: async () => {
		const { isOnline } = useConnectionStore.getState();
		if (isOnline) {
			return await client.request(
				readItems('malla', {
					fields: ['id', 'fecha', 'turno', 'novedad', { empleado: ['id', 'nombre'] }],
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
			);
		}

		return await db.malla
			.where('fecha')
			.between(startDate, endDate, true, true)
			.filter(item => item.tienda === location)
			.toArray();
	},
	refetchOnWindowFocus: false,
	enabled: !!location && !!startDate && !!endDate,
});

/**
 *
 * @param {String} startDate
 * @param {String} endDate
 * @param {String} location
 * @param {Number} page
 * @param {Number} limit
 * @returns
 */
export const RangeDate = (startDate, endDate, location, page = 1, limit = 10) => ({
	queryKey: ['mesh', location, startDate, endDate, page],
	queryFn: async () => {
		const { isOnline } = useConnectionStore.getState();

		if (isOnline) {
			return await client.request(
				readItems(mesh, {
					fields: [
						'id',
						'fecha',
						'turno',
						'novedad',
						'observaciones',
						{ empleado: ['id', 'nombre'] },
					],
					filter: {
						fecha: {
							_between: [startDate, endDate],
						},
						tienda: {
							_eq: location,
						},
						novedad: {
							_neq: null,
						},
					},
					sort: ['-id', '-fecha'],
					limit: limit,
					page: page,
				}),
			);
		}

		const news = await db.malla
			.where('fecha')
			.between(startDate, endDate, true, true)
			.filter(item => item.tienda === location && item.novedad !== null)
			.sortBy('fecha');

		const startIndex = (page - 1) * limit;
		const endIndex = startIndex + limit;
		return news.slice(startIndex, endIndex);
	},
	refetchOnWindowFocus: false,
	enabled: !!location && !!startDate && !!endDate,
});
/**
 * Get all news for a store
 * @param {Number} page
 * @param {String} date
 * @returns
 */
export const allNewsQuery = (page, date, location) => ({
	queryKey: ['newsHistory', page, date, location],
	queryFn: async () => {
		console.log('all news query  es usado Tabla malla');
		return await client.request(
			readItems(mesh, {
				fields: [{ empleado: ['nombre'] }, 'novedad', 'observaciones', 'fecha', 'empleado'],
				sort: '-fecha',
				filter: {
					fecha: {
						_lte: date,
					},
					novedad: {
						_nnull: true,
					},
					tienda: {
						_eq: location,
					},
				},
				limit: limitPage,
				page: page || 1,
			}),
		);
	},
	refetchOnWindowFocus: false,
});

/**
 * @param {String} date
 * @returns number of news
 */
export const countNewsQuery = (startDate, endDate, location) => ({
	queryKey: ['newsCount', startDate, endDate, location],
	queryFn: async () => {
		const { isOnline } = useConnectionStore.getState();

		if (isOnline) {
			return await client.request(
				readItems(mesh, {
					filter: {
						fecha: {
							_between: [startDate, endDate],
						},
						novedad: {
							_nnull: true,
						},
						tienda: {
							_eq: location,
						},
					},
					aggregate: { countDistinct: 'id' },
				}),
			);
		}

		const newsCount = await db.malla
			.where('fecha')
			.between(startDate, endDate, true, true)
			.filter(item => item.tienda === location && item.novedad !== null)
			.count();

		return [{ countDistinct: { id: newsCount } }];
	},
	refetchOnWindowFocus: false,
});

export const createMeshList = async data => {
	const { isOnline } = useConnectionStore.getState();

	if (isOnline) {
		try {
			const result = await client.request(createItem(mesh, data, { fields: ['id'] }));
			return result;
		} catch (error) {
			console.error('Error creating mesh:', error);
		}
	} else {
		try {
			const id = Date.now().toString();
			const novedad = {
				id,
				empleado: {
					id: data.empleado.id,
					nombre: data.empleado.nombre,
				},
				novedad: data.novedad,
				fecha: data.fecha,
				tienda: data.tienda,
				turno: null,
				observaciones: data.observaciones || null,
				syncPending: true,
			};

			await db.malla.add(novedad);

			return { id };
		} catch (error) {
			console.error('Error creating mesh:', error);
		}
	}
};

export const updateMesh = async (id, data) =>
	await client.request(updateItem(mesh, id, data, { fields: ['id'] }));

export const removeMeshQuery = async (startDate, endDate, cc) => {
	const { isOnline } = useConnectionStore.getState();

	if (isOnline) {
		try {
			await client.request(
				deleteItems('malla', {
					filter: {
						fecha: {
							_between: [startDate, endDate],
						},
						empleado: {
							_eq: cc,
						},
					},
				}),
			);
		} catch (error) {}
	} else {
		try {
			await db.malla
				.where('fecha')
				.between(startDate, endDate, true, true)
				.filter(item => item.empleado === cc)
				.delete();
		} catch (error) {}
	}
};
