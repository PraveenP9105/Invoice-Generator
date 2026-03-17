package com.invoice.backend.repository;

import com.invoice.backend.entity.Invoice;
import com.invoice.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByUser(User user);
    
    @Query("SELECT i FROM Invoice i WHERE i.user = :user AND i.status = :status")
    List<Invoice> findByUserAndStatus(@Param("user") User user, @Param("status") Invoice.InvoiceStatus status);
    
    @Query("SELECT i FROM Invoice i WHERE i.user = :user AND i.issueDate BETWEEN :startDate AND :endDate")
    List<Invoice> findByUserAndDateRange(@Param("user") User user, 
                                          @Param("startDate") LocalDate startDate, 
                                          @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.user = :user AND i.status = 'PAID'")
    Double getTotalPaidAmount(@Param("user") User user);
}