import { Dayjs } from 'dayjs';
import { memo } from 'react';
import { eventStore } from '../../stores/eventStore';
import { shiftStore } from '../../stores/shiftStore';
import HtmlTooltip from '../alerts/HtmlTooltip';

/**
 *
 * @param {Object} props
 * @param {Boolean} props.border
 * @param {String} props.employee
 * @param {Array<Dayjs>} props.days
 * @param {Object} props.dataEmployee
 * @returns
 */
function MonthRow({ border = false, dataEmployee, days, employee }) {
	const events = eventStore(state => state.events);
	const shiftsMap = shiftStore(state => state.shiftsMap);

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
							<HtmlTooltip
								title={
									<>
										<p className=' text-lg'>{shiftsMap.get(shift)}</p>
									</>
								}
							>
								<div>T{shift}</div>
							</HtmlTooltip>
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
export default memo(MonthRow);
