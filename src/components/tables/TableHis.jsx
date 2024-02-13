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
const TableHis = ({ children, titles = [], center = false, overy = true, h = 80 }) => {
	return (
		<>
			<Paper className='bg-white' elevation={3}>
				<div className={`${overy && 'overflow-y-scroll'} `} style={{ maxHeight: `${h}vh` }}>
					<table className='table-auto w-full'>
						<thead className='sticky top-0 z-10'>
							<tr className='bg-gray-100'>
								{titles.map(title => (
									<th
										key={title}
										className={`text-left py-3 font-medium border-r ${center && 'text-center'}`}
									>
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
