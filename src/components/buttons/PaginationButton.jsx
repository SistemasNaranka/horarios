import { Pagination, Stack } from '@mui/material';
import { memo } from 'react';

/**
 *
 * @param {Object} props
 * @param {Number} props.page
 * @param {Number} props.count
 * @param {Function} props.handleNewPage
 * @returns
 */
const PaginationButton = ({ handleNewPage, count, page }) => {
	if (count < 2) {
		return <></>;
	}

	return (
		<Stack spacing={2} mt={1.5}>
			<Pagination count={count} shape='rounded' size='large' page={page} onChange={handleNewPage} />
		</Stack>
	);
};

export default memo(PaginationButton);
