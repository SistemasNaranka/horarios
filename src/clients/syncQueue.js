import { client } from './client';
import db from '../utils/localDB';
import { createItem, readItems } from '@directus/sdk';

export const syncPendingMesh = async () => {
	try {
		// 1. Obtener novedades pendientes de sincronización
		const pendingMesh = await db.malla.filter(novedad => novedad.syncPending === true).toArray();
		// console.log('Novedades pendientes:', pendingMesh);
		if (pendingMesh.length === 0) {
			// console.log('No hay novedades pendientes de sincronización.');
			return;
		}

		// console.log('Sincronizando', pendingMesh.length, 'novedades pendientes');

		// 2. Sincronizar cada novedad con Directus
		for (const novedad of pendingMesh) {
			try {
				// Preparar datos para Directus (convertir empleado objeto a ID)
				const directusData = {
					empleado: novedad.empleado.id,
					novedad: novedad.novedad,
					fecha: novedad.fecha,
					tienda: novedad.tienda,
					turno: null,
					observaciones: novedad.observaciones || null,
				};

				const result = await client.request(createItem('malla', directusData));

				// console.log('Novedad sincronizada:', result.id);

				// 3. Marcar como sincronizada en IndexedDB
				await db.malla.update(novedad.id, {
					syncPending: false,
				});
			} catch (error) {
				// console.error(`Error sincronizando novedad ${novedad.id}:`, error);
				// Opcional: Podrías implementar reintentos aquí
			}
		}

		// 4. Limpieza post-sincronización
		await cleanSyncedMesh();
	} catch (error) {
		// console.error('Error en el proceso de sincronización:', error);
	}
};

// Función mejorada para limpieza de datos sincronizados
const cleanSyncedMesh = async () => {
	try {
		// 1. Eliminar novedades marcadas como sincronizadas
		const syncedCount = await db.malla.filter(novedad => novedad.syncPending === false).toArray();
		if (syncedCount.length === 0) {
			// console.log('No hay novedades sincronizadas para eliminar.');
			return;
		}
		// console.log(`Eliminadas ${syncedCount} novedades sincronizadas`);

		for (const novedad of syncedCount) {
			await db.malla.delete(novedad.id);
			// console.log(`Eliminada novedad sincronizada ${novedad.id}`);
		}

		// console.log('Eliminación de registros sincronizados completada.');
	} catch (error) {
		// console.error('Error eliminando registros sincronizados:', error);
	}
};
export const deleteSyncedRegisters = async () => {
	try {
		// Obtener registros ya sincronizados
		const syncedRegisters = await db.registros
			.filter(registro => registro.syncPending === false) // Filtrar manualmente
			.toArray();

		if (syncedRegisters.length === 0) {
			// console.log('No hay registros sincronizados para eliminar.');
			return;
		}

		// console.log('Eliminando registros sincronizados:', syncedRegisters);

		// Eliminar cada registro sincronizado
		for (const registro of syncedRegisters) {
			await db.registros.delete(registro.id);
			// console.log('Registro eliminado de IndexedDB:', registro.id);
		}

		// console.log('Eliminación de registros sincronizados completada.');
	} catch (error) {
		// console.error('Error eliminando registros sincronizados:', error);
	}
};

const validateRegister = registro => {
	const requiredFields = ['evento', 'tienda', 'fecha', 'hora'];
	return requiredFields.every(field => registro[field] != null && registro[field] !== '');
};

export const syncPendingRegisters = async () => {
	try {
		// 1. Obtener registros pendientes de sincronización
		const pendingRegisters = await db.registros
			.filter(registro => registro.syncPending === true)
			.toArray();
		// console.log('Registros pendientes:', pendingRegisters);

		if (pendingRegisters.length === 0) {
			// console.log('No hay registros pendientes de sincronización.');
			return;
		}

		// console.log('Sincronizando', pendingRegisters.length, 'registros pendientes');

		// 2. Sincronizar cada registro con Directus
		for (const registro of pendingRegisters) {
			try {
				if (!validateRegister(registro)) {
					// console.error(`Registro ${registro.id} no válido, omitiendo sincronización.`);
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

				// console.log('Registro sincronizado:', result.id);

				// 3. Marcar como sincronizado en IndexedDB
				await db.registros.update(registro.id, {
					syncPending: false,
				});
			} catch (error) {
				// console.error(`Error sincronizando registro ${registro.id}:`, error);
			}
		}

		await deleteSyncedRegisters();
	} catch (error) {
		// console.error('Error en el proceso de sincronización:', error);
	}
};
