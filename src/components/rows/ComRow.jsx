import { useState } from 'react';
import { eventStore } from '../../stores/eventStore';
import ComDialog from '../dialogs/ComDialog';

function ComRow({ border = false, dataEmployee, days, employee, curLocation }) {
	const events = eventStore(state => state.events);
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

	return (
		<>
			<tr
				className={`hover:bg-gray-100 ${border && 'border-b-2'} text-sm cursor-pointer`}
				onClick={handleOpen}
				onKeyDown={handleOpen}
			>
				<td className='p-4 whitespace-nowrap border-r font-semibold font-sans'>{employee}</td>
				{days.map(day => {
					const dayString = day.format('YYYY-MM-DD');
					const curRegister = data.find(value => value.fecha === dayString);
					const news = curRegister?.novedad;
					const shift = curRegister?.turno;
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
						<td className='p-4 whitespace-nowrap border-r' key={dayString + employee}>
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
