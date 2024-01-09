import dayjs from 'dayjs';

export const events = {
	init: 'Comenzar Jornada',
	lunch: 'Iniciar Almuerzo',
	endLunch: 'Finalizar Almuerzo',
	end: 'Terminar Jornada',
};

export const eventsList = [
	'Comenzar Jornada',
	'Iniciar Almuerzo',
	'Finalizar Almuerzo',
	'Terminar Jornada',
];

export const news = [
	'Ausencia',
	'Calamidad',
	'Descanso',
	'Dia de la familia',
	'Incapacidad',
	'Licencia de maternidad',
	'Permiso',
	'Retiro',
	'Suspensión',
	'Vacaciones',
];

export const breaks = [
	'Iniciar Pausa Activa',
	'Terminar Pausa Activa',
	'Salir al baño',
	'Regresar del baño',
];

export const today = dayjs();

export const daysName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const limitPage = 50;
