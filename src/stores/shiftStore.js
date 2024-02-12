import { create } from 'zustand';
import dayjs from 'dayjs';

export const shiftStore = create(set => ({
	shifts: [],
	shiftsMap: new Map(),
	stringShifts: [],
	setShifts: data => {
		const shifts = data.map(shift => ({
			...shift,
			inicio_turno: dayjs(`1/1/1 ${shift.inicio_turno}`).format('hh:mmA'),
			final_turno: dayjs(`1/1/1 ${shift.final_turno}`).format('hh:mmA'),
		}));
		const stringShifts = shifts.map(item => shiftToString(item));
		const shiftsMap = new Map(stringShifts.map((v, i) => [shifts[i].id, v]));
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
