import { createItem, readItems, updateItem } from '@directus/sdk';
import { limitPage } from '../utils/constants';
import { client } from './client';
import db from '../utils/localDB';
import useConnectionStore from '../stores/connectionStore';
import dayjs from 'dayjs';
const table = 'registros';

/**
 * Get registers in one date for a store
 * @returns
 */
export const registersQuery = date => ({
	queryKey: ['registersStore', date],
	queryFn: async () => {
		const { isOnline } = useConnectionStore.getState();
		if (isOnline) {
			return await client.request(
				readItems('registros', {
					fields: ['id', 'evento', 'hora', 'observaciones', { empleado: ['id', 'nombre'] }],
					filter: {
						fecha: {
							_eq: date,
						},
					},
				}),
			);
		}

		return await db.registros.where('fecha').equals(date).toArray();
	},
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
export const allRegistersQuery = (page, startDate, endDate, location) => ({
	queryKey: ['registerStores', page, startDate, endDate],
	queryFn: async () => {
		const { isOnline } = useConnectionStore.getState();

		if (isOnline) {
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
		}

		const empleados = await db.empleados.where('tienda').equals(location).toArray();
		const empleadosIds = empleados.map(empleado => empleado.id);

		const registros = await db.registros
			.where('fecha')
			.between(startDate, endDate, true, true)
			.filter(registro => empleadosIds.includes(registro.empleado.id))
			.sortBy('fecha');

		const startIndex = (page - 1) * limitPage;
		const endIndex = startIndex + limitPage;
		const paginatedRegistros = registros.slice(startIndex, endIndex);

		return paginatedRegistros;
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

export const createRegister = async data => {
	const { isOnline } = useConnectionStore.getState();

	if (isOnline) {
		try {
			const result = await client.request(createItem(table, data, { fields: ['id'] }));

			return result;
		} catch (error) {}
	} else {
		try {
			const id = Date.now().toString();
			const registro = {
				...data,
				id,
				fecha: dayjs().format('YYYY-MM-DD'),
				hora: dayjs().format('HH:mm:ss'),
				syncPending: true,
				empleado: {
					id: data.empleado.id,
					nombre: data.empleado.nombre,
				},
			};
			await db.registros.add(registro);

			return { id };
		} catch (error) {}
	}
};
/**
 * Update a register to add a review
 * @param {String} review
 * @param {Number} id
 * @returns
 */
export const createReview = async (review, id) => {
	const { isOnline } = useConnectionStore.getState();

	if (isOnline) {
		try {
			const result = await client.request(
				updateItem(
					'registros',
					id,
					{
						observaciones: review,
					},
					{ fields: ['id'] },
				),
			);

			return result;
		} catch (error) {}
	} else {
		try {
			await db.registros.update(id, {
				observaciones: review,
				syncPending: true,
				n,
			});
			console.log('Observación guardada localmente:', id);
			return { id };
		} catch (error) {}
	}
};
/**
 * Count the total number of registers for a specific date range and location
 * @param {String} startDate
 * @param {String} endDate
 * @param {String} location
 * @returns
 */
export const countRegQuery = (startDate, endDate, location) => ({
	queryKey: ['regCount', startDate, endDate],
	queryFn: async () => {
		const { isOnline } = useConnectionStore.getState();

		if (isOnline) {
			return await client.request(
				readItems(table, {
					filter: {
						fecha: {
							_between: [startDate, endDate],
						},
					},
					aggregate: { countDistinct: 'id' },
				}),
			);
		}

		const registros = await db.registros
			.where('fecha')
			.between(startDate, endDate, true, true)
			.toArray();

		return { data: [{ count: { id: registros.length } }] };
	},
	refetchOnWindowFocus: false,
	enabled: !!startDate && !!endDate,
});
