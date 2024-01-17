import { useQueries } from '@tanstack/react-query';
import { useState } from 'react';
import dayjs from 'dayjs';
import { allRegistersQuery, countRegQuery } from '../clients/reg.client';
import PaginationButton from '../components/buttons/PaginationButton';
import TableHis from '../components/tables/TableHis';
import Loading from '../components/utils/Loading';
import { limitPage } from '../utils/constants';

const titles = ['Nombre', 'Evento', 'Fecha', 'Hora', 'Observaciones'];
const today = dayjs().format('YYYY-MM-DD');

const History = () => {
	const [page, setPage] = useState(1);

	const handlePage = (event, value) => setPage(value);

	const queryResults = useQueries({
		queries: [allRegistersQuery(page, today), countRegQuery(today)],
	});

	const isLoading = queryResults.some(query => query.isPending || query.isRefetching);

	if (isLoading) return <Loading />;

	return (
		<main className='m-2'>
			<TableHis titles={titles} center>
				{queryResults[0].data.map((reg, index) => (
					<tr className='border-b hover:bg-gray-50' key={index + reg.empleado.nombre}>
						<td className='p-4 whitespace-nowrap w-1/6'>{reg.empleado.nombre}</td>
						<td className='p-4 whitespace-nowrap w-1/12'>{reg.evento}</td>
						<td className='p-4 whitespace-nowrap w-1/12'>{reg.fecha}</td>
						<td className='p-4 whitespace-nowrap'>{dayjs(`1/1/1 ${reg.hora}`).format('h:mm A')}</td>
						<td className='p-4'>{reg.observaciones}</td>
					</tr>
				))}
			</TableHis>
			<PaginationButton
				count={Math.ceil(queryResults[1].data[0].countDistinct.id / limitPage)}
				page={page}
				handleNewPage={handlePage}
			/>
		</main>
	);
};

export default History;
