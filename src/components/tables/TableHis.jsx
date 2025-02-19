import { Paper } from '@mui/material';
import { ReactNode } from 'react';

/**
 *
 * @param {Object} props
 * @param {String} props.h
 * @param {Boolean} props.overy
 * @param {Boolean} props.center
 * @param {ReactNode} props.children
 * @param {Array<String>} props.titles
 * @returns
 */
const TableHis = ({ children, titles = [], center = false, overy = true, h = 76 }) => {
	return (
		<>
			<Paper className='bg-white' elevation={3}>
				<div
					className={`${overy && 'overflow-y-scroll'} overflow-auto`}
					style={{ maxHeight: `${h}vh` }}
				>
					<table className='table-auto w-full '>
						<thead className='sticky top-0 z-1 bg-slate-100'>
							<tr className=''>
								{titles.map(title => (
									<th key={title} className='px-2 font-bold text-lg text-center py-3'>
										{title}
									</th>
								))}
							</tr>
						</thead>
						<tbody>{children}</tbody>
					</table>
				</div>
			</Paper>
		</>
	);
};

export default TableHis;
