import { object, string } from 'yup';

export const reviewSchema = object().shape({
	curReview: string()
		.required('Para guardar es necesario escribir una observación')
		.max(255, 'Debes usar menos de 255 carácteres'),
});
