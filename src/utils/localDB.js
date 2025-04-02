// src/utils/localDB.js

import Dexie from 'dexie';

// Crear una base de datos local con Dexie
const db = new Dexie('LocalDB');
db.version(2)
	.stores({
		users: 'email, password, role, ubicacion',
		eventos: 'id, nombre',
		empleados: 'id, nombre, tienda, estado',
		malla: 'id, fecha, turno, novedad, observaciones, empleado, tienda, syncPending',
		registros: 'id, evento, fecha, hora, observaciones, empleado, tienda, syncPending',
	})
	.upgrade(trans => {
		// Migración: agregar syncPending a los registros existentes
		return trans.registros.toCollection().modify(registro => {
			if (registro.syncPending === undefined) {
				registro.syncPending = false; // Valor predeterminado
			}
		});
	});

export default db;
