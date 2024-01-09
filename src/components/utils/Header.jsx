import Nav from './Nav';
import Sesion from './Sesion';

const Header = () => {
	return (
		<header className='flex justify-between m-2 mb-0'>
			<Nav />
			<Sesion />
		</header>
	);
};

export default Header;
