import { useQueries } from '@tanstack/react-query';
import { meshRangeQuery } from '../clients/mesh.client';
import dayjs from 'dayjs';
import { roleStore } from '../stores/roleStore';
import Loading from '../components/utils/Loading';
import { registersQuery } from '../clients/reg.client';

function Home() {
	const today = dayjs();
	const todayDate = today.format('DD/MM/YYYY');
	const location = roleStore(state => state.location);

	const queryResults = useQueries({
		queries: [meshRangeQuery(todayDate, todayDate, location), registersQuery(todayDate)],
	});

	const isLoading = queryResults.some(query => query.isLoading || query.isRefetching);

	if (isLoading) return <Loading />;

	if (queryResults[0].data.length === 0) return <div>123</div>;

	return <div>Home</div>;
}
export default Home;
