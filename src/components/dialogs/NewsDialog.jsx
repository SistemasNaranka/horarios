import dayjs from 'dayjs';
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
import { memo, useContext } from 'react';
import DatePickerInput from '../inputs/DatePickerInput';
import successAlert from '../alerts/SuccessAlert';
import errorAlert from '../alerts/ErrorAlert';
import SelectInput from '../inputs/SelectInput';
import { news } from '../../utils/constants';
import { dateEventSchema } from '../../schemas/eventSchema';
import { createListNews } from '../../clients/news.client';
import { roleStore } from '../../stores/roleStore';

const today = dayjs();

/**
 *
 * @param {Object} props
 * @param {String} props.name
 * @param {Boolean} props.open
 * @param {Function} props.onClose
 * @param {Function} props.addNews
 * @param {String} props.cc
 * @returns
 */
const NewsDialog = ({ name = '', open = false, onClose, addNews, cc }) => {
	const location = roleStore(state => state.location);
	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(dateEventSchema),
		defaultValues: {
			time: today,
			event: 'Descanso',
		},
	});

	const onSubmit = data => {
		onClose();
		const list = [];
		for (let index = 0; index < data.time.diff(today, 'day', true) + 1; index++) {
			list.push({
				empleado: cc,
				novedad: data.event,
				...(data.review && { observaciones: data.review }),
				fecha: today.add(index, 'day').format('YYYY-MM-DD'),
				tienda: location,
			});
		}

		createListNews(list)
			.then(() => {
				addNews(cc);
				successAlert();
			})
			.catch(() => errorAlert('Hubo error guardando la novedad'));
	};

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>Reporta una novedad</DialogTitle>
			<DialogContent>
				<DialogContentText>Escoja la novedad presentada para {name}:</DialogContentText>
				<div className='mt-2 flex flex-col gap-1 w-full'>
					<SelectInput name='event' label='Novedad' control={control} default={'Compensatorio'}>
						{news.map(value => (
							<MenuItem value={value} key={value}>
								{value}
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
