import api from './api';

const invoiceService = {
  async getAllInvoices() {
    const response = await api.get('/invoices');
    return response.data;
  },

  async getInvoiceById(id) {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  async createInvoice(invoiceData) {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  },

  async updateInvoiceStatus(id, status) {
    const response = await api.put(`/invoices/${id}/status?status=${status}`);
    return response.data;
  },

  async deleteInvoice(id) {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },

async downloadInvoicePdf(id) {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      // Check if response is actually a PDF
      if (response.data.type !== 'application/pdf' && 
          !(response.data instanceof Blob)) {
        throw new Error('Invalid response format');
      }
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data], { 
        type: 'application/pdf' 
      }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      return response.data;
    } catch (error) {
      console.error('PDF download error:', error);
      
      // If error response is blob, try to read error message
      if (error.response && error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Failed to download PDF');
        } catch (e) {
          throw new Error('Failed to download PDF');
        }
      }
      throw error;
    }
  },

  async sendInvoiceByEmail(id, email) {
    try {
      const response = await api.post(`/invoices/${id}/email`, null, {
        params: { email: email }
      });
      return response.data;
    } catch (error) {
      console.error('Email send error:', error);
      
      // Try to get error message from response
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Failed to send email');
      }
      throw error;
    }
  },

  async getDashboardStats() {
    const response = await api.get('/invoices/dashboard/stats');
    return response.data;
  },
};

export default invoiceService;