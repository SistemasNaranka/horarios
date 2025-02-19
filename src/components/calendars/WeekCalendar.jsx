import { useFieldArray, useForm } from 'react-hook-form';
import { employeeStore } from '../../stores/employeeStore';
import { daysName } from '../../utils/constants';
import { setColorWeek } from '../../utils/functions';
import WeekInputRow from '../rows/WeekInputRow';
import TableHis from '../tables/TableHis';

const titles = ['Nombre', ...daysName, ''];

/**
 *
 * @param {Object} props
 * @param {Dayjs} props.day
 * @param {Array} props.data
 * @param {Array} props.holidays
 * @param {Array<Dayjs>} props.days
 * @returns
 */
function WeekCalendar({ days, day, holidays, data }) {
	const employees = employeeStore(state => state.employees);
	const { getValues, control, setValue } = useForm({
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
				<td className='py-3 px-2 text-xl whitespace-nowrap border-2 border-gray-300 font-medium'>
					{`Semana ${days[0].week()}`}
				</td>
				{days.map(dayItem => (
					<td
						className={`py-3 px-2 text-xl whitespace-nowrap  border-2 border-gray-300 font-medium ${setColorWeek(
							day,
							dayItem,
							holidays,
						)}`}
						key={`day_${dayItem}`}
					>
						{dayItem.format('YYYY-MM-DD')}
					</td>
				))}
			</tr>
			{fields.map((field, i) => (
				<WeekInputRow
					control={control}
					i={i}
					getValues={getValues}
					setValue={setValue}
					key={field.id}
					daysInWeek={days}
					name={employees[i].nombre}
					cc={employees[i].id}
					dataEmployee={data?.filter(value => value.empleado.id === employees[i].id)}
				/>
			))}
		</TableHis>
	);
}
export default WeekCalendar;
