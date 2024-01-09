import { createItems, readItems } from '@directus/sdk';
import { client } from './client';
import { limitPage } from '../utils/constants';

const table = 'novedades';

/**
 * Get registers in one date for a store
 * @returns
 */
export const newsQuery = date => ({
	queryKey: ['newsStore', date],
	queryFn: async () =>
		await client.request(
			readItems(table, {
				fields: ['empleado'],
				filter: {
					fecha: {
						_eq: date,
					},
				},
			}),
		),
	refetchOnWindowFocus: false,
});

/**
 * Create a list News
 * @param {*} news
 * @returns
 */
export const createListNews = async news =>
	await client.request(createItems(table, news, { fields: ['id'] }));

/**
 * Get all news for a store
 * @param {Number} page
 * @param {String} date
 * @returns
 */
export const allNewsQuery = (page, date) => ({
	queryKey: ['newsHistory', page, date],
	queryFn: async () =>
		await client.request(
			readItems(table, {
				fields: [{ empleado: ['nombre'] }, 'novedad', 'observaciones', 'fecha', 'empleado'],
				sort: '-fecha',
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
export const countNewsQuery = date => ({
	queryKey: ['newsCount', date],
	queryFn: async () =>
		await client.request(
			readItems(table, {
				filter: {
					fecha: {
						_lte: date,
					},
				},
				aggregate: { countDistinct: 'id' },
			}),
		),
	refetchOnWindowFocus: false,
});
