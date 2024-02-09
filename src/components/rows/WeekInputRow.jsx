import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ControlPointDuplicateIcon from '@mui/icons-material/ControlPointDuplicate';
import { Button, ListSubheader, MenuItem, Tooltip } from '@mui/material';
import SelectInput from '../inputs/SelectInput';
import { roleStore } from '../../stores/roleStore';
import { createMeshList } from '../../clients/mesh.client';
import { eventStore } from '../../stores/eventStore';
import successAlert from '../alerts/SuccessAlert';

const itemClass = 'py-3 px-4 whitespace-nowrap border-b border-r w-1/12 z-0';
const lastClass = 'py-3 px-4 whitespace-nowrap border-r w-1/12 z-0';

/**
 *
 * @param {Object} props
 * @param {Array<Dayjs>} props.daysInWeek
 * @param {String} props.name
 * @param {String} props.cc
 * @param {any} props.control
 * @param {any} props.register
 * @returns
 */
function WeekInputRow({ daysInWeek, name = '', cc, control, i, getValues }) {
	const location = roleStore(state => state.location);
	const eventsList = eventStore(state => state.eventsList);
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
				.then(successAlert)
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
							name={`mesh.${i}.${day.format('YYYY-MM-DD')}`}
							key={day}
						>
							<ListSubheader>Turnos</ListSubheader>
							<MenuItem value={1} key={`day${index}`}>
								1
							</MenuItem>
							<ListSubheader>Novedades</ListSubheader>
							{eventsList.map(event => (
								<MenuItem value={`n${event.id}`} key={`nday${index}`}>
									{event.nombre}
								</MenuItem>
							))}
						</SelectInput>
					</div>
				</td>
			))}
			<td className='border-r text-center border-b '>
				<Button color='success' variant='contained' onClick={onSubmit}>
					Guardar
				</Button>
			</td>
		</tr>
	);
}

export default WeekInputRow;
