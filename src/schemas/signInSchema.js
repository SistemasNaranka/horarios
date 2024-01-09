import { object, string } from 'yup';

export const SignInSchema = object().shape({
	email: string()
		.required('El correo es requerido para iniciar sesión')
		.email('Debe ser un correo valido'),
	password: string().required('La contraseña es requerida para iniciar sesión'),
});
