import Sesion from './Sesion';
import Nav from './Nav';

const Header = ({ refetch }) => {
	return (
		<header className='flex justify-between m-2 mb-0'>
			<Nav refetch={refetch} />
			<Sesion />
		</header>
	);
};

export default Header;
