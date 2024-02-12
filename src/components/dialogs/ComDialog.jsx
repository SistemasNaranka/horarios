import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	ListSubheader,
	MenuItem,
} from '@mui/material';
import { useFieldArray, useForm } from 'react-hook-form';
import { updateMesh } from '../../clients/mesh.client';
import { eventStore } from '../../stores/eventStore';
import { shiftStore } from '../../stores/shiftStore';
import { shopStore } from '../../stores/shopStore';
import { daysName } from '../../utils/constants';
import SelectInput from '../inputs/SelectInput';
import TableHis from '../tables/TableHis';

function ComDialog({ open, data, days, employee, handleClose, curLocation }) {
	const eventsList = eventStore(state => state.eventsList);
	const shopsList = shopStore(state => state.shopsList);
	const [stringShifts, shifts] = shiftStore(state => [state.stringShifts, state.shifts]);

	const { handleSubmit, control } = useForm({
		defaultValues: {
			days: days.reduce((prev, cur) => {
				const mesh = data.find(item => item.fecha === cur.format('YYYY-MM-DD'));
				if (mesh) {
					prev.push({
						value: mesh.novedad ? `n${mesh.novedad}` : mesh.turno,
						shop: curLocation,
						id: mesh.id,
					});
				} else {
					prev.push({});
				}
				return prev;
			}, []),
		},
	});

	const { fields } = useFieldArray({ control: control, name: 'days' });

	const onSubmit = formValues => {
		const formatData = formValues.days.reduce((acc, value, i) => {
			if (Object.keys(value).length > 0) {
				const oldItem = data.find(v => v.fecha === days[i].format('YYYY-MM-DD'));
				const changeShop = value.shop !== curLocation;
				const event = typeof value.value === 'string' ? Number(value.value.slice(1)) : null;
				const changeEvent = oldItem.novedad !== event;
				const shift = typeof value.value === 'number' ? value.value : null;
				const changeShift = oldItem.turno !== shift;
				if (changeEvent || changeShift || changeShop) {
					const item = { id: oldItem.id, fecha: oldItem.fecha };
					if (changeEvent) {
						item.novedad = event;
					}
					if (changeShift) {
						item.turno = shift;
					}
					if (changeShop) {
						item.tienda = value.shop;
					}
					acc.push(item);
				}
			}
			return acc;
		}, []);

		Promise.all(
			formatData.map(item => {
				const { id, ...update } = item;
				return updateMesh(id, update);
			}),
		).then(res => {
			handleClose(formatData);
		});
	};

	return (
		<Dialog open={open} onClose={() => handleClose()} maxWidth='xl'>
			<DialogTitle>Modificar turnos: {employee}</DialogTitle>
			<DialogContent className='text-center w-auto'>
				<TableHis titles={daysName} center overy={true}>
					<tr className='text-center'>
						{fields.map((field, index) => (
							<td key={field.id} className='py-1 px-2 whitespace-nowrap border-r w-1/12 z-0'>
								<div className='flex flex-wrap gap-2'>
									{data.find(item => item.fecha === days[index].format('YYYY-MM-DD')) && (
										<>
											<SelectInput
												control={control}
												label='Turno'
												name={`days.${index}.value`}
												key={field.id}
											>
												{shopsList
													.filter(shop => !shop.nombre.includes('Zona'))
													.map(shop => {
														return [
															<ListSubheader>{shop.nombre}</ListSubheader>,
															shifts.map((shift, i) => {
																const item = shift.turnos_tienda.find(
																	item => item.ubicaciones_id === shop.id,
																);
																return item ? (
																	<MenuItem value={shift.id} key={`day${index}-${i}`}>
																		{stringShifts[i]}
																	</MenuItem>
																) : null;
															}),
														];
													})}
												<ListSubheader>Novedades</ListSubheader>
												{eventsList.map(event => (
													<MenuItem value={`n${event.id}`} key={`day${index}-${event.nombre}`}>
														{event.nombre}
													</MenuItem>
												))}
											</SelectInput>
											<SelectInput
												control={control}
												name={`days.${index}.shop`}
												label='Tienda'
												key={index + 1000}
											>
												{shopsList.map(shop => (
													<MenuItem value={shop.id} key={`day${index}-${shop.id}`}>
														{shop.nombre}
													</MenuItem>
												))}
											</SelectInput>
										</>
									)}
								</div>
							</td>
						))}
					</tr>
				</TableHis>
			</DialogContent>
			<DialogActions
				sx={{
					display: 'flex',
					paddingX: '1.5rem',
				}}
			>
				<Button color='secondary' variant='contained' onClick={() => handleClose()}>
					Cancelar
				</Button>

				<Button color='success' variant='contained' onClick={handleSubmit(onSubmit)}>
					Guardar
				</Button>
			</DialogActions>
		</Dialog>
	);
}
export default ComDialog;
