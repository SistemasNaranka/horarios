import 'dayjs/locale/es';
import 'dayjs/plugin/weekOfYear';
import dayjs from 'dayjs';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import theme from './components/utils/AppTheme';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './utils/queryClient';
import Loading from './components/utils/Loading';
import { Suspense, useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import OnlineAlertDialog from './components/dialogs/OnlineAlertDialog';
import useConnectionStore from './stores/connectionStore';

dayjs.locale('es');

function App() {
	const { isOnline, wasOffline, checkConnection } = useConnectionStore();

	useEffect(() => {
		const handleOnline = () => checkConnection();
		window.addEventListener('online', handleOnline);
		return () => window.removeEventListener('online', handleOnline);
	}, [checkConnection]);

	return (
		<Suspense fallback={<Loading />}>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider theme={theme}>
					<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'es'}>
						<BrowserRouter>
							<AppRoutes />
							<OnlineAlertDialog open={!isOnline && wasOffline} />
						</BrowserRouter>
					</LocalizationProvider>
				</ThemeProvider>
				<Toaster />
			</QueryClientProvider>
		</Suspense>
	);
}

export default App;
