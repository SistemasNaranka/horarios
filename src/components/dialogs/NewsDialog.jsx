import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	MenuItem,
	TextField,
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { memo } from 'react';
import dayjs from 'dayjs';
import { createMeshList, removeMeshQuery } from '../../clients/mesh.client';
import { dateEventSchema } from '../../schemas/eventSchema';
import DatePickerInput from '../inputs/DatePickerInput';
import { eventStore } from '../../stores/eventStore';
import { roleStore } from '../../stores/roleStore';
import successAlert from '../alerts/SuccessAlert';
import SelectInput from '../inputs/SelectInput';
import errorAlert from '../alerts/ErrorAlert';
import useConnectionStore from '../../stores/connectionStore';

const today = dayjs();

/**
 *
 * @param {Object} props
 * @param {String} props.cc
 * @param {String} props.name
 * @param {Boolean} props.open
 * @param {Function} props.onClose
 * @param {Function} props.addNews
 * @returns
 */
const NewsDialog = ({ name = '', open = false, onClose, addNews, cc }) => {
	const location = roleStore(state => state.location);
	const events = eventStore(state => state.eventsList);
	const { isOnline } = useConnectionStore();
	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
		reset,
	} = useForm({
		resolver: yupResolver(dateEventSchema),
		defaultValues: {
			time: today,
			event: 1,
		},
	});

	const onSubmit = async data => {
		onClose();
		const list = [];
		const todayDate = today.format('YYYY-MM-DD');
		const lastDate = data.time.format('YYYY-MM-DD');

		try {
			for (let index = 0; index < data.time.diff(today, 'day', true) + 1; index++) {
				const fecha = today.add(index, 'day').format('YYYY-MM-DD');

				const novedadData = {
					empleado: {
						id: cc,
						nombre: name,
					},
					novedad: data.event,
					fecha,
					tienda: location,
					turno: null,
					...(data.review && { observaciones: data.review }),
				};

				list.push(novedadData);
			}

			await removeMeshQuery(todayDate, lastDate, cc);
			await Promise.all(list.map(createMeshList));

			successAlert();
			addNews(cc);
		} catch (error) {
			errorAlert('Hubo error guardando la novedad');
			console.error('Error:', error);
		} finally {
			reset({ time: today, event: 1 });
		}
	};
	const handleClose = () => {
		onClose();
		reset({
			time: today,
			event: 1,
		});
	};

	return (
		<Dialog open={open} onClose={handleClose} keepMounted={false}>
			<DialogTitle>Reporta una novedad</DialogTitle>
			<DialogContent>
				<DialogContentText>Seleccione la novedad presentada para {name}:</DialogContentText>
				<div className='mt-2 flex flex-col gap-1 w-full'>
					<SelectInput name='event' label='Novedad' control={control} default={'Compensatorio'}>
						{events.map(value => (
							<MenuItem value={value.id} key={value.id}>
								{value.nombre}
							</MenuItem>
						))}
					</SelectInput>
					<DatePickerInput control={control} label='Hasta el día' name='time' today={today} />
					<TextField
						id='review-multiline'
						fullWidth
						multiline
						rows={4}
						label='Observaciones'
						margin='dense'
						helperText={errors.review?.message}
						error={errors.review ? true : false}
						{...register('review')}
					/>
				</div>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color='error'>
					Cancelar
				</Button>
				<Button onClick={handleSubmit(onSubmit)} color='success'>
					Guardar
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default memo(NewsDialog);
