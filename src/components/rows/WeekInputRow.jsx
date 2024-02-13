import { Button, ListSubheader, MenuItem } from '@mui/material';
import { useState } from 'react';
import { createMeshList } from '../../clients/mesh.client';
import { eventStore } from '../../stores/eventStore';
import { shiftStore } from '../../stores/shiftStore';
import { roleStore } from '../../stores/roleStore';
import successAlert from '../alerts/SuccessAlert';
import SelectInput from '../inputs/SelectInput';

/**
 *
 * @param {Object} props
 * @param {String} props.cc
 * @param {String} props.name
 * @param {any} props.control
 * @param {any} props.register
 * @param {Array<Dayjs>} props.daysInWeek
 * @returns
 */
function WeekInputRow({ daysInWeek, name = '', cc, control, i, getValues }) {
	const shifts = shiftStore(state => state.shifts);
	const location = roleStore(state => state.location);
	const eventsList = eventStore(state => state.eventsList);
	const [disabled, setDisabled] = useState(shifts.length > 0 ? false : true);
	const onSubmit = () => {
		const values = Object.entries(getValues(`mesh.${i}`));
		const mesh = values.reduce((a, v) => {
			if ((typeof v[1] === 'string' && v[1].length > 0) || v[1] > 0) {
				a.push({
					empleado: cc,
					fecha: v[0],
					tienda: location,
					...(typeof v[1] === 'number' && { turno: v[1] }),
					...(typeof v[1] === 'string' && { novedad: Number(v[1].slice(1)) }),
				});
			}
			return a;
		}, []);
		if (mesh.length > 0) {
			createMeshList(mesh)
				.then(() => {
					successAlert();
					setDisabled(true);
				})
				.catch(err => errorAlert('Hubo error guardando la pausa'));
		}
	};

	return (
		<tr>
			<td className='py-4 px-2 min-h-[85px] whitespace-nowrap border-r border-b font-sans'>
				<div className='flex justify-between w-full'>
					<p className='my-auto font-medium text-xl'>{name}</p>
				</div>
			</td>
			{daysInWeek.map((day, index) => (
				<td key={day} className={'py-3 px-4 whitespace-nowrap border-b border-r w-1/12 z-0'}>
					<div className='flex'>
						<SelectInput
							control={control}
							label='Turno'
							disabled={disabled}
							name={`mesh.${i}.${day.format('YYYY-MM-DD')}`}
							key={day}
						>
							<ListSubheader>Turnos</ListSubheader>
							{shifts.map((shift, i) => (
								<MenuItem value={shift.id} key={`day${index}-${i}`}>
									{i + 1}
								</MenuItem>
							))}
							<ListSubheader>Novedades</ListSubheader>
							{eventsList.map(event => (
								<MenuItem value={`n${event.id}`} key={`nday${event.id}`}>
									{event.nombre}
								</MenuItem>
							))}
						</SelectInput>
					</div>
				</td>
			))}
			<td className='border-r text-center border-b'>
				<Button color='success' variant='contained' onClick={onSubmit} disabled={disabled}>
					Guardar
				</Button>
			</td>
		</tr>
	);
}

export default WeekInputRow;
