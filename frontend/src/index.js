
import reportWebVitals from './reportWebVitals';
import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated import for React 18
import './index.css';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Find the root DOM element
const rootElement = document.getElementById('root');

// Create a root for React 18
const root = ReactDOM.createRoot(rootElement);

// Render the app
root.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
);


reportWebVitals();