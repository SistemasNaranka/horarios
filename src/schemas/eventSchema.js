import { number, object, string } from 'yup';
import dayjs from 'dayjs';

export const baseEventSchema = object().shape({
	review: string().max(255, 'Debes usar menos de 255 carácteres'),
	event: string().required('Es necesario elegir una observación'),
});

export const dateEventSchema = object().shape({
	review: string().max(255, 'Debes usar menos de 255 carácteres'),
	event: number().required('Es necesario elegir una observación'),
	time: object().test(value => {
		return dayjs.isDayjs(value);
	}),
});
