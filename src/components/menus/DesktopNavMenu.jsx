import { Link, useLocation } from 'react-router-dom';
import { Button, Paper } from '@mui/material';

/**
 *
 * @param {Object} props
 * @param { Array<{id: String, title: String}>} props.pages
 * @returns
 */
const DesktopNavMenu = ({ pages }) => {
	const { pathname } = useLocation();

	return (
		<Paper className='hidden border border-gray-200 p-1 md:block' elevation={3}>
			{pages.map(page => (
				<Link to={page.id} key={page.id}>
					<Button sx={{ marginX: '0.75rem' }}>
						<p
							className={`p-1 font-semibold font-sans text-lg ${
								pathname !== page.id && ' text-blue-500'
							} `}
						>
							{page.title}
						</p>
					</Button>
				</Link>
			))}
		</Paper>
	);
};

export default DesktopNavMenu;
