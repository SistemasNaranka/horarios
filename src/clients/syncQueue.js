import { client } from './client';
import db from '../utils/localDB';
import { createItem, readItems } from '@directus/sdk';

/**
 * @description Esta funcion se encarga de sincronizar los datos de la base de datos local con la base de datos principal de directus registros que no estan en la base de datos principal
 * @throws {Error} - Si hay un error al sincronizar los datos
 */
export const syncPendingMesh = async () => {
	try {
		const pendingMesh = await db.malla.filter(novedad => novedad.syncPending === true).toArray();

		if (pendingMesh.length === 0) {
			return;
		}

		for (const novedad of pendingMesh) {
			try {
				const directusData = {
					empleado: novedad.empleado.id,
					novedad: novedad.novedad,
					fecha: novedad.fecha,
					tienda: novedad.tienda,
					turno: null,
					observaciones: novedad.observaciones || null,
				};

				const result = await client.request(createItem('malla', directusData));

				await db.malla.update(novedad.id, {
					syncPending: false,
				});
			} catch (error) {}
		}

		await cleanSyncedMesh();
	} catch (error) {}
};

/**
 * @description Esta funcion se encarga de eliminar novedades que ya han sido sincronizadas
 */
const cleanSyncedMesh = async () => {
	try {
		const syncedCount = await db.malla.filter(novedad => novedad.syncPending === false).toArray();
		if (syncedCount.length === 0) {
			return;
		}
		for (const novedad of syncedCount) {
			await db.malla.delete(novedad.id);
		}
	} catch (error) {}
};

/**
 * @description Esta funcion se encarga de eliminar los registros que ya han sido sincronizados
 */
export const deleteSyncedRegisters = async () => {
	try {
		const syncedRegisters = await db.registros
			.filter(registro => registro.syncPending === false)
			.toArray();

		if (syncedRegisters.length === 0) {
			return;
		}

		for (const registro of syncedRegisters) {
			await db.registros.delete(registro.id);
		}
	} catch (error) {}
};

/**
 * @description Esta funcion se encarga de validar que los registros tengan todos los campos requeridos
 * @param {Object} registro - Objeto que contiene la informacion del registro
 * @returns {Boolean} - Retorna true si el registro es valido, false si no lo es
 */
const validateRegister = registro => {
	const requiredFields = ['evento', 'tienda', 'fecha', 'hora'];
	return requiredFields.every(field => registro[field] != null && registro[field] !== '');
};

/**
 * @description Esta funcion se encarga de sincronizar los registros que no han sido sincronizados solo registros que no tienen el campo syncPending en true
 * @throws {Error} - Si hay un error al sincronizar los registros
 */
export const syncPendingRegisters = async () => {
	try {
		const pendingRegisters = await db.registros
			.filter(registro => registro.syncPending === true)
			.toArray();

		if (pendingRegisters.length === 0) {
			return;
		}

		for (const registro of pendingRegisters) {
			try {
				if (!validateRegister(registro)) {
					continue;
				}

				const directusData = {
					empleado: registro.empleado.id,
					evento: registro.evento,
					tienda: registro.tienda,
					fecha: registro.fecha,
					hora: registro.hora,
					observaciones: registro.observaciones || null,
				};

				const result = await client.request(createItem('registros', directusData));

				await db.registros.update(registro.id, {
					syncPending: false,
				});
			} catch (error) {}
		}

		await deleteSyncedRegisters();
	} catch (error) {}
};
