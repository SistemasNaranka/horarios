import Sesion from './Sesion';
import Nav from './Nav';

const Header = () => {
	return (
		<header className='flex justify-between m-2 mb-0'>
			<Nav />
			<Sesion />
		</header>
	);
};

export default Header;
