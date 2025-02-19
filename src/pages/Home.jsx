import { useQueries } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { meshRangeQuery } from '../clients/mesh.client';
import { employeeStore } from '../stores/employeeStore';
import { registersQuery } from '../clients/reg.client';
import Loading from '../components/utils/Loading';
import RegCard from '../components/cards/RegCard';
import { roleStore } from '../stores/roleStore';

function Home() {
	const today = dayjs();
	const todayDate = today.format('YYYY-MM-DD');
	const location = roleStore(state => state.location);
	const employees = employeeStore(state => state.employees);

	const queryResults = useQueries({
		queries: [registersQuery(todayDate), meshRangeQuery(todayDate, todayDate, location)],
	});

	const addNews = () => {
		for (const q of queryResults) {
			q.refetch();
		}
	};

	const isLoading = queryResults.some(query => query.isPending || query.isRefetching);

	if (isLoading) return <Loading />;

	const regsData = queryResults[0].data;
	const mesh = queryResults[1].data;

	const newsData = mesh.filter(item => item.novedad);

	const employeesWithoutNews = employees.filter(employee => {
		const hasNews = newsData.some(item => item.empleado.id === employee.id);
		return !hasNews;
	});

	return (
		<main className='m-2 flex justify-evenly flex-wrap gap-y-8 gap-x-4'>
			{employeesWithoutNews.map(employee => (
				<RegCard
					key={employee.id}
					employee={employee}
					data={regsData.filter(item => item.empleado.id === employee.id)}
					addNews={addNews}
					hasShift={mesh.some(item => item.empleado.id === employee.id && item.turno !== null)}
				/>
			))}
		</main>
	);
}

export default Home;
