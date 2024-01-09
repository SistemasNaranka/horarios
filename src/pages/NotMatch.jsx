import { useNavigate } from 'react-router-dom';
import { Button, Paper } from '@mui/material';
import { HOME_PATH } from '../utils/path';

const NotMatch = () => {
	const navigate = useNavigate();
	return (
		<Paper
			className='flex flex-col gap-2 my-auto mx-4 py-10 text-center border-gray-200 border md:mx-auto md:px-10'
			elevation={3}
		>
			<h1 className=' text-4xl font-semibold'>Parece que te has perdido</h1>
			<h2 className=' text-xl font-medium '>Esta ruta no tiene contenido</h2>
			<ul className='flex flex-col gap-3'>
				<li>
					<Button variant='contained' color='secondary' onClick={() => navigate(HOME_PATH)}>
						Vuelve a la página principal
					</Button>
				</li>
				<li>
					<Button variant='contained' onClick={() => navigate(-1)}>
						Regresar
					</Button>
				</li>
			</ul>
		</Paper>
	);
};

export default NotMatch;
