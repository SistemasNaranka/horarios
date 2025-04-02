import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Button,
} from '@mui/material';
import { memo } from 'react';

const OnlineAlertDialog = ({ open, onClose }) => {
	const handleReload = () => {
		localStorage.removeItem('localAuth');
		localStorage.removeItem('storage');
		window.location.reload();
		window.location.href = '/'; // Recarga completa
	};

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle sx={{ color: 'success.main', fontWeight: 'bold' }}>
				¡Conexión Restablecida!
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					<strong>La base de datos está nuevamente disponible.</strong>
					<br />
					Para continuar trabajando presiona el boton:
				</DialogContentText>

				<ol style={{ textAlign: 'left', paddingLeft: '20px' }}>
					<li>Recarga la aplicación</li>
					<li>Tus datos locales se sincronizarán automáticamente</li>
				</ol>
			</DialogContent>
			<DialogActions sx={{ justifyContent: 'center' }}>
				<Button
					onClick={handleReload}
					color='success'
					variant='contained'
					size='large'
					fullWidth
					sx={{ fontWeight: 'bold' }}
				>
					Recargar aplicación
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default memo(OnlineAlertDialog);
