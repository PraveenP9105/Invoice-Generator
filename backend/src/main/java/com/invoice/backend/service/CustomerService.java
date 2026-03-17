package com.invoice.backend.service;

import com.invoice.backend.dto.CustomerDTO;
import com.invoice.backend.entity.Customer;
import com.invoice.backend.entity.User;
import com.invoice.backend.repository.CustomerRepository;
import com.invoice.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    private CustomerDTO convertToDTO(Customer customer) {
        CustomerDTO dto = new CustomerDTO();
        dto.setId(customer.getId());
        dto.setName(customer.getName());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setAddress(customer.getAddress());
        dto.setGstNumber(customer.getGstNumber());
        return dto;
    }
    
    private Customer convertToEntity(CustomerDTO dto) {
        Customer customer = new Customer();
        customer.setName(dto.getName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setAddress(dto.getAddress());
        customer.setGstNumber(dto.getGstNumber());
        return customer;
    }
    
    @Transactional
    public CustomerDTO createCustomer(CustomerDTO customerDTO) {
        User currentUser = getCurrentUser();
        Customer customer = convertToEntity(customerDTO);
        customer.setUser(currentUser);
        
        customer = customerRepository.save(customer);
        return convertToDTO(customer);
    }
    
    public List<CustomerDTO> getAllCustomers() {
        User currentUser = getCurrentUser();
        return customerRepository.findByUser(currentUser)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public CustomerDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        // Verify ownership
        if (!customer.getUser().getEmail().equals(getCurrentUser().getEmail())) {
            throw new RuntimeException("Access denied");
        }
        
        return convertToDTO(customer);
    }
    
    @Transactional
    public CustomerDTO updateCustomer(Long id, CustomerDTO customerDTO) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        // Verify ownership
        if (!customer.getUser().getEmail().equals(getCurrentUser().getEmail())) {
            throw new RuntimeException("Access denied");
        }
        
        customer.setName(customerDTO.getName());
        customer.setEmail(customerDTO.getEmail());
        customer.setPhone(customerDTO.getPhone());
        customer.setAddress(customerDTO.getAddress());
        customer.setGstNumber(customerDTO.getGstNumber());
        
        customer = customerRepository.save(customer);
        return convertToDTO(customer);
    }
    
    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        // Verify ownership
        if (!customer.getUser().getEmail().equals(getCurrentUser().getEmail())) {
            throw new RuntimeException("Access denied");
        }
        
        customerRepository.delete(customer);
    }
    
    public List<CustomerDTO> searchCustomers(String searchTerm) {
        User currentUser = getCurrentUser();
        return customerRepository.searchCustomers(currentUser, searchTerm)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}