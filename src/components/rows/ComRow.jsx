import { useState } from 'react';
import { eventStore } from '../../stores/eventStore';
import ComDialog from '../dialogs/ComDialog';
import { shiftStore } from '../../stores/shiftStore';

/**
 *
 * @param {Object} props
 * @param {Boolean} props.border
 * @param {String} props.employee
 * @param {Array<Dayjs>} props.days
 * @param {Number} props.curLocation
 * @param {Object} props.dataEmployee
 * @param {Number} props.weekIndex
 * @returns
 */
function ComRow({ border = false, dataEmployee, days, employee, curLocation, weekIndex }) {
	const events = eventStore(state => state.events);
	shiftStore(state => state.shifts);
	const [data, setData] = useState(dataEmployee);
	const [open, setOpen] = useState(false);

	const handleOpen = e => setOpen(true);

	const handleClose = (dataIn = []) => {
		if (dataIn.length > 0) {
			const filterData = data.map(item => {
				const e = dataIn.find(element => element.id === item.id);
				if (e) {
					if (e.tienda === item.tienda) {
						return { ...item, ...e };
					}
					return { ...item, fecha: '' };
				}
				return item;
			});
			console.log(filterData);
			setData(filterData);
		}
		setOpen(false);
	};

	const getBackgroundColor = weekIndex => {
		return weekIndex % 2 === 0 ? '' : 'bg-gray-100';
	};

	return (
		<>
			<tr
				className={`${getBackgroundColor(weekIndex)} hover:bg-gray-200 ${
					border && 'border-b-2'
				} text-sm cursor-pointer`}
				onClick={handleOpen}
				onKeyDown={handleOpen}
			>
				<td className=' p-4 whitespace-nowrap border-r-2 border-gray-300 border-l-2 font-semibold font-sans '>
					{employee}
				</td>
				{days.map(day => {
					const dayString = day.format('YYYY-MM-DD');
					const curRegister = data.find(value => value.fecha === dayString);
					const news = curRegister?.novedad;
					const shiftId = curRegister?.turno;
					const shiftDetails = shiftStore(state =>
						state.shiftsMap.get(shiftId)?.split(' ').slice(0, 3).join(' '),
					);
					return curRegister ? (
						news ? (
							<td
								className='py-3 px-2 whitespace-nowrap border-r-2 border-r-gray-300 font-sans  text-gray-950 text-base font-semibold'
								key={dayString + employee}
							>
								{events.get(news).nombre}
							</td>
						) : (
							<td
								className='py-3 px-2 whitespace-nowrap border-r-2 border-r-gray-300 font-semibold text-gray-700 text-base'
								key={dayString + employee}
							>
								{shiftDetails}
							</td>
						)
					) : (
						<td
							className='p-4 whitespace-nowrap border-r-2 border-gray-300'
							key={dayString + employee}
						>
							{''}
						</td>
					);
				})}
			</tr>
			{open && (
				<ComDialog
					open={open}
					handleClose={handleClose}
					data={data}
					days={days}
					employee={employee}
					curLocation={curLocation}
				/>
			)}
		</>
	);
}
export default ComRow;
