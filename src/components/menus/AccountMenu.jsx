import { Button, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { client } from '../../clients/client';
import { roleStore } from '../../stores/roleStore';
import useConnectionStore from '../../stores/connectionStore'; // Importar el store de conexión

const AccountMenu = () => {
	const [anchorElUser, setAnchorElUser] = useState(null);
	const navigate = useNavigate();
	const remove = roleStore(state => state.remove);
	const { isOnline } = useConnectionStore(); // Obtener el estado de la conexión

	const handleOpenUserMenu = e => {
		setAnchorElUser(e.currentTarget);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	const handleLogOut = async () => {
		try {
			if (isOnline) {
				// Modo online: cerrar sesión en Directus
				await client.logout();
			}

			// Modo offline: cerrar sesión localmente
			localStorage.removeItem('localAuth'); // Eliminar la autenticación local
			remove(); // Limpiar el estado del rol
			navigate('/'); // Redirigir al inicio
		} catch (error) {
			console.error('Error al cerrar sesión:', error);

			// Si falla el cierre de sesión en Directus, cerrar sesión localmente
			localStorage.removeItem('localAuth'); // Eliminar la autenticación local
			remove(); // Limpiar el estado del rol
			navigate('/'); // Redirigir al inicio
		}
	};

	return (
		<>
			<Tooltip title='Cerrar Sesión'>
				<Button onClick={handleOpenUserMenu}>
					<LogoutIcon fontSize='large' />
				</Button>
			</Tooltip>
			<Menu
				sx={{ ml: '0.425rem', mt: '0.7rem' }}
				id='menu-appbar'
				anchorEl={anchorElUser}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				open={Boolean(anchorElUser)}
				onClose={handleCloseUserMenu}
			>
				<MenuItem onClick={handleLogOut}>
					<Typography textAlign='center'>Cerrar Sesión</Typography>
				</MenuItem>
			</Menu>
		</>
	);
};

export default AccountMenu;
