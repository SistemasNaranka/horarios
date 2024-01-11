import { Button, Divider, Drawer, List, MenuItem, Paper, Toolbar, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

/**
 *
 * @param {Object} props
 * @returns
 */
const MovilNavMenu = props => {
	const { window } = props;

	const navigate = useNavigate();

	const [menu, setMenu] = useState(false);

	const handleOpenMenu = () => {
		setMenu(true);
	};

	const handleCloseMenu = () => {
		setMenu(false);
	};

	/**
	 *
	 * @param {String} url
	 */
	const goPage = url => {
		handleCloseMenu();
		navigate(url);
	};

	const container = window !== undefined ? () => window().document.body : undefined;

	return (
		<Paper className='border border-gray-20 p-1 md:hidden' elevation={3}>
			<Tooltip title='Menú de navegación' sx={{ width: '4.5rem' }}>
				<Button onClick={handleOpenMenu}>
					<MenuIcon fontSize='large' />
				</Button>
			</Tooltip>
			<Drawer
				container={container}
				variant='temporary'
				open={menu}
				onClose={handleCloseMenu}
				sx={{
					display: { xs: 'block', sm: 'none' },
					'& .MuiDrawer-paper': { boxSizing: 'border-box', width: 220 },
				}}
			>
				<Toolbar />
				<Divider />
				<List>
					{props.pages.map(page => (
						<MenuItem key={`menumovilitem${page.id}`} onClick={() => goPage(page.id)}>
							{page.title}
						</MenuItem>
					))}
				</List>
			</Drawer>
		</Paper>
	);
};

export default MovilNavMenu;
