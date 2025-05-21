/**
 * Clase encargada de manejar la sincronizacion de datos entre la base de datos local y la base de datos principal
 * @class SyncData
 * @param {Object} client - Cliente de la base de datos		
 * @param {Object} db - Base de datos loca
 */
import { client } from './client';
import db from '../utils/localDB';
import { readUsers, readMe, readItems } from '@directus/sdk';
import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import { syncPendingMesh, syncPendingRegisters } from './syncQueue';

/**
 * @description Esta funcion se encarga de traer todos los empleados activos de la base de datos principal
 * @returns {Array} - Un array con los empleados activos
 * @throws {Error} - Si hay un error al traer los empleados
*/
const getAllEmployees = async () => {
	const limit = 100;
	let offset = 0;
	let allEmployees = [];

	while (true) {
		const employees = await client.request(
			readItems('empleados', {
				fields: ['id', 'nombre', 'tienda', 'estado'],
				limit,
				offset,
				filter: {
					estado: {
						_eq: 'Activo',
					},
					tienda: {
						_nnull: true,
					},
				},
			}),
		);

		if (employees.length === 0) {
			break;
		}

		allEmployees = allEmployees.concat(employees);
		offset += limit;
	}

	return allEmployees;
};
/**
 * @description Esta funcion se encarga de traer los registros de 2 dias antes hasta la fecha actual de la base de datos principal
 * @param {String} tiendaUsuario - Id de la tienda del usuario
 * @returns {Array} - Un array con los registros
 * @throws {Error} - Si hay un error al traer los registros
*/

const getRecentRegisters = async tiendaUsuario => {
	try {
		const startDate = dayjs().subtract(2, 'day').format('YYYY-MM-DD');
		const endDate = dayjs().format('YYYY-MM-DD');

		const empleados = await db.empleados.where('tienda').equals(tiendaUsuario).toArray();

		const empleadosIds = empleados.map(empleado => empleado.id);

		const limit = 100;
		let offset = 0;
		let allRegisters = [];

		while (true) {
			const registers = await client.request(
				readItems('registros', {
					fields: [
						'id',
						'evento',
						'fecha',
						'hora',
						'observaciones',
						{ empleado: ['id', 'nombre'] },
					],
					filter: {
						fecha: {
							_between: [startDate, endDate],
						},
						empleado: {
							_in: empleadosIds,
						},
					},
					limit,
					offset,
				}),
			);

			if (registers.length === 0) {
				break;
			}

			allRegisters = allRegisters.concat(registers);
			offset += limit;
		}

		return allRegisters;
	} catch (error) {
		return [];
	}
};

/**
 * @description Esta funcion se encarga de traer los registros de 7 dias despues de la fecha actual de la base de datos principal
 * @returns {Array} - Un array con los registros
 * @throws {Error} - Si hay un error al traer los registros
*/
const getRecentMesh = async () => {
	const startDate = dayjs().format('YYYY-MM-DD');
	const endDate = dayjs().add(7, 'day').format('YYYY-MM-DD');

	const mesh = await client.request(
		readItems('malla', {
			fields: [
				'id',
				'fecha',
				'turno',
				'novedad',
				'tienda',
				'observaciones',
				{ empleado: ['id', 'nombre'] },
			],
			filter: {
				fecha: {
					_between: [startDate, endDate],
				},
				novedad: {
					_nnull: true,
				},
			},
		}),
	);

	return mesh;
};

/**
 * @description Esta funcion se encarga de eliminar los registros que no existen en la base de datos principal
 * @param {Array} directusRegisters - Array con los registros de la base de datos principal
 * @throws {Error} - Si hay un error al eliminar los registros
 */
const deleteRemovedRegisters = async directusRegisters => {
	try {
		const localRegisters = await db.registros.toArray();

		const directusRegisterIds = new Set(directusRegisters.map(reg => reg.id));

		for (const localRegister of localRegisters) {
			if (!directusRegisterIds.has(localRegister.id)) {
				await db.registros.delete(localRegister.id);
			}
		}
	} catch (error) {}
};

/**
 * @description Esta funcion se encarga de eliminar todos los registros de la malla que no existen en la base de datos principal
 * @param {Array} directusMesh - Array con los registros de la base de datos principal
 * @throws {Error} - Si hay un error al eliminar los registros
 */
const deleteRemovedMesh = async directusMesh => {
	try {
		const localMesh = await db.malla.toArray();

		const directusMeshIds = new Set(directusMesh.map(mesh => mesh.id));

		for (const localMeshItem of localMesh) {
			if (!directusMeshIds.has(localMeshItem.id)) {
				await db.malla.delete(localMeshItem.id);
			}
		}
	} catch (error) {}
};

/**
 * @description Esta funcion se encarga de eliminar los registros de la base de datos local que son anteriores a 2 dias y los registros de la malla que son anteriores a 7 dias
 * @throws {Error} - Si hay un error al eliminar los registros	
*/
const deleteOldRecords = async () => {
	try {
		const twoDaysAgo = dayjs().subtract(2, 'day').format('YYYY-MM-DD');
		const sevenDaysAgo = dayjs().subtract(7, 'day').format('YYYY-MM-DD');

		await db.registros.where('fecha').below(twoDaysAgo).delete();

		await db.malla.where('fecha').below(sevenDaysAgo).delete();
	} catch (error) {}
};

/**
 * @description Esta funcion se encarga de sincronizar los datos criticos de la base de datos local con la base de datos principal
 * @throws {Error} - Si hay un error al sincronizar los datos
*/
export const syncCriticalData = async () => {
	try {
		await syncPendingRegisters();
		await syncPendingMesh();
		await syncMesh();

		const userInfo = await client.request(readMe({ fields: ['ubicacion'] }));
		const tiendaUsuario = userInfo.ubicacion;

		if (!tiendaUsuario) {
		}
		await syncRegisters(tiendaUsuario);
	} catch (error) {}
};

// Variable que almacena la fecha de la ultima sincronizacion de usuarios Se almacena en el localStorage para evitar que se sincronice cada vez que se inicia la aplicacion
const LAST_USER_SYNC_KEY = 'lastUserSync';

/**
 * @description Esta funcion se encarga de sincronizar los usuarios de la base de datos local con la base de datos principal de directus
 * donde se traen los usuarios que tienen el rol de almacenes o test y se les asigna una contraseña igual a su correo electronico
 * @param {Object} client - Cliente de la base de datos principal
 * @throws {Error} - Si hay un error al sincronizar los usuarios
 */
export const syncUsers = async () => {
	try {
		const localUsers = await db.users.toArray();
		const isUsersTableEmpty = localUsers.length === 0;

		const lastSync = localStorage.getItem(LAST_USER_SYNC_KEY);
		const now = new Date().getTime();

		if (isUsersTableEmpty || !lastSync || now - Number.parseInt(lastSync) > 24 * 60 * 60 * 1000) {
			const users = await client.request(
				readUsers({
					fields: ['email', { role: ['name'] }, 'ubicacion'],
					filter: {
						role: {
							name: {
								_in: ['almacenes', 'test'],
							},
						},
					},
				}),
			);

			const usersWithPassword = await Promise.all(
				users.map(async user => {
					const password = user.email.split('@')[0];
					const hashedPassword = await bcrypt.hash(password, 10);
					return {
						email: user.email,
						password: hashedPassword,
						ubicacion: user.ubicacion,
						role: user.role,
					};
				}),
			);

			await db.users.bulkPut(usersWithPassword);
			localStorage.setItem(LAST_USER_SYNC_KEY, now.toString());
		} else {
		}
	} catch (error) {}
};

/**
 * @description Esta funcion se encarga de sincronizar los eventos de la base de datos local con la base de datos principal
 * @throws {Error} - Si hay un error al sincronizar los eventos
*/
const syncEvents = async () => {
	try {
		const eventos = await client.request(readItems('eventos', { fields: ['id', 'nombre'] }));
		await db.eventos.bulkPut(eventos);
	} catch (error) {}
};

/**
 * @description Esta funcion se encarga de sincronizar los empleados de la base de datos local con la base de datos principal
 * @throws {Error} - Si hay un error al sincronizar los empleados
*/
const syncEmployees = async () => {
	try {
		const empleados = await getAllEmployees();
		await db.empleados.bulkPut(empleados);
	} catch (error) {}
};

/**
 * @description Esta funcion se encarga de sincronizar los registros de la base de datos local con la base de datos principal
 * @param {String} tiendaUsuario - Id de la tienda del usuario
 * @throws {Error} - Si hay un error al sincronizar los registros
*/
const syncRegisters = async tiendaUsuario => {
	try {
		const registros = await getRecentRegisters(tiendaUsuario);
		await db.registros.bulkPut(registros);
		await deleteRemovedRegisters(registros);
	} catch (error) {}
};

/**
 * @description Esta funcion se encarga de sincronizar la malla de la base de datos local con la base de datos principal
 * @throws {Error} - Si hay un error al sincronizar la malla
*/
const syncMesh = async () => {
	try {
		const malla = await getRecentMesh();
		await db.malla.bulkPut(malla);
		await deleteOldRecords();
		await deleteRemovedMesh(malla);
	} catch (error) {}
};

/**
 * @description Esta funcion se encarga de sincronizar los datos no criticos de la base de datos local con la base de datos principal
 * @throws {Error} - Si hay un error al sincronizar los datos no criticos
*/
export const syncNonCriticalData = async () => {
	try {
		await Promise.all([syncEvents(), syncEmployees()]);

		await syncMesh();
	} catch (error) {}
};
