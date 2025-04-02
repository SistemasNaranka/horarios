// src/clients/syncData.js

import { client } from './client';
import db from '../utils/localDB';
import { readUsers, readMe, readItems } from '@directus/sdk';
import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import { syncPendingMesh, syncPendingRegisters } from './syncQueue';
/**
 * Obtener todos los empleados desde Directus con paginación
 */
const getAllEmployees = async () => {
	const limit = 100; // Número de registros por página
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
			break; // No hay más registros
		}

		allEmployees = allEmployees.concat(employees);
		offset += limit;
	}

	return allEmployees;
};

/**
 * Obtener los registros de los últimos 2 días
 */
const getRecentRegisters = async tiendaUsuario => {
	try {
		const startDate = dayjs().subtract(2, 'day').format('YYYY-MM-DD');
		const endDate = dayjs().format('YYYY-MM-DD');

		// Obtener los IDs de los empleados de la tienda del usuario
		const empleados = await db.empleados.where('tienda').equals(tiendaUsuario).toArray();

		const empleadosIds = empleados.map(empleado => empleado.id);

		const limit = 100; // Número de registros por página
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
							_in: empleadosIds, // Filtrar por los IDs de los empleados de la tienda del usuario
						},
					},
					limit,
					offset,
				}),
			);

			if (registers.length === 0) {
				break; // No hay más registros
			}

			allRegisters = allRegisters.concat(registers);
			offset += limit;
		}

		// console.log('Registros obtenidos:', allRegisters);
		return allRegisters;
	} catch (error) {
		// console.error('Error obteniendo registros:', error);
		return [];
	}
};

/**
 * Obtener los datos de malla de los próximos 7 días
 */
const getRecentMesh = async () => {
	const startDate = dayjs().format('YYYY-MM-DD'); // Fecha de hoy
	const endDate = dayjs().add(7, 'day').format('YYYY-MM-DD'); // Fecha dentro de 7 días

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
					_nnull: true, // Solo con novedades
				},
			},
		}),
	);

	return mesh;
};

const deleteRemovedRegisters = async directusRegisters => {
	try {
		// Obtener todos los registros locales
		const localRegisters = await db.registros.toArray();

		// Crear un conjunto de IDs de registros en Directus
		const directusRegisterIds = new Set(directusRegisters.map(reg => reg.id));

		// Eliminar registros locales que no están en Directus
		for (const localRegister of localRegisters) {
			if (!directusRegisterIds.has(localRegister.id)) {
				await db.registros.delete(localRegister.id);
				// console.log('Registro eliminado de IndexedDB:', localRegister.id);
			}
		}

		// console.log('Eliminación de registros locales completada.');
	} catch (error) {
		// console.error('Error eliminando registros locales:', error);
	}
};

const deleteRemovedMesh = async directusMesh => {
	try {
		// Obtener todos los registros de malla locales
		const localMesh = await db.malla.toArray();

		// Crear un conjunto de IDs de registros en Directus
		const directusMeshIds = new Set(directusMesh.map(mesh => mesh.id));

		// Eliminar registros locales que no están en Directus
		for (const localMeshItem of localMesh) {
			if (!directusMeshIds.has(localMeshItem.id)) {
				await db.malla.delete(localMeshItem.id);
				// console.log('Registro de malla eliminado de IndexedDB:', localMeshItem.id);
			}
		}

		// console.log('Eliminación de registros de malla locales completada.');
	} catch (error) {
		// console.error('Error eliminando registros de malla locales:', error);
	}
};

const deleteOldRecords = async () => {
	try {
		const twoDaysAgo = dayjs().subtract(2, 'day').format('YYYY-MM-DD');
		const sevenDaysAgo = dayjs().subtract(7, 'day').format('YYYY-MM-DD');

		// Eliminar registros antiguos
		await db.registros.where('fecha').below(twoDaysAgo).delete();

		// Eliminar malla antigua
		await db.malla.where('fecha').below(sevenDaysAgo).delete();

		// console.log('Registros antiguos eliminados.');
	} catch (error) {
		// console.error('Error eliminando registros antiguos:', error);
	}
};
export const syncCriticalData = async () => {
	try {
		// console.log('Iniciando sincronización crítica...');
		await syncPendingRegisters(); // Sincronizar registros pendientes
		await syncPendingMesh();
		await syncMesh();
		// Obtener la ubicación del usuario
		const userInfo = await client.request(readMe({ fields: ['ubicacion'] }));
		const tiendaUsuario = userInfo.ubicacion;

		if (!tiendaUsuario) {
			// throw new Error('No se pudo obtener la ubicación del usuario desde Directus.');
		}
		await syncRegisters(tiendaUsuario);
		// console.log('Sincronización crítica completada.');
	} catch (error) {
		// console.error('Error en sincronización crítica:', error);
	}
};

/**
 * Sincronizar datos desde Directus y guardarlos localmente
 */
// src/clients/syncData.js

const LAST_USER_SYNC_KEY = 'lastUserSync';

export const syncUsers = async () => {
	try {
		// Verificar si la tabla de usuarios está vacía
		const localUsers = await db.users.toArray();
		const isUsersTableEmpty = localUsers.length === 0;

		const lastSync = localStorage.getItem(LAST_USER_SYNC_KEY);
		const now = new Date().getTime();

		// Sincronizar usuarios si la tabla está vacía o si ha pasado más de 24 horas desde la última sincronización
		if (isUsersTableEmpty || !lastSync || now - parseInt(lastSync) > 24 * 60 * 60 * 1000) {
			// console.log('Iniciando sincronización de usuarios...');

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
			localStorage.setItem(LAST_USER_SYNC_KEY, now.toString()); // Guardar la fecha de la última sincronización
			// console.log('Usuarios sincronizados.');
		} else {
			// console.log('La sincronización de usuarios ya se realizó recientemente.');
		}
	} catch (error) {
		// console.error('Error sincronizando usuarios:', error);
	}
};
// Sincronizar eventos
const syncEvents = async () => {
	try {
		const eventos = await client.request(readItems('eventos', { fields: ['id', 'nombre'] }));
		await db.eventos.bulkPut(eventos);
		// console.log('Eventos sincronizados.');
	} catch (error) {
		// console.error('Error sincronizando eventos:', error);
	}
};

// Sincronizar empleados
const syncEmployees = async () => {
	try {
		const empleados = await getAllEmployees();
		await db.empleados.bulkPut(empleados);
		// console.log('Empleados sincronizados.');
	} catch (error) {
		// console.error('Error sincronizando empleados:', error);
	}
};

// Sincronizar registros
const syncRegisters = async tiendaUsuario => {
	try {
		const registros = await getRecentRegisters(tiendaUsuario);
		await db.registros.bulkPut(registros);
		await deleteRemovedRegisters(registros);
		// console.log('Registros sincronizados.');
	} catch (error) {
		// console.error('Error sincronizando registros:', error);
	}
};

// Sincronizar malla
const syncMesh = async () => {
	try {
		const malla = await getRecentMesh();
		await db.malla.bulkPut(malla);
		await deleteOldRecords();
		await deleteRemovedMesh(malla);
		// console.log('Malla sincronizada.');
	} catch (error) {
		// console.error('Error sincronizando malla:', error);
	}
};

// Sincronización no crítica
export const syncNonCriticalData = async () => {
	try {
		// console.log('Iniciando sincronización no crítica...');

		// Ejecutar tareas en paralelo (si no dependen unas de otras)
		await Promise.all([syncEvents(), syncEmployees()]);

		// Ejecutar tareas que dependen de otras en secuencia

		await syncMesh();

		// console.log('Sincronización no crítica completada.');
	} catch (error) {
		// console.error('Error en sincronización no crítica:', error);
	}
};
