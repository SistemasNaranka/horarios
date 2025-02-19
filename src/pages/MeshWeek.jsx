import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getHolidaysByYear } from 'festivos-colombia';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { create } from 'zustand';
import dayjs from 'dayjs';
import { today } from '../utils/constants';
import { MESH_PATH } from '../utils/path';
import { roleStore } from '../stores/roleStore';
import { useQueries } from '@tanstack/react-query';
import { meshRangeQuery } from '../clients/mesh.client';
import { useLayoutEffect } from 'react';
import Loading from '../components/utils/Loading';
import WeekCalendar from '../components/calendars/WeekCalendar';

const daysForWeekList = [...Array(7).keys()];

const meshStore = create(set => ({
	week: 0,
	day: dayjs(),
	days: [],
	holidays: [],
	setWeek: week => {
		const day = today.add(7 * week, 'days');
		const initMonth = dayjs(day.format('YYYY-MM-DD'));
		const init = initMonth.subtract(initMonth.day(), 'd');
		const days = daysForWeekList.reduce((prev, value) => {
			prev.push(init.add(value, 'days'));
			return prev;
		}, []);
		const holidays = getHolidaysByYear(day.year());
		set(() => ({ day, days, holidays, week }));
	},
}));

function MeshWeek() {
	const navigate = useNavigate();
	const [day, days, holidays, week, setWeek] = meshStore(state => [
		state.day,
		state.days,
		state.holidays,
		state.week,
		state.setWeek,
	]);
	const location = roleStore(state => state.location);
	const queryResult = useQueries({
		queries: [
			meshRangeQuery(days[0]?.format('YYYY-MM-DD'), days[6]?.format('YYYY-MM-DD'), location),
		],
	});

	useLayoutEffect(() => {
		setWeek(0);
	}, [setWeek]);

	const handleNextClick = e => {
		setWeek(week + 1);
	};
	const handleCurClick = e => {
		setWeek(0);
	};

	const handlePrevClick = e => {
		setWeek(week - 1);
	};

	const handleBackClick = e => {
		navigate(MESH_PATH);
	};

	const isLoading = queryResult.some(query => query.isRefetching || query.isPending);

	if (isLoading) return <Loading />;

	return (
		<main className='m-2 text-center'>
			<div className='flex my-2 gap-2 justify-end'>
				<Button variant='contained' color='warning' onClick={handleBackClick} className='flex-wrap'>
					<ArrowBackIcon />
					<p className='ml-2'>Atrás</p>
				</Button>
				<div className='flex gap-2'>
					<Button variant='contained' color='info' onClick={handlePrevClick} disabled={week === 0}>
						Semana anterior
					</Button>
					<Button variant='contained' onClick={handleCurClick} disabled={week === 0}>
						Semana actual
					</Button>
					<Button variant='contained' color='info' onClick={handleNextClick}>
						Semana siguiente
					</Button>
				</div>
			</div>
			<div className='flex flex-col gap-4'>
				<WeekCalendar days={days} holidays={holidays} day={day} data={queryResult[0].data} />
			</div>
		</main>
	);
}

export default MeshWeek;
