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
import { baseEventSchema } from '../../schemas/eventSchema';
import { createBreak } from '../../clients/aux.client';
import successAlert from '../alerts/SuccessAlert';
import SelectInput from '../inputs/SelectInput';
import { breaks } from '../../utils/constants';
import errorAlert from '../alerts/ErrorAlert';

/**
 *
 * @param {Object} props
 * @param {String} props.name
 * @param {Boolean} props.open
 * @param {Function} props.onClose
 * @param {String} props.cc
 * @returns
 */
const BreakDialog = ({ name = '', open = false, onClose, cc }) => {
	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(baseEventSchema),
		defaultValues: {
			event: 'Iniciar Pausa Activa',
			review: '',
		},
	});

	const onSubmit = data => {
		createBreak(data.event, cc, data.review)
			.then(() => {
				onClose();
				successAlert();
			})
			.catch(err => errorAlert('Hubo error guardando la pausa'));
	};

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>Reporta un evento</DialogTitle>
			<DialogContent>
				<DialogContentText>Escoja la novedad presentada para {name}:</DialogContentText>
				<div className='mt-2 gap-4 w-full'>
					<SelectInput
						name='event'
						label='Evento'
						control={control}
						default={'Iniciar Pausa Activa'}
					>
						{breaks.map(value => (
							<MenuItem value={value} key={value}>
								{value}
							</MenuItem>
						))}
					</SelectInput>
					<TextField
						multiline
						fullWidth
						rows={4}
						type='text'
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

export default memo(BreakDialog);
