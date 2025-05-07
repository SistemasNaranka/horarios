import 'dayjs/locale/es';
import 'dayjs/plugin/weekOfYear';
import dayjs from 'dayjs';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import theme from './components/utils/AppTheme';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './utils/queryClient';
import Loading from './components/utils/Loading';
import ConnectionListener from './components/utils/ConnectionListener';
import { Suspense } from 'react';
import AppRoutes from './routes/AppRoutes';

dayjs.locale('es');

function App() {
	return (
		<Suspense fallback={<Loading />}>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider theme={theme}>
					<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'es'}>
						<BrowserRouter>
							<ConnectionListener />
							<AppRoutes />
						</BrowserRouter>
					</LocalizationProvider>
				</ThemeProvider>
				<Toaster />
			</QueryClientProvider>
		</Suspense>
	);
}

export default App;
