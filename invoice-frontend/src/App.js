import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/customers/CustomerList';
import AddCustomer from './pages/customers/AddCustomer';
import EditCustomer from './pages/customers/EditCustomer';
import InvoiceList from './pages/invoices/InvoiceList';
import CreateInvoice from './pages/invoices/CreateInvoice';
import InvoiceDetails from './pages/invoices/InvoiceDetails';

// Components
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Theme
import { getTheme } from './theme';

function App() {
  const [mode, setMode] = React.useState('light');

  const theme = React.useMemo(() => getTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <Layout toggleTheme={toggleTheme} mode={mode}>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/customers" element={
            <PrivateRoute>
              <Layout toggleTheme={toggleTheme} mode={mode}>
                <CustomerList />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/customers/add" element={
            <PrivateRoute>
              <Layout toggleTheme={toggleTheme} mode={mode}>
                <AddCustomer />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/customers/edit/:id" element={
            <PrivateRoute>
              <Layout toggleTheme={toggleTheme} mode={mode}>
                <EditCustomer />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/invoices" element={
            <PrivateRoute>
              <Layout toggleTheme={toggleTheme} mode={mode}>
                <InvoiceList />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/invoices/create" element={
            <PrivateRoute>
              <Layout toggleTheme={toggleTheme} mode={mode}>
                <CreateInvoice />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/invoices/:id" element={
            <PrivateRoute>
              <Layout toggleTheme={toggleTheme} mode={mode}>
                <InvoiceDetails />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  );
}

export default App;