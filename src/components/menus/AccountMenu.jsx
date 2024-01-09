import { Button, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { client } from '../../clients/client';

const AccountMenu = () => {
	const [anchorElUser, setAnchorElUser] = useState(null);
	const navigate = useNavigate();

	const handleOpenUserMenu = e => {
		setAnchorElUser(e.currentTarget);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	const handleLogOut = () => {
		client.logout().then(() => navigate('/'));
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
