import { useFieldArray, useForm } from 'react-hook-form';
import { employeeStore } from '../../stores/employeeStore';
import { roleStore } from '../../stores/roleStore';
import { daysName } from '../../utils/constants';
import { setColorWeek } from '../../utils/functions';
import MonthRow from '../rows/MonthRow';
import WeekInputRow from '../rows/WeekInputRow';
import TableHis from '../tables/TableHis';

const titles = ['Nombre', ...daysName, ''];

/**
 *
 * @param {Object} props
 * @param {Array<Dayjs>} props.days
 * @param {Array} props.holidays
 * @param {Array} props.data
 * @param {Dayjs} props.day
 * @returns
 */
function WeekCalendar({ days, day, holidays, data }) {
	const employees = employeeStore(state => state.employees);
	const { getValues, control } = useForm({
		defaultValues: {
			mesh: employees.map(e => ({
				...days.reduce((a, v) => {
					a[v.format('YYYY-MM-DD')] = '';
					return a;
				}, {}),
			})),
		},
	});

	const { fields } = useFieldArray({ control: control, name: 'mesh' });

	return (
		<TableHis titles={titles} center h={60}>
			<tr>
				<td className='py-3 px-2 text-xl whitespace-nowrap border-r border-b font-medium'>
					{`Semana ${days[0].week()}`}
				</td>
				{days.map(dayItem => (
					<td
						className={`py-3 px-2 text-xl whitespace-nowrap border-r border-b font-medium ${setColorWeek(
							day,
							dayItem,
							holidays,
						)}`}
						key={`day_${dayItem}`}
					>
						{dayItem.format('YYYY-MM-DD')}
					</td>
				))}
				<td className='py-3 px-2 text-xl whitespace-nowrap border-r border-b font-medium' />
			</tr>
			{fields.map((field, i) =>
				data?.find(value => value.empleado.id === employees[i].id) ? (
					<MonthRow
						key={field.id}
						border
						days={days}
						dataEmployee={data.filter(value => value.empleado.id === employees[i].id)}
						employee={employees[i].nombre}
					/>
				) : (
					<WeekInputRow
						control={control}
						i={i}
						getValues={getValues}
						key={field.id}
						daysInWeek={days}
						name={employees[i].nombre}
						cc={employees[i].id}
					/>
				),
			)}
		</TableHis>
	);
}
export default WeekCalendar;
