import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PictureAsPdf as PdfIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import invoiceService from '../../services/invoiceService';

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusDialog, setStatusDialog] = useState(false);
  const [emailDialog, setEmailDialog] = useState({ open: false, email: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await invoiceService.getInvoiceById(id);
      setInvoice(response.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error('Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      await invoiceService.downloadInvoicePdf(id);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await invoiceService.updateInvoiceStatus(id, newStatus);
      toast.success(`Invoice marked as ${newStatus}`);
      fetchInvoice();
      setStatusDialog(false);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSendEmail = async () => {
    if (!emailDialog.email) {
      toast.error('Please enter an email address');
      return;
    }
    
    try {
      await invoiceService.sendInvoiceByEmail(id, emailDialog.email);
      toast.success('Invoice sent successfully');
      setEmailDialog({ open: false, email: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    }
  };

  const openEmailDialog = () => {
    // If customer has email, pre-fill it and make it read-only
    const customerEmail = invoice?.customer?.email || '';
    setEmailDialog({ 
      open: true, 
      email: customerEmail,
      readOnly: !!customerEmail // Read-only if email exists
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PENDING': return 'warning';
      case 'OVERDUE': return 'error';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString();
    } catch {
      return '-';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h5" color="error" gutterBottom>
          Invoice not found
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/invoices')}>
          Back to Invoices
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/invoices')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            Invoice #{invoice.invoiceNumber}
          </Typography>
          <Chip
            label={invoice.status}
            color={getStatusColor(invoice.status)}
            sx={{ ml: 2 }}
          />
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<PdfIcon />}
            onClick={handleDownloadPdf}
            sx={{ mr: 1 }}
          >
            PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ mr: 1 }}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={openEmailDialog}
            sx={{ mr: 1 }}
          >
            Email
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setStatusDialog(true)}
          >
            Update Status
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 4, mb: 3 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  From
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {invoice.user?.name || 'Your Company'}
                </Typography>
                <Typography variant="body2">{invoice.user?.email}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Bill To
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {invoice.customer?.name || 'N/A'}
                </Typography>
                {invoice.customer?.email && (
                  <Typography variant="body2">Email: {invoice.customer.email}</Typography>
                )}
                {invoice.customer?.phone && (
                  <Typography variant="body2">Phone: {invoice.customer.phone}</Typography>
                )}
                {invoice.customer?.address && (
                  <Typography variant="body2">Address: {invoice.customer.address}</Typography>
                )}
                {invoice.customer?.gstNumber && (
                  <Typography variant="body2">GST: {invoice.customer.gstNumber}</Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Invoice Number
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {invoice.invoiceNumber}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Issue Date
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatDate(invoice.issueDate)}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Due Date
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatDate(invoice.dueDate)}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={invoice.status}
                  color={getStatusColor(invoice.status)}
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Invoice Items
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.totalPrice)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Box sx={{ width: 300 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography fontWeight="bold">
                    {formatCurrency(invoice.subtotal)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>GST (18%):</Typography>
                  <Typography fontWeight="bold">
                    {formatCurrency(invoice.gstAmount)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {formatCurrency(invoice.totalAmount)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {invoice.notes && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Notes
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2">{invoice.notes}</Typography>
                </Paper>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)}>
        <DialogTitle>Update Invoice Status</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', py: 2 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleUpdateStatus('PAID')}
            >
              Mark as Paid
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={() => handleUpdateStatus('PENDING')}
            >
              Mark as Pending
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => handleUpdateStatus('CANCELLED')}
            >
              Cancel Invoice
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Email Dialog */}
      <Dialog 
        open={emailDialog.open} 
        onClose={() => setEmailDialog({ open: false, email: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Invoice via Email</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={emailDialog.email}
            onChange={(e) => setEmailDialog({ ...emailDialog, email: e.target.value })}
            InputProps={{
              readOnly: emailDialog.readOnly,
              startAdornment: emailDialog.readOnly ? (
                <InputAdornment position="start">
                  <EmailIcon color="primary" />
                </InputAdornment>
              ) : null,
            }}
            helperText={emailDialog.readOnly ? 
              "This email is from customer record. Click send to proceed." : 
              "Enter email address to send invoice"}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialog({ open: false, email: '' })}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendEmail} 
            variant="contained"
            disabled={!emailDialog.email}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoiceDetails;