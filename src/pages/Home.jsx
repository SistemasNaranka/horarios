import { useQueries } from '@tanstack/react-query';
import { meshRangeQuery } from '../clients/mesh.client';
import dayjs from 'dayjs';
import { roleStore } from '../stores/roleStore';
import Loading from '../components/utils/Loading';
import { shiftStore } from '../stores/shiftStore';
import { newsQuery } from '../clients/news.client';
import { registersQuery } from '../clients/reg.client';
import { employeeStore } from '../stores/employeeStore';
import RegCard from '../components/cards/RegCard';

function Home() {
	const today = dayjs();
	const todayDate = today.format('YYYY-MM-DD');
	const location = roleStore(state => state.location);
	const shifts = shiftStore(state => state.shifts);
	const employees = employeeStore(state => state.employees);
	const queryResults = useQueries({
		queries: [
			meshRangeQuery(todayDate, todayDate, location),
			registersQuery(todayDate),
			newsQuery(todayDate),
		],
	});

	const addNews = () => {
		queryResults[2].refetch();
	};

	const isLoading = queryResults.some(query => query.isLoading || query.isRefetching);

	if (isLoading) return <Loading />;

	const newsData = queryResults[2].data;

	const regsData = queryResults[1].data;

	const employeesData = employees;

	return (
		<main className='m-2 flex justify-evenly flex-wrap gap-y-8 gap-x-4'>
			{employeesData
				.filter(employee => !newsData.find(item => item.empleado === employee.id))
				.map(
					employee =>
						!newsData.find(news => news.empleado === employee.id) && (
							<RegCard
								key={employee.id}
								employee={employee}
								data={regsData.filter(item => item.empleado.id === employee.id)}
								addNews={addNews}
							/>
						),
				)}
		</main>
	);
}
export default Home;
