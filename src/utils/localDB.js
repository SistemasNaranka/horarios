import Dexie from 'dexie';

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
		return trans.registros.toCollection().modify(registro => {
			if (registro.syncPending === undefined) {
				registro.syncPending = false;
			}
		});
	});

export default db;
