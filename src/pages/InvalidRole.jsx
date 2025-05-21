// src/components/errors/InvalidRole.js
import { useNavigate } from 'react-router-dom';
import { Button, Paper } from '@mui/material';

const InvalidRole = () => {
	const navigate = useNavigate();
	return (
		<div className='flex items-center justify-center min-h-screen px-4'>
			<Paper
				className='flex flex-col gap-6 w-full max-w-lg p-6 sm:p-10 text-center border-red-200 border-2 bg-red-50 shadow-md'
				elevation={3}
			>
				<h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-red-700'>
					Acceso denegado
				</h1>
				<h2 className='text-base sm:text-lg md:text-xl font-medium text-gray-700'>
					El usuario no tiene permiso para acceder a esta aplicación.
				</h2>
				<div className='flex justify-center'>
					<Button
						variant='contained'
						size='large'
						color='error'
						onClick={() => navigate('/')}
						className='text-sm sm:text-base md:text-lg px-6 py-3'
					>
						Volver al inicio de sesión
					</Button>
				</div>
			</Paper>
		</div>
	);
};

export default InvalidRole;
