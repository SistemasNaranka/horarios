import { Button, ListSubheader, MenuItem } from '@mui/material';
import { useState, useEffect } from 'react';
import { createMeshList } from '../../clients/mesh.client';
import { eventStore } from '../../stores/eventStore';
import { shiftStore } from '../../stores/shiftStore';
import { roleStore } from '../../stores/roleStore';
import successAlert from '../alerts/SuccessAlert';
import SelectInput from '../inputs/SelectInput';
import dayjs from 'dayjs';
import errorAlert from '../alerts/ErrorAlert';
import useConnectionStore from '../../stores/connectionStore';
function WeekInputRow({
	daysInWeek,
	name = '',
	cc,
	control,
	i,
	getValues,
	setValue,
	dataEmployee,
}) {
	const shifts = shiftStore(state => state.shifts);
	const location = roleStore(state => state.location);
	const eventsList = eventStore(state => state.eventsList);
	const shiftsMap = shiftStore(state => state.shiftsMap);
	const events = eventStore(state => state.events);
	const { isOnline } = useConnectionStore();
	const [allDaysFilled, setAllDaysFilled] = useState(false);
	const [localUpdates, setLocalUpdates] = useState([]);

	const isTodayOrFuture = day => {
		return dayjs(day).isSame(dayjs(), 'day') || dayjs(day).isAfter(dayjs(), 'day');
	};

	const handleChange = (dayIndex, value) => {
		const dayString = daysInWeek[dayIndex].format('YYYY-MM-DD');
		setValue(`mesh.${i}.${dayString}`, value);

		if (typeof value === 'number') {
			for (let j = dayIndex + 1; j < daysInWeek.length; j++) {
				const nextDayString = daysInWeek[j].format('YYYY-MM-DD');
				setValue(`mesh.${i}.${nextDayString}`, value);
			}
		}
	};

	useEffect(() => {
		const checkFilledDays = () => {
			const futureDays = daysInWeek.filter(day => isTodayOrFuture(day));
			const allFilled = futureDays.every(day => {
				const dayString = day.format('YYYY-MM-DD');
				const registro = [...dataEmployee, ...localUpdates].find(v => v.fecha === dayString);
				return registro?.turno || registro?.novedad;
			});
			setAllDaysFilled(allFilled);
		};

		checkFilledDays();
	}, [daysInWeek, dataEmployee, i, localUpdates]);

	const onSubmit = () => {
		const values = Object.entries(getValues(`mesh.${i}`));
		const mesh = values.reduce((a, [fecha, valor]) => {
			if ((typeof valor === 'string' && valor.length > 0) || valor > 0) {
				a.push({
					empleado: isOnline ? cc : { id: cc, nombre: name },
					fecha,
					tienda: location,
					...(typeof valor === 'number' && { turno: valor }),
					...(typeof valor === 'string' && { novedad: Number(valor.slice(1)) }),
					observaciones: null,
				});
			}
			return a;
		}, []);

		if (mesh.length > 0) {
			Promise.all(mesh.map(item => createMeshList(item)))
				.then(() => {
					successAlert();
					setLocalUpdates(prev => [...prev, ...mesh]);
					for (const { fecha } of mesh) {
						setValue(`mesh.${i}.${fecha}`, '');
					}
				})
				.catch(err => errorAlert('Error al guardar'));
		}
	};

	return (
		<tr>
			<td className='py-3 px-3 min-h-[80px] w-auto whitespace-normal break-words text-start border-r-2 border-b-2 border-gray-300 font-sans border-l-2'>
				<div className='flex justify-between w-full'>
					<p className={`my-auto ${allDaysFilled ? 'font-bold text-base' : 'font-medium text-lg'}`}>
						{name}
					</p>
				</div>
			</td>
			{daysInWeek.map((day, index) => {
				const dayString = day.format('YYYY-MM-DD');
				const isPast = dayjs(day).isBefore(dayjs(), 'day');
				const registro = [...dataEmployee, ...localUpdates].find(v => v.fecha === dayString);

				if (isPast || registro) {
					return (
						<td
							key={dayString}
							className='py-2 px-4 whitespace-normal break-words border-r-2 w-auto border-gray-300 border-b-2'
						>
							{registro?.novedad ? (
								<div className='font-semibold text-gray-950'>
									{events.get(registro.novedad)?.nombre}
								</div>
							) : registro?.turno ? (
								<div className='w-auto px-2'>{shiftsMap.get(registro.turno)}</div>
							) : (
								<div className='text-gray-600 font-bold text-base px-1'>Sin información</div>
							)}
						</td>
					);
				}

				return (
					<td
						key={dayString}
						className='py-2 px-3 whitespace-normal break-words border-b-2 border-r-2 border-gray-300 w-auto z-0'
					>
						<div className='w-full'>
							<SelectInput
								control={control}
								label='Turno'
								name={`mesh.${i}.${dayString}`}
								key={dayString}
								onChange={e => handleChange(index, e.target.value)}
							>
								<ListSubheader>Turnos</ListSubheader>
								{shifts.length === 0 ? (
									<MenuItem disabled value=''>
										No hay turnos disponibles
									</MenuItem>
								) : (
									shifts.map((shift, i) => (
										<MenuItem
											value={shift.turno.id}
											key={`day${index}-${i}`}
											style={{ whiteSpace: 'normal' }}
										>
											{shiftStore.getState().stringShifts[i]}
										</MenuItem>
									))
								)}
								<ListSubheader>Novedades</ListSubheader>
								{eventsList.map(event => (
									<MenuItem
										value={`n${event.id}`}
										key={`nday${event.id}`}
										style={{ whiteSpace: 'normal' }}
									>
										{event.nombre}
									</MenuItem>
								))}
							</SelectInput>
						</div>
					</td>
				);
			})}
			{!allDaysFilled && (
				<td className='border-r-2 text-center px-6 border-b-2 border-gray-300 border-t-2'>
					<Button color='success' variant='contained' onClick={onSubmit}>
						Guardar
					</Button>
				</td>
			)}
		</tr>
	);
}

export default WeekInputRow;
