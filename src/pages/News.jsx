import { useQueries } from '@tanstack/react-query';
import { useState } from 'react';
import dayjs from 'dayjs';
import { countNewsQuery, RangeDate } from '../clients/mesh.client';
import PaginationButton from '../components/buttons/PaginationButton';
import TableHis from '../components/tables/TableHis';
import { eventStore } from '../stores/eventStore';
import Loading from '../components/utils/Loading';
import { roleStore } from '../stores/roleStore';
import { limitPage } from '../utils/constants';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'dayjs/locale/es';
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import './utils/styles/custom-datepicker.css';
import './utils/styles/custom-select.css';
import { FaCalendarAlt } from 'react-icons/fa';
const titles = ['Nombre', 'Novedad', 'Fecha', 'Observaciones'];

es.options.weekStartsOn = 0;
registerLocale('es', es);
const isSunday = date => {
	return dayjs(date).day() === 0;
};
const News = () => {
	const [page, setPage] = useState(1);
	const [dateRange, setDateRange] = useState('today');
	const [customStartDate, setCustomStartDate] = useState(null);
	const [customEndDate, setCustomEndDate] = useState(null);
	const [isDateRangeCustom, setIsDateRangeCustom] = useState(false);

	const location = roleStore(state => state.location);
	const events = eventStore(state => state.events);

	const today = dayjs().format('YYYY-MM-DD');
	const locationKey = location ? location.toString() : '';

	const handleDateRangeChange = event => {
		setDateRange(event.target.value);
		setPage(1);
		if (event.target.value !== 'custom') {
			setCustomStartDate(null);
			setCustomEndDate(null);
			setIsDateRangeCustom(false);
		}
	};

	const handleStartDateChange = date => {
		setCustomStartDate(date);
		if (customEndDate && dayjs(date).isAfter(dayjs(customEndDate))) {
			setCustomEndDate(dayjs(date).add(1, 'day').format('YYYY-MM-DD'));
		}

		setDateRange('custom');
		setIsDateRangeCustom(true);
		setPage(1);
	};

	const handleEndDateChange = date => {
		setCustomEndDate(date);
		if (customStartDate && dayjs(date).isBefore(dayjs(customStartDate))) {
			setCustomStartDate(dayjs(date).subtract(1, 'day').format('YYYY-MM-DD'));
		}
		setDateRange('custom');
		setIsDateRangeCustom(true);
		setPage(1);
	};

	const isValidDate = (startDate, endDate) => {
		return dayjs(startDate).isBefore(dayjs(endDate)) || startDate === endDate;
	};

	const getDateRange = () => {
		let start = customStartDate || dayjs().format('YYYY-MM-DD');
		let end = customEndDate || start;

		start = dayjs(start).startOf('day').format('YYYY-MM-DD');
		end = dayjs(end).endOf('day').format('YYYY-MM-DD');

		if (dateRange === 'thisCurrentWeek') {
			return {
				startDate: dayjs().startOf('week').format('YYYY-MM-DD'),
				endDate: dayjs().endOf('week').format('YYYY-MM-DD'),
			};
		}

		if (dateRange === 'thisCurrentMonth') {
			return {
				startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
				endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
			};
		}

		if (dateRange === 'today') {
			return { startDate: today, endDate: today };
		}

		if (dateRange === 'thisWeek') {
			return {
				startDate: dayjs().subtract(7, 'days').startOf('day').format('YYYY-MM-DD'),
				endDate: today,
			};
		}

		if (dateRange === 'thisMonth') {
			return {
				startDate: dayjs().subtract(30, 'days').startOf('day').format('YYYY-MM-DD'),
				endDate: today,
			};
		}

		if (dateRange === 'allTime') {
			return {
				startDate: '2020-01-01',
				endDate: today,
			};
		}

		if (customStartDate && customEndDate && isValidDate(customStartDate, customEndDate)) {
			return { startDate: start, endDate: end };
		}

		return { startDate: start, endDate: end };
	};

	const { startDate, endDate } = getDateRange();

	const queryResults = useQueries({
		queries: [
			{
				queryKey: ['mesh', locationKey, startDate, endDate, page],
				queryFn: () => RangeDate(startDate, endDate, locationKey, page, limitPage).queryFn(),
				refetchOnWindowFocus: false,
			},
			{
				queryKey: ['newsCount', startDate, endDate, locationKey],
				queryFn: () => countNewsQuery(startDate, endDate, locationKey).queryFn(),
				refetchOnWindowFocus: false,
			},
		],
	});

	const isLoading = queryResults.some(query => query.isPending || query.isRefetching);

	if (isLoading) return <Loading />;

	const totalNewsCount = queryResults[1]?.data?.[0]?.countDistinct?.id || 0;
	const totalPages = Math.ceil(totalNewsCount / limitPage);

	const handlePageChange = (event, newPage) => {
		setPage(newPage);
	};
	const shouldShowPagination = totalNewsCount > limitPage;
	return (
		<main className='m-4'>
			<div className='mb-2 grid grid-cols-1 sm:grid-cols-2 gap-6'>
				<div className='flex flex-col items-start relative'>
					<label htmlFor='dateRange' className='text-sm text-gray-900'>
						Rango de Fecha:
					</label>

					<div className='custom-select-wrapper'>
						<select
							value={isDateRangeCustom ? '' : dateRange}
							onChange={handleDateRangeChange}
							className='custom-select'
						>
							{isDateRangeCustom && <option value=''>Seleccione</option>}
							<option value='today'>Hoy</option>
							<option value='thisCurrentWeek'>Semana actual</option>
							<option value='thisCurrentMonth'>Mes actual</option>
							<option value='thisWeek'>Últimos 7 días</option>
							<option value='thisMonth'>Últimos 30 días</option>
							<option value='allTime'>Todo el tiempo</option>
						</select>
						<div className='dropdown-arrow'>&#x25BC;</div>
					</div>
				</div>

				<div className='flex justify-end gap-6'>
					<div className='flex flex-col w-full sm:w-auto'>
						<label htmlFor='startDate' className='text-sm text-gray-900'>
							Filtrar desde:
						</label>

						<div className='relative'>
							<DatePicker
								selected={customStartDate}
								onChange={handleStartDateChange}
								minDate={new Date('2021-02-01')}
								maxDate={customEndDate ? new Date(customEndDate) : new Date()}
								locale='es'
								todayButton='Hoy'
								showYearDropdown
								showMonthDropdown
								scrollableYearDropdown
								dateFormat='dd/MM/yyyy'
								placeholderText='Selecciona una fecha'
								className='border-2 p-2.5 pl-11 border-blue-900 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:to-blue-900 focus:border-transparent w-full sm:w-auto text-ellipsis text-sm sm:text-base whitespace-normal min-w-[150px]'
								calendarClassName='custom-calendar'
								popperPlacement='bottom-start'
								dayClassName={date =>
									isSunday(date) ? 'react-datepicker__day--sunday' : undefined
								}
							/>
							<FaCalendarAlt className='absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-900 text-2xl pointer-events-none' />
						</div>
					</div>

					<div className='flex flex-col w-full sm:w-auto'>
						<label htmlFor='endDate' className='text-sm text-gray-900'>
							Filtrar hasta:
						</label>
						<div className='relative'>
							<DatePicker
								selected={customEndDate}
								onChange={handleEndDateChange}
								locale='es'
								todayButton='Hoy'
								showYearDropdown
								showMonthDropdown
								scrollableYearDropdown
								minDate={customStartDate ? new Date(customStartDate) : new Date('2021-02-01')}
								maxDate={new Date()}
								dateFormat='dd/MM/yyyy'
								placeholderText='Selecciona una fecha'
								className='border-2 p-2.5 pl-11 border-blue-900 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:to-blue-900 focus:border-transparent w-full sm:w-auto text-ellipsis text-sm sm:text-base whitespace-normal min-w-[100px]'
								calendarClassName='custom-calendar'
								popperPlacement='bottom-start'
								dayClassName={date =>
									isSunday(date) ? 'react-datepicker__day--sunday' : undefined
								}
							/>
							<FaCalendarAlt className='absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-900 text-2xl pointer-events-none' />
						</div>
					</div>
				</div>
			</div>
			<TableHis titles={titles} center className='table-auto overflow-x-auto w-full'>
				{queryResults[0]?.data?.length > 0 ? (
					queryResults[0].data.map((curNew, index) => (
						<tr className='border-b hover:bg-gray-50' key={index + curNew.empleado.nombre}>
							<td className='p-4 whitespace-nowrap w-1/5'>{curNew.empleado.nombre}</td>
							<td className='p-4 whitespace-nowrap w-1/6'>{events.get(curNew.novedad).nombre}</td>
							<td className='p-4 whitespace-nowrap w-1/12'>{curNew.fecha}</td>
							<td className='p-4'>{curNew.observaciones}</td>
						</tr>
					))
				) : (
					<tr>
						<td className='p-4 whitespace-nowrap w-1/12'>
							No hay Novedades disponibles en este rango de fechas
						</td>
					</tr>
				)}
			</TableHis>

			{shouldShowPagination && (
				<PaginationButton
					count={totalPages}
					page={page}
					handleNewPage={handlePageChange}
					className='w-full md:w-auto'
				/>
			)}
		</main>
	);
};

export default News;
