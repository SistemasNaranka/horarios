import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Button,
} from '@mui/material';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

const OfflineAlertDialog = ({ open, onClose }) => {
	const navigate = useNavigate();

	const handleForcedAction = () => {
		// Limpiar autenticación y forzar recarga
		localStorage.setItem('connectionChecked', 'true'); // Marcar como notificado
		localStorage.removeItem('localAuth');
		window.location.href = '/'; // Recarga completa
	};

	return (
		<Dialog
			open={open}
			onClose={(event, reason) => {
				// Bloquear cierre al hacer clic fuera o presionar Escape
				if (reason !== 'backdropClick') onClose();
			}}
			disableEscapeKeyDown
			sx={{
				'& .MuiPaper-root': {
					minWidth: '400px',
					textAlign: 'center',
				},
			}}
		>
			<DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
				¡Modo Emergencia Activado!
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					<strong>Directus no está disponible.</strong>
					<br />
					Para continuar trabajando:
					<ol style={{ textAlign: 'left', paddingLeft: '20px' }}>
						<li>Cierra sesión</li>
						<li>La aplicación se recargará automáticamente</li>
						<li>Podrás seguir trabajando con datos locales</li>
					</ol>
				</DialogContentText>
			</DialogContent>
			<DialogActions sx={{ justifyContent: 'center' }}>
				<Button
					onClick={handleForcedAction}
					color='error'
					variant='contained'
					size='large'
					fullWidth
					sx={{ fontWeight: 'bold' }}
				>
					Cerrar sesión y continuar
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default memo(OfflineAlertDialog);
