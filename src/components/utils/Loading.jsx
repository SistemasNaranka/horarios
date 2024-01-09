import Loader from './Loader';

const Loading = () => {
	return (
		<div className='w-full min-h-screen flex justify-center m-auto'>
			<div className='my-auto'>
				<Loader color='#000000' />
			</div>
		</div>
	);
};

export default Loading;
