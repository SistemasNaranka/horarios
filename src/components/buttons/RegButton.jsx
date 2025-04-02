// src/components/buttons/RegButton.jsx

import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import { Button, Tooltip, Typography } from '@mui/material';
import { memo, useState } from 'react';
import dayjs from 'dayjs';
import { createRegister } from '../../clients/reg.client';
import ReviewDialog from '../dialogs/ReviewDialog';
import checkErrorAlert from '../alerts/ErrorAlert';
import { roleStore } from '../../stores/roleStore';
import successAlert from '../alerts/SuccessAlert';
import useConnectionStore from '../../stores/connectionStore';

const RegButton = ({ disabled, handleNext, text = '', data, employee }) => {
	const location = roleStore(state => state.location);
	const [openReviewDialog, setOpenReviewDialog] = useState(false);
	const [curData, setCurData] = useState(data || {});
	const [curDisabled, setCurDisabled] = useState(false);
	const { isOnline } = useConnectionStore();

	const handleClickCheck = async () => {
		const time = dayjs();
		setCurDisabled(true);

		try {
			const registerData = isOnline
				? { evento: text, empleado: employee.id, tienda: location } // Modo online
				: {
						evento: text,
						empleado: { id: employee.id, nombre: employee.nombre },
						tienda: location,
				  }; // Modo offline

			const result = await createRegister(registerData);

			successAlert();
			setCurData({ hora: time.format('h:mm A'), id: result.id });
			handleNext();
		} catch (err) {
			setCurDisabled(false);
			checkErrorAlert();
		}
	};

	const handleOpenReviewDialog = () => setOpenReviewDialog(true);
	const handleCloseReviewDialog = () => {
		setOpenReviewDialog(false);
	};
	const getReview = review => setCurData({ ...curData, observaciones: review });

	return (
		<div className='inline-flex'>
			<div className='w-full'>
				<Button
					variant='contained'
					color='info'
					disabled={disabled || curDisabled}
					onClick={handleClickCheck}
					fullWidth
				>
					{text}
				</Button>
				{curData?.hora && (
					<Typography textAlign='center' height={'1rem'}>
						Registro {text}: <strong>{dayjs(`1/1/1 ${curData.hora}`).format('h:mm A')}</strong>
					</Typography>
				)}
			</div>
			<Tooltip title={'Observaciones'}>
				<span role='button'>
					<Button
						onClick={handleOpenReviewDialog}
						disabled={curData.hora ? false : true}
						aria-label='Observaciones'
					>
						<StickyNote2Icon fontSize='large' />
					</Button>
				</span>
			</Tooltip>
			<ReviewDialog
				open={openReviewDialog}
				onClose={handleCloseReviewDialog}
				checkText={text}
				id={curData.id}
				review={curData?.observaciones || null}
				getReview={getReview}
				name={employee.nombre}
			/>
		</div>
	);
};

export default memo(RegButton);
