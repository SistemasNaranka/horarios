import { create } from 'zustand';
import dayjs from 'dayjs';

export const shiftStore = create(set => ({
	shifts: [],
	shiftsMap: new Map(),
	stringShifts: [],
	setShifts: data => {
		const shifts = data.map(item => ({
			turno: {
				...item.turno,
				inicio_turno: dayjs(`1/1/1 ${item.turno.inicio_turno}`).format('hh:mmA'),
				final_turno: dayjs(`1/1/1 ${item.turno.final_turno}`).format('hh:mmA'),
			},
			ubicacion: item.ubicacion,
		}));

		const stringShifts = shifts.map(item => shiftToString(item.turno));
		const shiftsMap = new Map(stringShifts.map((v, i) => [shifts[i].turno.id, v]));
		set(() => ({ shifts, stringShifts, shiftsMap }));
	},
}));

/**
 *
 * @param {*} shift
 * @returns {String}
 */
export const shiftToString = shift =>
	`${shift.inicio_turno} - ${shift.final_turno} ${shift.tiempo_laborado}L-${shift.tiempo_almuerzo}A`;
