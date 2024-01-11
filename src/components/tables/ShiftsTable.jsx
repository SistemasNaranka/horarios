import { memo } from 'react';
import { useShiftStore } from '../../stores/shiftsStore';
import TableHis from './TableHis';

const ShiftsTable = () => {
	const stringShifts = useShiftStore(state => state.stringShifts);

	const titles = ['Turno', ...Array.from(Array(stringShifts.length), (_, i) => `Turno ${i + 1}`)];

	return (
		<TableHis titles={titles} center overy={false}>
			<tr>
				<td className='py-1 px-1 whitespace-nowrap border-r' />
				{stringShifts.map((shift, index) => (
					<td
						key={`turno${index}`}
						className='py-1 px-1 text-sm text-gray-500 whitespace-nowrap border-r'
					>
						{shift}
					</td>
				))}
			</tr>
		</TableHis>
	);
};

export default memo(ShiftsTable);
