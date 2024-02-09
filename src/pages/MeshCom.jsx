import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import dayjs from 'dayjs';
import { Button, FormControl, InputLabel, MenuItem, Paper, Select, Tooltip } from '@mui/material';
import { getHolidaysByYear } from 'festivos-colombia';
import { useLayoutEffect, useState } from 'react';
import { create } from 'zustand';
import { shopStore } from '../stores/shopStore';
import Loading from '../components/utils/Loading';
import { useQueries } from '@tanstack/react-query';
import { meshRangeQuery } from '../clients/mesh.client';
import MonthCalendar from '../components/calendars/MonthCalendar';
import MonthRow from '../components/rows/MonthRow';
import { processDataRegisters } from '../utils/functions';
import ComRow from '../components/rows/ComRow';

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

function MeshCom() {
	const [month, day, days, holidays, weeksCalendar, setMonth] = meshStore(state => [
		state.month,
		state.day,
		state.days,
		state.holidays,
		state.weeksCalendar,
		state.setMonth,
	]);
	const shopsList = shopStore(state => state.shopsList);
	const [shop, setShop] = useState('');
	const first = days[0]?.format('YYYY-MM-DD');
	const second = days[days.length - 1]?.format('YYYY-MM-DD');
	const queryResult = useQueries({ queries: [meshRangeQuery(first, second, shop)] });
	const handlePrevClick = e => {
		setMonth(month - 1);
	};
	const handleNextClick = e => {
		setMonth(month + 1);
	};

	const handleCurClick = e => {
		setMonth(0);
	};

	const handleSelect = e => {
		setShop(e.target.value);
	};

	useLayoutEffect(() => {
		setMonth(0);
		if (shopsList.length > 0) {
			setShop(shopsList[0]?.id);
		}
	}, [setMonth, shopsList]);

	const isLoading =
		queryResult.some(query => query.isPending || query.isRefetching) ||
		(!shopsList && shopsList.length === 0);

	if (isLoading) return <Loading />;

	const dataWeek = processDataRegisters(weeksCalendar.length, days, queryResult[0].data);

	return (
		<main className='m-2'>
			<div className='flex gap-2 flex-wrap justify-around md:justify-end text-xl mb-2 font-semibold'>
				<FormControl component={Paper}>
					<InputLabel htmlFor='tiendas'>Tienda</InputLabel>
					<Select
						inputProps={{
							id: 'tiendas',
						}}
						sx={{ height: 'auto' }}
						value={shop}
						onChange={handleSelect}
						label='Tienda'
					>
						{shopsList.map(itemShop => (
							<MenuItem key={itemShop.id} value={itemShop.id}>
								{itemShop.nombre}
							</MenuItem>
						))}
					</Select>
				</FormControl>
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

				<Paper className='text-center flex w-32 md:w-60 bg-white shadow-md h-auto border-r capitalize'>
					<div className='m-auto'>{`${day.format('MMMM')} del ${day.year()}`}</div>
				</Paper>
			</div>
			<MonthCalendar
				key={day.month() + shop}
				days={days}
				weeksCalendar={weeksCalendar}
				holidays={holidays}
				curDay={day}
				weekComponent={month < 0 ? MonthRow : ComRow}
				curLocation={shop}
				dataWeek={dataWeek}
			/>
		</main>
	);
}
export default MeshCom;
