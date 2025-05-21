import { createItem, deleteItems, readItems, updateItem } from '@directus/sdk';
import { limitPage } from '../utils/constants';
import { client } from './client';
import db from '../utils/localDB';
import useConnectionStore from '../stores/connectionStore';

// Nombre de la tabla en la base de datos
const mesh = 'malla';

/**
 * Funcion para informacion de la tabla malla en un rango de fechas y de los empleados Activos de la base de datos 
 * en caso de no tener conexion con la base de datos principal se hace la consulta a la base de datos local
 * @param {String} startDate - Fecha de inicio del rango
 * @param {String} endDate - Fecha de fin del rango
 * @param {String} location - Id de la ubicacion
 * @returns {Object} - Objeto que contiene la informacion de la tabla malla en ese rango de fechas
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
						empleado: {
							estado: {
								_eq: 'Activo',
							},
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
 * Genera una configuración para consultar datos filtrados por rango de fechas, ubicación y otros criterios.
 *
 * @param {string} startDate - Fecha de inicio del rango.
 * @param {string} endDate - Fecha de fin del rango.
 * @param {string} location - Ubicación o tienda para filtrar los datos.
 * @param {number} [page=1] - Número de página para la paginación.
 * @param {number} [limit=10] - Límite de elementos por página.
 * @returns {object} Configuración para la consulta, incluyendo clave, función de consulta y opciones.
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
						empleado: {
							estado: {
								_eq: 'Activo',
							},
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
 * obtiene todas las novedades de la base de datos
 * @returns
 */
export const allNewsQuery = (page, date, location) => ({
	queryKey: ['newsHistory', page, date, location],
	queryFn: async () => {
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
					empleado: {
						estado: {
							_eq: 'Activo',
						},
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
 * Contar el número de novedades en un rango de fechas y ubicación
 * @param {string} startDate - Fecha de inicio del rango
 * @param {string} endDate - Fecha de fin del rango
 * @param {string} location - Ubicación o tienda para filtrar los datos
 * @returns {object} Configuración para la consulta, incluyendo clave y función de consulta
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

/**
 * Crea una nueva malla en la base de datos ya sea principal o local
 * @param {Object} data - Objeto que contiene la informacion de la malla
 * @returns {Object} - Objeto que contiene la informacion de la malla creada
 */
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

/**
 * Actualiza Un registro en la base de datos ya sea principal o local
 * @param {String} id - Id del Registro a actualizar
 * @param {Object} data - Objeto que contiene la informacion de la malla
 * @returns {Object} - Objeto que contiene la informacion de la malla actualizada
 */
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
