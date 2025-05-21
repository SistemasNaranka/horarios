import { createItem, readItems, updateItem } from '@directus/sdk';
import { limitPage } from '../utils/constants';
import { client } from './client';
import db from '../utils/localDB';
import useConnectionStore from '../stores/connectionStore';
import dayjs from 'dayjs';
const table = 'registros';

/**
 * Consulta los registros de una tienda en una fecha específica.ya sea en la base de datos principal o en la base de datos local
 * @param {String} date - Fecha para filtrar los registros.
 * @returns {Object} - Registros de la tienda en la fecha especificada.
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
 * Traer todos los registros de una tienda en un rango de fechas ya sea en la base de datos principal o en la base de datos local
 * @param {String} date - Fecha para filtrar los registros.
 * @param {Number} page - Pagina para paginacion
 * @param {String} startDate - Fecha de inicio del rango
 * @param {String} endDate - Fecha de fin del rango
 * @param {String} location - Id de la ubicacion
 * @returns {Object} - Registros de la tienda en el rango de fechas especificado.
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

/**
 * Crea un nuevo registro en la base de datos, ya sea en la base de datos principal o en la base de datos local
 * @param {Object} data - Datos del registro a crear.
 * @returns {Object} - El nuevo registro creado.
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
 * Actualiza un registro en la base de datos pero solo la observacion dependiendo de si la base de datos es local o principal
 * @param {String} review - Observaciones a agregar al registro.
 * @param {String} id - Id del registro a actualizar.
 * @returns {Object} - El registro actualizado.
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
			});
			console.log('Observación guardada localmente:', id);
			return { id };
		} catch (error) {}
	}
};
/**
 * Total de registros en un rango de fechas ya sea en la base de datos principal o en la base de datos local
 * @param {String} startDate - Fecha de inicio del rango.
 * @param {String} endDate - Fecha de fin del rango.
 * @param {String} location - Id de la ubicacion
 * @returns {Object} - Total de registros en el rango de fechas especificado.
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
