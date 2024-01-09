import dayjs from 'dayjs';
import { object, string } from 'yup';

export const baseEventSchema = object().shape({
	review: string().max(255, 'Debes usar menos de 255 carácteres'),
	event: string().required('Es necesario elegir una observación'),
});

export const dateEventSchema = object().shape({
	review: string().max(255, 'Debes usar menos de 255 carácteres'),
	event: string().required('Es necesario elegir una observación'),
	time: object().test(value => {
		return dayjs.isDayjs(value);
	}),
});
