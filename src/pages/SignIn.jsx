import { Button, Paper, TextField } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useLayoutEffect } from 'react';
import suspendAlert from '../components/alerts/SuspendAlert';
import SignInAlert from '../components/alerts/SignInAlert';
import { SignInSchema } from '../schemas/signInSchema';
import { client, signIn } from '../clients/client';
import { HOME_PATH } from '../utils/path';

const SignIn = () => {
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(SignInSchema),
	});

	const onSubmit = data =>
		signIn(data)
			.then(() => navigate(HOME_PATH))
			.catch(err =>
				err.errors[0].extensions.code === 'USER_SUSPENDED' ? suspendAlert() : SignInAlert(),
			);

	useLayoutEffect(() => {
		client.getToken().then(result => (result ? navigate(HOME_PATH) : null));
	}, [navigate]);

	return (
		<Paper
			elevation={3}
			className='flex w-4/5 sm:w-1/3 2xl:w-1/4 h-80 m-auto border text-themeGrey'
		>
			<form
				className='flex flex-col justify-center gap-2 mx-4 md:mx-8 w-full p-4'
				onSubmit={handleSubmit(onSubmit)}
			>
				<h1 className='text-center text-2xl font-bold'>Inicio de sesión</h1>
				<TextField
					label='Correo'
					variant='standard'
					type='text'
					{...register('email')}
					helperText={errors.email?.message}
					error={errors.email ? true : false}
					autoComplete='on'
				/>
				<TextField
					label='Contraseña'
					variant='standard'
					type='password'
					{...register('password')}
					helperText={errors.password?.message}
					error={errors.password ? true : false}
					autoComplete='current-password'
				/>
				<Button variant='contained' type='submit' sx={{ marginTop: '0.5rem' }}>
					Iniciar sesión
				</Button>
			</form>
		</Paper>
	);
};

export default SignIn;
