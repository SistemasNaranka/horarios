import { FormControl, FormHelperText, InputLabel, Select } from '@mui/material';
import { Controller } from 'react-hook-form';
import { ReactNode } from 'react';

/**
 *
 * @param {Object} props
 * @param {String} props.name
 * @param {String} props.label
 * @param {Control} props.control
 * @param {Boolean} props.disabled
 * @param {ReactNode} props.children
 * @returns
 */
const SelectInput = ({ name, label, children, control, disabled = false }) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
				<FormControl fullWidth>
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
							onChange(event);
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
