import { Route, Routes } from 'react-router-dom';
import { lazy, useEffect } from 'react';
import { shopsQuery } from '../clients/aux_client';
import { useQueries } from '@tanstack/react-query';
import { shopStore } from '../stores/shopStore';
import Loading from '../components/utils/Loading';

const MeshCom = lazy(() => import('../pages/MeshCom'));

/**
 *
 * @param {Object} props
 * @param {String} props.location
 * @param {String} props.role
 * @returns
 */
function StructureRoutesCom() {
	const setShops = shopStore(state => state.setShops);
	const queryResults = useQueries({
		queries: [shopsQuery()],
	});
	useEffect(() => {
		if (queryResults[0].data) {
			setShops(queryResults[0].data);
		}
	}, [queryResults, setShops]);

	const isLoading = queryResults.some(query => query.isRefetching || query.isPending);

	if (isLoading) return <Loading />;

	return (
		<Routes>
			<Route index element={<MeshCom />} />
		</Routes>
	);
}
export default StructureRoutesCom;
