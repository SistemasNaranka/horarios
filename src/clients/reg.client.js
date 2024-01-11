import { createItem, readItems, updateItem } from '@directus/sdk';
import { limitPage } from '../utils/constants';
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
/**
 *
 * Get registers in one date for a store
 * @returns
 */
export const allRegistersQuery = (page, date) => ({
	queryKey: ['registersStore', page, date],
	queryFn: async () =>
		client.request(
			readItems(table, {
				fields: ['id', 'evento', 'fecha', 'hora', 'observaciones', { empleado: ['nombre'] }],
				sort: ['-fecha', '-hora'],
				limit: limitPage,
				page: page || 1,
			}),
		),
	refetchOnWindowFocus: false,
});
/*
 * Create a new register
 * @param {String} event
 * @param {String} cc
 * @param {String} review
 * @returns
 */
export const createRegister = async (event, cc, location) =>
	await client.request(
		createItem(
			table,
			{
				empleado: cc,
				evento: event,
				tienda: location,
			},
			{ fields: ['id'] },
		),
	);

/**
 * Update a register to add a review
 * @param {String} review
 * @param {Number} id
 * @returns
 */
export const createReview = async (review, id) =>
	await client.request(
		updateItem(
			table,
			id,
			{
				observaciones: review,
			},
			{ fields: ['id'] },
		),
	);

/**
 * @param {String} date
 * @returns number of news
 */
export const countRegQuery = date => ({
	queryKey: ['regCount', date],
	queryFn: async () =>
		await client.request(
			readItems(table, {
				filter: {
					fecha: {
						_lte: date,
					},
					hora: {
						_neq: '23:59:59',
					},
				},
				aggregate: { countDistinct: 'id' },
			}),
		),
	refetchOnWindowFocus: false,
});
