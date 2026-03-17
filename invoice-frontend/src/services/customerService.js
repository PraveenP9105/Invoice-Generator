import api from './api';

const customerService = {
  async getAllCustomers() {
    const response = await api.get('/customers');
    return response.data;
  },

  async getCustomerById(id) {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  async createCustomer(customerData) {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  async updateCustomer(id, customerData) {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },

  async deleteCustomer(id) {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  async searchCustomers(query) {
    const response = await api.get(`/customers/search?q=${query}`);
    return response.data;
  },
};

export default customerService;