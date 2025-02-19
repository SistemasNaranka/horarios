import { memo } from 'react';
import { daysName } from '../../utils/constants';
import { setColor } from '../../utils/functions';
import TableHis from '../tables/TableHis';

const titles = ['Nombre', ...daysName];

/**
 *
 * @param {Object} props
 * @param {Dayjs} props.curDay
 * @param {Array<Dayjs>} props.dayjs
 * @param {String} props.curLocation
 * @param {Array<String>} props.holidays
 * @param {ReactNode} props.weekComponent
 * @param {Array<Number>} props.weeksCalendar
 * @returns
 */
function MonthCalendar({
	days,
	holidays,
	weeksCalendar,
	curDay,
	curLocation,
	weekComponent: WeekComponent,
	dataWeek,
}) {
	const getBackgroundColor = weekIndex => {
		return weekIndex % 2 === 0 ? '' : 'bg-gray-100';
	};

	return (
		<TableHis titles={titles} center overy h={83}>
			{weeksCalendar.map((week, weekIndex) => {
				return [
					<tr
						key={`row_${week}`}
						className={`${getBackgroundColor(weekIndex)} ${
							dataWeek.employeeWeek[week].length === 0 ? 'border-b' : ''
						}`}
					>
						<td className='border-t-2 border-r-2 border-gray-300 border-l-2 w-1/12'>{''}</td>
						{days.slice(week * 7, week * 7 + 7).map(day => (
							<td
								className={`py-3 px-3 whitespace-nowrap border-t-2 border-r-2 border-gray-300 font-medium text-3xl w-1/12 ${setColor(
									curDay,
									day,
									holidays,
								)}`}
								key={`day_${day.format('DD')}`}
							>
								{day.format('DD')}
							</td>
						))}
					</tr>,
					dataWeek.employeeWeek[week].map((employee, index) => (
						<WeekComponent
							key={`table_${week}-${index}`}
							days={days.slice(week * 7, week * 7 + 7)}
							employee={employee}
							curLocation={curLocation}
							dataEmployee={dataWeek.dataForWeek[week].filter(
								value => employee === value.empleado.nombre,
							)}
							weekIndex={weekIndex}
						/>
					)),
				];
			})}
		</TableHis>
	);
}

export default memo(MonthCalendar);
