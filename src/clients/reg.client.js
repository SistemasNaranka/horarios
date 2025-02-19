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
	enabled: !!date,
});
/**
 * Get all registers in a date range for a store with pagination
 * @param {Number} page
 * @param {String} startDate
 * @param {String} endDate
 * @param {String} location
 * @returns
 */
export const allRegistersQuery = (page, startDate, endDate) => ({
	queryKey: ['registerStores', page, startDate, endDate],
	queryFn: async () => {
		return await client.request(
			readItems(table, {
				fields: ['id', 'evento', 'fecha', 'hora', 'observaciones', { empleado: ['nombre'] }],
				sort: ['-fecha', '-hora'],
				filter: {
					fecha: {
						_between: [startDate, endDate],
					},
				},
				limit: limitPage,
				page: page,
			}),
		);
	},
	refetchOnWindowFocus: false,
});

/*
 * Create a new register
 * @param {String} event
 * @param {String} cc
 * @param {String} review
 * @returns
 */
export const createRegister = async data =>
	await client.request(createItem(table, data, { fields: ['id'] }));

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
 * Count the total number of registers for a specific date range and location
 * @param {String} startDate
 * @param {String} endDate
 * @param {String} location
 * @returns
 */
export const countRegQuery = (startDate, endDate) => ({
	queryKey: ['regCount', startDate, endDate],
	queryFn: async () =>
		await client.request(
			readItems(table, {
				filter: {
					fecha: {
						_between: [startDate, endDate],
					},
				},
				aggregate: { countDistinct: 'id' },
			}),
		),
	refetchOnWindowFocus: false,
	enabled: !!location && !!startDate && !!endDate,
});
