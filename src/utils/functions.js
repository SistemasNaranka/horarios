import { Dayjs } from 'dayjs';
import { today } from './constants';

/**
 *
 * @param {Dayjs} curDay
 * @param {Dayjs} day
 * @param {Array<String>} holidays
 * @returns
 */
export const setColorWeek = (curDay, day, holidays) => {
	let styles = '';
	if (day.day() === 0 || holidays.find(value => value.date === day.format('DD/MM/YYYY', 'day'))) {
		styles = styles.concat('text-red-400');
	}
	if (curDay.month() === day.month()) {
		if (curDay.get('D') === day.get('D') && curDay.month() === today.month())
			styles = styles.concat(' bg-sky-200');
	}
	return styles;
};

/**
 *
 * @param {Dayjs} curDay
 * @param {Dayjs} day
 * @param {Array} holidays
 * @returns
 */
export const setColor = (curDay, day, holidays) => {
	let styles = '';
	if (day.get('day') === 0 || holidays.find(value => value.date === day.format('DD/MM/YYYY'))) {
		styles = styles.concat('text-red-400');
	}
	if (curDay.get('month') === day.get('month')) {
		if (curDay.date() === day.date() && curDay.month() === today.month())
			styles = styles.concat(' bg-sky-200');
	} else {
		styles = styles.concat(' text-gray-400');
	}
	return styles;
};

/**
 *
 * @param {Array} arr
 * @param {Number} n
 * @returns
 */
const chunkIntoN = (arr, n) => {
	const size = Math.ceil(arr.length / n);
	return Array.from({ length: n }, (v, i) => arr.slice(i * size, i * size + size));
};

/**
 *
 * @param {Number} weeks
 * @param {Array<Dayjs>} days
 * @param {Array} data
 * @returns
 */
export const processDataRegisters = (weeks, days, data) => {
	const daysText = chunkIntoN(
		days.map(value => value),
		weeks,
	);
	const dataForWeek = daysText.map((value, i) =>
		data.filter(item => value.find(d => d.format('YYYY-MM-DD') === item.fecha)),
	);
	const employeeWeek = [...Array(weeks).keys()].map((value, i) => [
		...new Set(dataForWeek[i].map(item => item.empleado.nombre)),
	]);
	return { dataForWeek, employeeWeek };
};
