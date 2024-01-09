import { createTheme } from '@mui/material/styles';

const theme = createTheme({
	palette: {
		primary: {
			light: '#3F6288',
			main: '#556270',
			dark: '#2F363D',
			contrastText: '#FFF',
		},
		secondary: {
			light: '#FFB8B8',
			main: '#FF6B6B',
			dark: '#CC5656',
			contrastText: '#FFF',
		},
		pause: {
			light: '#FCEC6D',
			main: '#FCC96D',
			dark: '#FCB46D',
			contrastText: '#FFF',
		},
	},
});

export default theme;
