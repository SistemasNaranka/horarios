import { memo } from 'react';
import { shiftStore } from '../../stores/shiftStore';
import TableHis from './TableHis';

const ShiftsTable = () => {
	const stringShifts = shiftStore(state => state.stringShifts);

	const titles = ['Turnos', ...Array.from(Array(stringShifts.length), (_, i) => `Turno ${i + 1}`)];

	return (
		<div style={{ maxHeight: '300px', overflowY: 'auto' }}>
			<TableHis titles={titles} center overy={false}>
				<tr>
					<td className='py-1 px-1 whitespace-nowrap border-r' />
					{stringShifts.map((shift, index) => (
						<td
							key={`turno${index}`}
							className='py-1 px-1 text-base font-semibold text-gray-700 whitespace-nowrap border-r'
							style={{
								whiteSpace: 'normal',
								wordWrap: 'break-word',
								padding: '1px 20px ',
							}}
						>
							{shift}
						</td>
					))}
				</tr>
			</TableHis>
		</div>
	);
};

export default memo(ShiftsTable);
