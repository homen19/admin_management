package com.iit.admin.service;

import com.iit.admin.entity.InventoryAllocation;
import com.iit.admin.entity.InventoryItem;
import com.iit.admin.entity.User;
import com.iit.admin.exception.BadRequestException;
import com.iit.admin.exception.ResourceNotFoundException;
import com.iit.admin.repository.InventoryAllocationRepository;
import com.iit.admin.repository.InventoryItemRepository;
import com.iit.admin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class InventoryService {

    @Autowired
    private InventoryItemRepository itemRepository;

    @Autowired
    private InventoryAllocationRepository allocationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogService activityLogService;

    // --- Items ---

    @Transactional(readOnly = true)
    public Page<InventoryItem> searchItems(String query, Pageable pageable) {
        if (query == null || query.trim().isEmpty()) {
            return itemRepository.findAll(pageable);
        }
        return itemRepository.searchItems(query, pageable);
    }

    @Transactional(readOnly = true)
    public InventoryItem getItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with ID: " + id));
    }

    @Transactional
    public InventoryItem saveItem(InventoryItem item, String adminUsername, String ipAddress) {
        if (item.getId() == null) {
            // New item
            if (itemRepository.findBySku(item.getSku()).isPresent()) {
                throw new BadRequestException("Inventory Item with SKU " + item.getSku() + " already exists!");
            }
            item.setAvailableQuantity(item.getTotalQuantity());
            InventoryItem saved = itemRepository.save(item);
            activityLogService.log(adminUsername, "ADD_INVENTORY", "Added new item " + item.getItemName() + " (SKU: " + item.getSku() + ")", ipAddress);
            return saved;
        } else {
            // Update item
            InventoryItem existing = getItemById(item.getId());
            int diff = item.getTotalQuantity() - existing.getTotalQuantity();
            int newAvailable = existing.getAvailableQuantity() + diff;
            
            if (newAvailable < 0) {
                throw new BadRequestException("Cannot reduce total quantity below currently allocated quantity!");
            }
            
            existing.setItemName(item.getItemName());
            existing.setCategory(item.getCategory());
            existing.setDescription(item.getDescription());
            existing.setLocation(item.getLocation());
            existing.setTotalQuantity(item.getTotalQuantity());
            existing.setAvailableQuantity(newAvailable);
            
            InventoryItem saved = itemRepository.save(existing);
            activityLogService.log(adminUsername, "UPDATE_INVENTORY", "Updated item " + item.getItemName() + " (SKU: " + existing.getSku() + ")", ipAddress);
            return saved;
        }
    }

    @Transactional
    public void deleteItem(Long id, String adminUsername, String ipAddress) {
        InventoryItem item = getItemById(id);
        if (item.getAvailableQuantity() < item.getTotalQuantity()) {
            throw new BadRequestException("Cannot delete item because some units are currently allocated!");
        }
        itemRepository.delete(item);
        activityLogService.log(adminUsername, "DELETE_INVENTORY", "Deleted item " + item.getItemName(), ipAddress);
    }

    // --- Allocations ---

    @Transactional(readOnly = true)
    public List<InventoryAllocation> searchAllocations(String query) {
        if (query == null || query.trim().isEmpty()) {
            return allocationRepository.findAll();
        }
        return allocationRepository.searchAllocations(query);
    }

    @Transactional
    public InventoryAllocation allocateItem(String sku, String username, int quantity, int daysToDue, String adminUsername, String ipAddress) {
        InventoryItem item = itemRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with SKU: " + sku));

        if (item.getAvailableQuantity() < quantity) {
            throw new BadRequestException("Not enough available quantity in stock! Available: " + item.getAvailableQuantity());
        }

        User borrower = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        // Create allocation record
        InventoryAllocation allocation = new InventoryAllocation();
        allocation.setItem(item);
        allocation.setAllocatedTo(borrower);
        allocation.setAllocatedBy(admin);
        allocation.setQuantity(quantity);
        allocation.setAllocationDate(LocalDate.now());
        if (daysToDue > 0) {
            allocation.setExpectedReturnDate(LocalDate.now().plusDays(daysToDue));
        }
        allocation.setStatus("ALLOCATED");

        // Update item stock
        item.setAvailableQuantity(item.getAvailableQuantity() - quantity);
        itemRepository.save(item);

        InventoryAllocation saved = allocationRepository.save(allocation);
        
        activityLogService.log(adminUsername, "ALLOCATE_INVENTORY", 
                String.format("Allocated %dx %s to user %s", quantity, item.getItemName(), username), 
                ipAddress);

        return saved;
    }

    @Transactional
    public InventoryAllocation returnItem(Long allocationId, String condition, String adminUsername, String ipAddress) {
        InventoryAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation record not found"));

        if (!"ALLOCATED".equals(allocation.getStatus())) {
            throw new BadRequestException("This allocation is already marked as returned or damaged!");
        }

        InventoryItem item = allocation.getItem();
        
        if ("DAMAGED".equalsIgnoreCase(condition)) {
            allocation.setStatus("DAMAGED");
            // If damaged, we might permanently reduce total quantity or keep it as damaged logic.
            // Let's reduce total quantity since it's permanently removed from working stock
            item.setTotalQuantity(item.getTotalQuantity() - allocation.getQuantity());
        } else {
            allocation.setStatus("RETURNED");
            item.setAvailableQuantity(item.getAvailableQuantity() + allocation.getQuantity());
        }
        
        itemRepository.save(item);

        allocation.setActualReturnDate(LocalDate.now());
        InventoryAllocation saved = allocationRepository.save(allocation);

        activityLogService.log(adminUsername, "RETURN_INVENTORY", 
                String.format("Marked %s returned by user %s. Condition: %s", 
                        item.getItemName(), allocation.getAllocatedTo().getUsername(), condition), 
                ipAddress);

        return saved;
    }
}
