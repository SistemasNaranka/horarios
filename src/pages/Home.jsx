import { useQueries } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { meshRangeQuery } from '../clients/mesh.client';
import { employeeStore } from '../stores/employeeStore';
import { registersQuery } from '../clients/reg.client';
import Loading from '../components/utils/Loading';
import { shiftStore } from '../stores/shiftStore';
import RegCard from '../components/cards/RegCard';
import { roleStore } from '../stores/roleStore';

function Home() {
	const today = dayjs();
	const todayDate = today.format('YYYY-MM-DD');
	const location = roleStore(state => state.location);
	const employees = employeeStore(state => state.employees);
	const shifts = shiftStore(state => state.shifts);
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
	const employeesData = shifts.length > 0 ? mesh.map(item => item?.empleado) : employees;

	return (
		<main className='m-2 flex justify-evenly flex-wrap gap-y-8 gap-x-4'>
			{employeesData
				.filter(employee => !newsData.find(item => item.empleado === employee.id))
				.map(
					employee =>
						!newsData.find(news => news.empleado.id === employee.id) && (
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
