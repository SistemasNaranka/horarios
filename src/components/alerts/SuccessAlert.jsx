import { toast } from 'react-hot-toast';

const successAlert = () =>
	toast.success('Guardado con éxito.', {
		style: {
			border: '1px solid #A0C451',
			padding: '16px',
			color: '#76913C',
		},
		iconTheme: {
			primary: '#A0C451',
			secondary: '#FFFAEE',
		},
	});

export default successAlert;
