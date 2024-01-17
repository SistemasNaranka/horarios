import { useQueries } from '@tanstack/react-query';
import { useState } from 'react';
import dayjs from 'dayjs';
import { allNewsQuery, countNewsQuery } from '../clients/news.client';
import PaginationButton from '../components/buttons/PaginationButton';
import TableHis from '../components/tables/TableHis';
import Loading from '../components/utils/Loading';
import { limitPage } from '../utils/constants';

const today = dayjs().format('YYYY-MM-DD');

const titles = ['Nombre', 'Novedad', 'Fecha', 'Observaciones'];

const News = () => {
	const [page, setPage] = useState(1);

	const handlePage = (event, value) => setPage(value);

	const queryResults = useQueries({ queries: [allNewsQuery(page, today), countNewsQuery(today)] });

	const isLoading = queryResults.some(query => query.isPending || query.isRefetching);

	if (isLoading) return <Loading />;

	return (
		<main className='m-2'>
			<TableHis titles={titles} center>
				{queryResults[0].data.map((curNew, index) => (
					<tr className='border-b hover:bg-gray-50' key={index + curNew.empleado.nombre}>
						<td className='p-4 whitespace-nowrap w-1/5'>{curNew.empleado.nombre}</td>
						<td className='p-4 whitespace-nowrap w-1/6'>{curNew.novedad}</td>
						<td className='p-4 whitespace-nowrap w-1/12'>{curNew.fecha}</td>
						<td className='p-4'>{curNew.observaciones}</td>
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

export default News;
