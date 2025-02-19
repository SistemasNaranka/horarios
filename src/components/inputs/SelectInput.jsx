import { FormControl, FormHelperText, InputLabel, Select } from '@mui/material';
import { Controller } from 'react-hook-form';

const SelectInput = ({ name, label, children, control, disabled = false, onChange }) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field: { onChange: rhfOnChange, value, ref }, fieldState: { error } }) => (
				<FormControl className='w-full'>
					<InputLabel htmlFor={name}>{label}</InputLabel>
					<Select
						error={error?.message ? true : false}
						value={value}
						disabled={disabled}
						inputProps={{
							id: name,
						}}
						MenuProps={{ PaperProps: { sx: { maxHeight: '40vh' } } }}
						label={label}
						ref={ref}
						onChange={event => {
							rhfOnChange(event);
							if (onChange) onChange(event);
						}}
					>
						{children}
					</Select>
					<FormHelperText error={true}>{error?.message}</FormHelperText>
				</FormControl>
			)}
		/>
	);
};

export default SelectInput;
