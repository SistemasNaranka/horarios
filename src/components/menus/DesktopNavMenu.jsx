import { Button, Paper, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 *
 * @param {Object} props
 * @param { Array<{id: String, title: String}>} props.pages
 * @returns
 */
const DesktopNavMenu = ({ pages }) => {
	const navigate = useNavigate();
	return (
		<Paper className='hidden border border-gray-200 p-1 md:block' elevation={3}>
			{pages.map(page => (
				<Tooltip key={`desktopNavMenu${page.id}`} title={page.title}>
					<Button onClick={() => navigate(page.id)} sx={{ marginX: '0.75rem' }}>
						<p className='p-1 font-semibold font-sans text-lg'>{page.title}</p>
					</Button>
				</Tooltip>
			))}
		</Paper>
	);
};

export default DesktopNavMenu;
