import { Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';

/**
 *
 * @param {Object} props
 * @param {Dayjs} props.today
 * @param {String} props.name
 * @param {String} props.label
 * @param {Control} props.control
 * @returns
 */
const DatePickerInput = ({ name, label, today, control }) => {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
				<DatePicker
					label={label}
					value={value || today}
					ref={ref}
					format='DD/MM/YYYY'
					minDate={today}
					onChange={event => {
						onChange(event);
					}}
					slotProps={{
						textField: {
							helperText: error?.message || 'DD/MM/YYYY',
							error: error?.message ? true : false,
						},
					}}
				/>
			)}
		/>
	);
};

export default DatePickerInput;
