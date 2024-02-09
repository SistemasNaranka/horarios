import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { Button, Paper } from '@mui/material';
import { useEffect, useState } from 'react';

/**
 *
 * @param {Object} props
 * @param {Array} props.pages
 * @returns
 */
function MovilNavMenu({ pages }) {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();

	const handleCloseDrawer = () => {
		setOpen(false);
	};

	const handleOpenDrawer = () => {
		setOpen(true);
	};

	useEffect(() => {
		if (open) document.body.style.setProperty('overflow', 'hidden');
		else document.body.style.removeProperty('overflow');
	}, [open]);

	return (
		<>
			<Paper className='border border-gray-20 p-1 md:hidden' elevation={3}>
				<Button onClick={handleOpenDrawer} sx={{ width: '4.5rem' }}>
					<MenuIcon fontSize='large' />
				</Button>
			</Paper>
			<aside
				className={`transform top-0 left-0 z-30 w-full bg-white fixed h-screen overflow-auto ease-in-out transition-all duration-300 z-30${
					open ? 'block translate-x' : 'hidden -translate-x-full'
				}`}
			>
				<div className='pt-12 px-8 flex gap-4 flex-col' key={'uniqueKey'}>
					<button className='mr-auto font-medium' onClick={handleCloseDrawer} type='button'>
						Cerrar
					</button>
					<span className='border-t border-gray-400' />
					{pages.map(page => {
						return [
							<div key={`menumovilitem${page.id}`}>
								<button
									type='button'
									onClick={() => {
										handleCloseDrawer();
										navigate(page.id);
									}}
									className='py-2 text-xl group relative overflow-hidden font-medium w-full text-left'
								>
									<div className='absolute inset-0 scale-0 rounded transition-all duration-300 group-hover:scale-100 group-hover:bg-white/30' />

									{page.title}
								</button>
							</div>,
							<span key={`span${page.id}`} className='border-t border-gray-400' />,
						];
					})}
				</div>
			</aside>
		</>
	);
}
export default MovilNavMenu;
