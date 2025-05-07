import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import { Button, Paper, Tooltip, Typography } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { memo, useState } from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BreakDialog from '../dialogs/BreakDialog';
import NewsDialog from '../dialogs/NewsDialog';
import { events } from '../../utils/constants';
import RegButton from '../buttons/RegButton';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
/**
 * @param {Object} props
 * @param {Array} props.checks
 * @param {String} props.event
 * @param {Boolean} props.disabled
 * @returns
 */
const findEvent = (checks, event, disabled = false) => {
	if (disabled) return checks.find(check => check.evento === event);
	return checks.find(check => check.evento === event);
};

const init = data => {
	const keys = Object.keys(events);
	let check = {
		init: true,
		lunch: true,
		endLunch: true,
		end: true,
		news: true,
		pause: true,
	};

	for (let i = 0; i < keys.length; i++) {
		if (!findEvent(data, events[keys[i]], true)) {
			check = {
				...check,
				[keys[i]]: false,
				...(events[keys[i]] === events.init ? { news: false } : { pause: false }),
			};
			break;
		}
	}
	return check;
};

/**
 *
 * @param {Object} props
 * @param {Array} props.checks
 * @param {Function} props.addNews
 * @param {Boolean} props.hasShift
 * @returns
 */
const RegCard = ({ data = [], employee, addNews, hasShift = true }) => {
	const [check, setChecks] = useState(init(data));
	const [openNewsDialog, setOpenNewsDialog] = useState(false);
	const handleOPenNewsDialog = () => setOpenNewsDialog(true);
	const handleCloseNewsDialog = () => setOpenNewsDialog(false);

	const [openBreakDialog, setOpenBreakDialog] = useState(false);
	const handleOpenBreakDialog = () => setOpenBreakDialog(true);
	const handleCloseBreakDialog = () => setOpenBreakDialog(false);

	const navigate = useNavigate();

	const handleInit = () => {
		setChecks({ ...check, init: true, lunch: false, news: true, pause: false });
	};

	const handleLunch = () => {
		setChecks({ ...check, lunch: true, endLunch: false });
	};

	const handleEndLunch = () => {
		setChecks({ ...check, endLunch: true, end: false });
	};

	const handleEnd = () => {
		setChecks({ ...check, end: true, pause: true });
	};

	return (
		<Paper sx={{ width: '30rem', padding: '0.8rem' }} elevation={3}>
			<div className='flex justify-between mb-2'>
				<div className='inline-flex gap-2 my-auto'>
					<Typography variant='h6' sx={{ marginY: 'auto' }}>
						{employee.nombre}
					</Typography>
				</div>
				<div className='flex'>
					<Tooltip title='Reportar Novedad'>
						<span role='button'>
							<Button onClick={handleOPenNewsDialog} disabled={check.news} color='secondary'>
								<ReportProblemIcon fontSize='large' />
							</Button>
						</span>
					</Tooltip>
					<Tooltip title='Reportar Pausa'>
						<span role='button'>
							<Button onClick={handleOpenBreakDialog} disabled={check.pause} color='pause'>
								<PauseCircleFilledIcon fontSize='large' />
							</Button>
						</span>
					</Tooltip>
				</div>
				<NewsDialog
					open={openNewsDialog}
					onClose={handleCloseNewsDialog}
					name={employee.nombre}
					addNews={addNews}
					cc={employee.id}
				/>
				<BreakDialog
					open={openBreakDialog}
					onClose={handleCloseBreakDialog}
					name={employee.nombre}
					cc={employee.id}
				/>
			</div>
			<hr className=' border-themeGrey/30 border-2' />
			{/* {!hasShift && (
				<div className='mt-2 text-center'>
					<div className='flex flex-col items-center justify-center gap-2'>
						<div className='flex items-center justify-center gap-2'>
							<Tooltip title='No tiene turno asignado'>
								<ErrorOutlineIcon color='error' sx={{ marginY: 'auto' }} />
							</Tooltip>
							<Typography variant='body1' color='textSecondary' sx={{ fontWeight: 'bold' }}>
								Este empleado no tiene turno asignado para hoy.
							</Typography>
						</div>
						<Link
							to='/home/week'
							style={{
								textDecoration: 'underline',
								color: '#007bff',
								cursor: 'pointer',
							}}
						>
							Asignar turno
						</Link>
					</div>
				</div>
			)} */}
			<div className='flex flex-col justify-center align-middle mt-2 gap-4'>
				<RegButton
					employee={employee}
					handleNext={handleInit}
					text={events.init}
					disabled={check.init}
					data={findEvent(data, events.init)}
				/>
				<RegButton
					employee={employee}
					handleNext={handleLunch}
					text={events.lunch}
					disabled={check.lunch}
					data={findEvent(data, events.lunch)}
				/>
				<RegButton
					employee={employee}
					handleNext={handleEndLunch}
					text={events.endLunch}
					disabled={check.endLunch}
					data={findEvent(data, events.endLunch)}
				/>
				<RegButton
					employee={employee}
					handleNext={handleEnd}
					text={events.end}
					disabled={check.end}
					data={findEvent(data, events.end)}
				/>
			</div>
		</Paper>
	);
};
export default memo(RegCard);
