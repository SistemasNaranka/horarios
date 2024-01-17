import { Button } from '@mui/material';
import DesktopNavMenu from '../menus/DesktopNavMenu';
import { roleStore } from '../../stores/roleStore';
import MovilNavMenu from '../menus/MovilNavMenu';
import { PAGES_ROLE } from '../../utils/path';

const Nav = ({ refetch }) => {
	const role = roleStore(state => state.role);
	const pages = PAGES_ROLE[role?.length > 0 ? role : 'simple'];

	return (
		fetch && (
			<nav className='flex justify-between'>
				<MovilNavMenu pages={pages} />
				<DesktopNavMenu pages={pages} />
				<Button color='success' variant='contained' sx={{ marginX: '8px' }} onClick={refetch}>
					<p className='p-1 font-sans text-lg'>Refrescar</p>
				</Button>
			</nav>
		)
	);
};

export default Nav;
