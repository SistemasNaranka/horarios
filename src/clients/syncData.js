// src/clients/syncData.js

import { client } from './client';
import db from '../utils/localDB';
import { readUsers, readMe, readItems } from '@directus/sdk';
import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import { syncPendingMesh, syncPendingRegisters } from './syncQueue';

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
 * Obtener los registros de los últimos 2 días
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
 * Obtener los datos de malla de los próximos 7 días
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

const deleteOldRecords = async () => {
	try {
		const twoDaysAgo = dayjs().subtract(2, 'day').format('YYYY-MM-DD');
		const sevenDaysAgo = dayjs().subtract(7, 'day').format('YYYY-MM-DD');

		await db.registros.where('fecha').below(twoDaysAgo).delete();

		await db.malla.where('fecha').below(sevenDaysAgo).delete();
	} catch (error) {}
};
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

/**
 * Sincronizar datos desde Directus y guardarlos localmente
 */

const LAST_USER_SYNC_KEY = 'lastUserSync';

export const syncUsers = async () => {
	try {
		const localUsers = await db.users.toArray();
		const isUsersTableEmpty = localUsers.length === 0;

		const lastSync = localStorage.getItem(LAST_USER_SYNC_KEY);
		const now = new Date().getTime();

		if (isUsersTableEmpty || !lastSync || now - parseInt(lastSync) > 24 * 60 * 60 * 1000) {
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
		}
	} catch (error) {}
};
// Sincronizar eventos
const syncEvents = async () => {
	try {
		const eventos = await client.request(readItems('eventos', { fields: ['id', 'nombre'] }));
		await db.eventos.bulkPut(eventos);
	} catch (error) {}
};

// Sincronizar empleados
const syncEmployees = async () => {
	try {
		const empleados = await getAllEmployees();
		await db.empleados.bulkPut(empleados);
	} catch (error) {}
};

// Sincronizar registros
const syncRegisters = async tiendaUsuario => {
	try {
		const registros = await getRecentRegisters(tiendaUsuario);
		await db.registros.bulkPut(registros);
		await deleteRemovedRegisters(registros);
	} catch (error) {}
};

// Sincronizar malla
const syncMesh = async () => {
	try {
		const malla = await getRecentMesh();
		await db.malla.bulkPut(malla);
		await deleteOldRecords();
		await deleteRemovedMesh(malla);
	} catch (error) {}
};

export const syncNonCriticalData = async () => {
	try {
		await Promise.all([syncEvents(), syncEmployees()]);

		await syncMesh();
	} catch (error) {}
};
