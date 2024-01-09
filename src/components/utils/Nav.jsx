import { roleStore } from '../../stores/roleStore';
import { PAGES_ROLE } from '../../utils/path';
import DesktopNavMenu from '../menus/DesktopNavMenu';
import { Button } from '@mui/material';
import MovilNavMenu from '../menus/MovilNavMenu';
import { useQueryClient } from '@tanstack/react-query';

const Nav = () => {
	const role = roleStore(state => state.role);
	const pages = PAGES_ROLE[role?.length > 0 ? role : 'simple'];
	const queryClient = useQueryClient();
	const refetch = () => queryClient.refetchQueries();

	return (
		<nav className='flex justify-between'>
			<MovilNavMenu pages={pages} />
			<DesktopNavMenu pages={pages} />
			<Button color='success' variant='contained' sx={{ marginX: '8px' }} onClick={refetch}>
				<p className='p-1 font-sans text-lg'>Refrescar</p>
			</Button>
		</nav>
	);
};

export default Nav;
