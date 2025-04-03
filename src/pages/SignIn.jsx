import { Button, Paper, TextField } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import suspendAlert from '../components/alerts/SuspendAlert';
import SignInAlert from '../components/alerts/SignInAlert';
import { SignInSchema } from '../schemas/signInSchema';
import { client, signIn } from '../clients/client';
import { HOME_PATH } from '../utils/path';
import useConnectionStore from '../stores/connectionStore';
import { syncCriticalData } from '../clients/syncData';
import Loading from '../components/utils/Loading';

const SignIn = () => {
	const navigate = useNavigate();
	const { checkConnectionImmediately, isOnline } = useConnectionStore();
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm({
		resolver: yupResolver(SignInSchema),
	});

	const onSubmit = async data => {
		try {
			// Verificar conexión primero
			await checkConnectionImmediately();

			// Autenticar usuario
			const response = await signIn(data);
			setIsLoading(true);
			// Sincronizar datos críticos si hay conexión
			if (isOnline) {
				await syncCriticalData();
			}
			setIsLoading(false);
			// Redirigir a la página principal
			navigate(HOME_PATH);
		} catch (err) {
			if (err.message === 'Credenciales incorrectas o usuario no registrado localmente.') {
				SignInAlert();
			} else if (err.errors?.[0]?.extensions?.code === 'USER_SUSPENDED') {
				suspendAlert();
			} else {
				SignInAlert();
			}
		} finally {
		}
	};

	return (
		<>
			{isLoading && <Loading />}

			<Paper
				elevation={3}
				className='flex w-4/5 sm:w-1/3 2xl:w-1/4 h-80 m-auto border text-themeGrey'
				style={{
					opacity: isLoading ? 0.7 : 1,
					pointerEvents: isLoading ? 'none' : 'auto',
				}}
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
						error={!!errors.email}
						autoComplete='on'
						disabled={isLoading}
					/>

					<TextField
						label='Contraseña'
						variant='standard'
						type='password'
						{...register('password')}
						helperText={errors.password?.message}
						error={!!errors.password}
						autoComplete='current-password'
						disabled={isLoading}
					/>

					<Button
						variant='contained'
						type='submit'
						sx={{ marginTop: '0.5rem' }}
						disabled={isLoading || isSubmitting}
					>
						{isLoading ? 'Procesando...' : 'Iniciar sesión'}
					</Button>
				</form>
			</Paper>
		</>
	);
};

export default SignIn;
