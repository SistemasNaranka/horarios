import { createItem, deleteItems, readItems, updateItem } from '@directus/sdk';
import { limitPage } from '../utils/constants';
import { client } from './client';

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
	queryFn: async () =>
		await client.request(
			readItems(mesh, {
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
		),
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
	queryFn: async () =>
		await client.request(
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
		),

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
	queryFn: async () =>
		await client.request(
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
		),
	refetchOnWindowFocus: false,
});

/**
 * @param {String} date
 * @returns number of news
 */
export const countNewsQuery = (startDate, endDate, location) => ({
	queryKey: ['newsCount', startDate, endDate, location],
	queryFn: async () =>
		await client.request(
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
		),
	refetchOnWindowFocus: false,
});

export const createMeshList = async data =>
	await client.request(createItem(mesh, data, { fields: ['id'] }));

export const updateMesh = async (id, data) =>
	await client.request(updateItem(mesh, id, data, { fields: ['id'] }));

export const removeMeshQuery = async (startDate, endDate, cc) => {
	await client.request(
		deleteItems(mesh, {
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
};
