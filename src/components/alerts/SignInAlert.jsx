import { toast } from 'react-hot-toast';

const signInAlert = () =>
	toast.error('Revisa tu correo y contraseña.', {
		style: {
			border: '1px solid #ff6b6b',
			padding: '16px',
			color: '#c44d58',
		},
		iconTheme: {
			primary: '#ff6b6b',
			secondary: '#FFFAEE',
		},
	});

export default signInAlert;
