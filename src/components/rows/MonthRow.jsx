import { Dayjs } from 'dayjs';
import { eventStore } from '../../stores/eventStore';

/**
 *
 * @param {Object} props
 * @param {Boolean} props.border
 * @param {Object} props.dataEmployee
 * @param {Array<Dayjs>} props.days
 * @param {String} props.employee
 * @returns
 */
function MonthRow({ border = false, dataEmployee, days, employee }) {
	const events = eventStore(state => state.events);
	return (
		<tr className={`hover:bg-gray-100 ${border && 'border-b'}`}>
			<td className='py-3 px-2 whitespace-nowrap border-r font-semibold text-left font-sans'>
				{employee}
			</td>
			{days.map((day, i) => {
				const dayString = day.format('YYYY-MM-DD');
				const curRegister = dataEmployee.find(value => value.fecha === dayString);
				const shift = curRegister?.turno;
				const news = curRegister?.novedad;
				return curRegister ? (
					news ? (
						<td
							className='py-3 px-2 whitespace-nowrap border-r font-sans'
							key={dayString + employee}
						>
							{events.get(news).nombre}
						</td>
					) : (
						<td className='py-3 px-2 whitespace-nowrap border-r' key={dayString + employee}>
							T{shift}
						</td>
					)
				) : (
					<td className='py-3 px-2 whitespace-nowrap border-r' key={dayString + employee}>
						{''}
					</td>
				);
			})}
		</tr>
	);
}
export default MonthRow;
