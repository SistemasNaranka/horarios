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

		// Modo offline: usar la base de datos local
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
			// // Modo online: usar Directus
			// console.log('all register query es usado Tabla registros (Directus)');
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
		// Modo offline: usar la base de datos local (IndexedDB)
		const empleados = await db.empleados.where('tienda').equals(location).toArray();
		const empleadosIds = empleados.map(empleado => empleado.id);

		// Filtrar registros por IDs de empleados y rango de fechas
		const registros = await db.registros
			.where('fecha')
			.between(startDate, endDate, true, true) // Filtrar por rango de fechas
			.filter(registro => empleadosIds.includes(registro.empleado.id)) // Filtrar por IDs de empleados
			.sortBy('fecha'); // Ordenar por fecha

		// Paginación manual
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
		// Modo online: guardar en Directus
		try {
			const result = await client.request(createItem(table, data, { fields: ['id'] }));
			// console.log('Registro creado en Directus:', result);
			return result;
		} catch (error) {
			// console.error('Error creando registro en Directus:', error);
			// throw error;
		}
	} else {
		// Modo offline: guardar en la base de datos local
		try {
			const id = Date.now().toString(); // Generar un ID temporal
			const registro = {
				...data,
				id,
				fecha: dayjs().format('YYYY-MM-DD'), // Fecha actual
				hora: dayjs().format('HH:mm:ss'), // Hora actual
				syncPending: true, // Marcar como pendiente de sincronización
				empleado: {
					id: data.empleado.id, // ID del empleado
					nombre: data.empleado.nombre, // Nombre del empleado
				},
			};
			await db.registros.add(registro);
			// console.log('Registro guardado localmente:', registro);
			return { id };
		} catch (error) {
			// console.error('Error guardando registro localmente:', error);
			// throw error;
		}
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
		// Modo online: actualizar en Directus
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
			// console.log('Observación actualizada en Directus:', result);
			return result;
		} catch (error) {
			// console.error('Error actualizando observación en Directus:', error);
			// throw error;
		}
	} else {
		// Modo offline: actualizar en la base de datos local
		try {
			await db.registros.update(id, {
				observaciones: review,
				syncPending: true, // Marcar como pendiente de sincronización
			});
			console.log('Observación guardada localmente:', id);
			return { id };
		} catch (error) {
			// console.error('Error guardando observación localmente:', error);
			// throw error;
		}
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
			// Modo online: usar Directus
			// console.log('count reg query es usado Tabla registros (Directus)');
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
		// Modo offline: usar la base de datos local (IndexedDB)
		// console.log('count reg query es usado Tabla registros (IndexedDB)');
		const registros = await db.registros
			.where('fecha')
			.between(startDate, endDate, true, true) // Filtrar por rango de fechas
			.toArray();

		return { data: [{ count: { id: registros.length } }] }; // Simular la respuesta de Directus
	},
	refetchOnWindowFocus: false,
	enabled: !!startDate && !!endDate,
});
