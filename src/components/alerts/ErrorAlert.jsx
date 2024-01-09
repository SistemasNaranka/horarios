import { toast } from 'react-hot-toast';

/**
 *
 * @param {String} text
 * @returns
 */
const errorAlert = (text = 'Hubo un error, recarga la página') =>
	toast.error(text, {
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

export default errorAlert;
