import { useNavigate } from 'react-router-dom';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { Button, Paper, Tooltip } from '@mui/material';
import { getHolidaysByYear } from 'festivos-colombia';
import { roleStore } from '../stores/roleStore';
import { CREATE_MESH_PATH } from '../utils/path';
import { useLayoutEffect } from 'react';
import { create } from 'zustand';
import dayjs from 'dayjs';
import MonthCalendar from '../components/calendars/MonthCalendar';
import ShiftsTable from '../components/tables/ShiftsTable';
import { processDataRegisters } from '../utils/functions';
import { meshRangeQuery } from '../clients/mesh.client';
import { useQueries } from '@tanstack/react-query';
import MonthRow from '../components/rows/MonthRow';
import Loading from '../components/utils/Loading';

const meshStore = create(set => ({
	month: 0,
	day: dayjs(),
	days: [],
	weeksCalendar: [],
	holidays: [],
	setMonth: month => {
		const day = dayjs().add(month, 'month');
		const initMonth = dayjs(`${day.get('year')}-${day.format('MM')}-01`);
		const init = initMonth.subtract(initMonth.day(), 'd');
		const numberWeeks =
			(initMonth.daysInMonth() === 31 && initMonth.day() === 1) || initMonth.day() === 6 ? 6 : 5;
		const daysForWeek = [...Array(7 * numberWeeks).keys()];
		const days = daysForWeek.reduce((prev, value) => {
			prev.push(init.add(value, 'days'));
			return prev;
		}, []);
		const weeksCalendar = [...Array(numberWeeks).keys()];
		const holidays = getHolidaysByYear(day.year());
		set(() => ({ month, day, days, weeksCalendar, holidays }));
	},
}));

function Mesh() {
	const [month, day, days, holidays, weeksCalendar, setMonth] = meshStore(state => [
		state.month,
		state.day,
		state.days,
		state.holidays,
		state.weeksCalendar,
		state.setMonth,
	]);
	const location = roleStore(state => state.location);
	const navigate = useNavigate();
	const first = days[0]?.format('YYYY-MM-DD');
	const second = days[days.length - 1]?.format('YYYY-MM-DD');
	const queryResult = useQueries({
		queries: [meshRangeQuery(first, second, location)],
	});

	useLayoutEffect(() => {
		setMonth(0);
	}, [setMonth]);

	const handlePrevClick = e => {
		setMonth(month - 1);
	};
	const handleNextClick = e => {
		setMonth(month + 1);
	};

	const handleCurClick = e => {
		setMonth(0);
	};

	const handleMeshWeekClick = event => {
		navigate(CREATE_MESH_PATH);
	};

	const isLoading = queryResult.some(query => query.isPending || query.isRefetching);

	if (isLoading) return <Loading />;

	const dataWeek = processDataRegisters(weeksCalendar.length, days, queryResult[0].data);

	return (
		<main className='m-2'>
			<div className='flex gap-2 md:justify-end text-xl mb-2 font-semibold'>
				<Paper className='flex '>
					<Tooltip title='Anterior Mes'>
						<Button onClick={handlePrevClick}>
							<KeyboardArrowLeftIcon fontSize='large' />
						</Button>
					</Tooltip>
					<Button onClick={handleCurClick}>Mes Actual</Button>
					<Tooltip title='Próximo Mes'>
						<Button onClick={handleNextClick}>
							<KeyboardArrowRightIcon fontSize='large' />
						</Button>
					</Tooltip>
				</Paper>
				<Paper className='text-center pt-2 w-32 md:w-60 bg-white shadow-md h-auto border-r capitalize'>
					<div className='m-auto'>{`${day.format('MMMM')} del ${day.year()}`}</div>
				</Paper>
				<Button size='large' onClick={handleMeshWeekClick} variant='contained' color='success'>
					Crear Malla
				</Button>
			</div>
			<div className='pb-8 mx-auto text-lg text-center'>
				<ShiftsTable />
			</div>
			<MonthCalendar
				key={day.month()}
				days={days}
				weeksCalendar={weeksCalendar}
				holidays={holidays}
				curDay={day}
				weekComponent={MonthRow}
				dataWeek={dataWeek}
			/>
		</main>
	);
}
export default Mesh;
