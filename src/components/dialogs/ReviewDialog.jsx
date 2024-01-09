import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	TextField,
} from '@mui/material';
import { memo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { reviewSchema } from '../../schemas/reviewSchema';
import successAlert from '../alerts/SuccessAlert';
import errorAlert from '../alerts/ErrorAlert';
import { createReview } from '../../clients/reg.client';

/**
 *
 * @param {Object} props
 * @param {Boolean} props.open
 * @param {Function} props.onClose
 * @param {String} props.checkText
 * @param {String} props.id
 * @param {String} props.review
 * @param {Function} props.getReview
 * @returns
 */
const ReviewDialog = ({ open = false, onClose, checkText = '', id, review, getReview, name }) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(reviewSchema),

		defaultValues: {
			curReview: review,
		},
	});

	const onSubmit = data => {
		onClose();
		createReview(data.curReview, id)
			.then(() => {
				successAlert();
				getReview(data.curReview);
			})
			.catch(() => errorAlert('Hubo error guardando la observación'));
	};

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>Observaciones</DialogTitle>
			<DialogContent>
				<DialogContentText textAlign={'justify'}>
					Escribe las observaciones para el evento de {checkText.toLowerCase()} de {name}:
				</DialogContentText>
				<TextField
					id='review-multiline'
					fullWidth
					multiline
					rows={4}
					label='Escribe aquí'
					margin='dense'
					{...register('curReview')}
					helperText={errors.curReview?.message}
					error={errors.curReview ? true : false}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color='error'>
					Cancelar
				</Button>
				<Button onClick={handleSubmit(onSubmit)} disabled={review ? true : false} color='success'>
					Guardar
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default memo(ReviewDialog);
