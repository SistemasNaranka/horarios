import { daysName } from '../../utils/constants';
import { setColor } from '../../utils/functions';
import TableHis from '../tables/TableHis';

const titles = ['Nombre', ...daysName];

/**
 *
 * @param {Object} props
 * @param {Array<Dayjs>} props.dayjs
 * @param {Array<String>} props.holidays
 * @param {Array<Number>} props.weeksCalendar
 * @param {Dayjs} props.curDay
 * @param {String} props.curLocation
 * @param {ReactNode} props.weekComponent
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
	return (
		<TableHis titles={titles} center overy h={65}>
			{weeksCalendar.map(week => {
				return [
					<tr
						key={`row_${week}`}
						className={dataWeek.employeeWeek[week].length === 0 ? 'border-b' : ''}
					>
						<td className='border-r min-w-[205.5px]'>{''}</td>
						{days.slice(week * 7, week * 7 + 7).map(day => (
							<td
								className={`py-3 px-2 whitespace-nowrap border-r font-semibold text-3xl min-w-[205.5px] ${setColor(
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
					dataWeek.employeeWeek[week].map((employee, index) =>
						index === dataWeek.employeeWeek[week].length - 1 ? (
							<WeekComponent
								border
								key={`table_${week}-${index}`}
								employee={employee}
								days={days.slice(week * 7, week * 7 + 7)}
								curLocation={curLocation}
								dataEmployee={dataWeek.dataForWeek[week].filter(
									value => employee === value.empleado.nombre,
								)}
							/>
						) : (
							<WeekComponent
								key={`table_${week}-${index}`}
								days={days.slice(week * 7, week * 7 + 7)}
								employee={employee}
								curLocation={curLocation}
								dataEmployee={dataWeek.dataForWeek[week].filter(
									value => employee === value.empleado.nombre,
								)}
							/>
						),
					),
				];
			})}
		</TableHis>
	);
}
export default MonthCalendar;
