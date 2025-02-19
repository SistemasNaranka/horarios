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
 * @param {Number} props.weekIndex
 * @returns
 */
function MonthRow({ border = false, dataEmployee, days, employee, weekIndex }) {
	const events = eventStore(state => state.events);
	const shiftsMap = shiftStore(state => state.shiftsMap);
	const getBackgroundColor = weekIndex => {
		return weekIndex % 2 === 0 ? '' : 'bg-gray-100';
	};

	return (
		<tr className={`${getBackgroundColor(weekIndex)} hover:bg-gray-200 ${border && 'border-b'}`}>
			<td className='py-3 px-2 whitespace-nowrap border-r-2 border-l-2 border-gray-300 font-semibold text-left font-sans'>
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
							className='py-3 px-2 whitespace-nowrap border-r-2 border-l-2 border-gray-300 font-sans text-gray-950 font-semibold'
							key={dayString + employee}
						>
							{events.get(news).nombre}
						</td>
					) : (
						<td
							className='py-4 px-2 whitespace-nowrap border-r-2 border-l-2 border-gray-300 font-sans text-gray-900 font-semibold'
							key={dayString + employee}
						>
							<HtmlTooltip
								title={
									<>
										<p className=' text-lg'>{shiftsMap.get(shift)}</p>
									</>
								}
							>
								<div className='text-gray-700 font-semibold text-base'>
									{shiftsMap.get(shift)?.split(' ').slice(0, 3).join(' ')}
								</div>
							</HtmlTooltip>
						</td>
					)
				) : (
					<td
						className='py-3 px-2 whitespace-nowrap border-r-2 border-l-2 border-gray-300'
						key={dayString + employee}
					>
						{''}
					</td>
				);
			})}
		</tr>
	);
}

export default memo(MonthRow);
