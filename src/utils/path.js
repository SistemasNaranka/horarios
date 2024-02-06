export const HOME_PATH = '/home';
export const NEW = '/new';
export const EDIT = '/edit';

export const NEWS_RELATIVE = '/news';
export const NEWS_PATH = HOME_PATH + NEWS_RELATIVE;

export const HISTORY_RELATIVE = '/history';
export const HISTORY_PATH = HOME_PATH + HISTORY_RELATIVE;

export const MESH_RELATIVE = '/mesh';
export const MESH_WEEK_RELATIVE = '/week';
export const MESH_PATH = HOME_PATH + MESH_RELATIVE;
export const MESH_WEEK_PATH = HOME_PATH + MESH_WEEK_RELATIVE;

export const PAGES_ROLE = {
	simple: [{ title: 'Registros', id: HOME_PATH }],
	almacenes: [
		{ title: 'Registros', id: HOME_PATH },
		{ title: 'Novedades', id: NEWS_PATH },
		{ title: 'Historial', id: HISTORY_PATH },
		{ title: 'Malla Horaria', id: MESH_PATH },
	],
	Comercial: [
		{ title: 'Malla Horaria', id: HOME_PATH },
		{ title: 'Personal temporal', id: MESH_PATH },
	],
};
