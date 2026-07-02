package com.iit.admin.controller;

import com.iit.admin.dto.InventoryAllocationDTO;
import com.iit.admin.dto.InventoryItemDTO;
import com.iit.admin.entity.InventoryAllocation;
import com.iit.admin.entity.InventoryItem;
import com.iit.admin.entity.Student;
import com.iit.admin.entity.Faculty;
import com.iit.admin.repository.FacultyRepository;
import com.iit.admin.repository.StudentRepository;
import com.iit.admin.service.InventoryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    // --- Items ---

    @GetMapping("/items")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INVENTORY_ADMIN')")
    public ResponseEntity<Page<InventoryItemDTO>> getItems(
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "itemName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<InventoryItem> items = inventoryService.searchItems(query, pageable);
        return ResponseEntity.ok(items.map(this::mapToItemDTO));
    }

    @PostMapping("/items")
    @PreAuthorize("hasRole('INVENTORY_ADMIN')")
    public ResponseEntity<InventoryItemDTO> createItem(
            @RequestBody InventoryItem item,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        InventoryItem saved = inventoryService.saveItem(item, userDetails.getUsername(), request.getRemoteAddr());
        return ResponseEntity.ok(mapToItemDTO(saved));
    }

    @PutMapping("/items/{id}")
    @PreAuthorize("hasRole('INVENTORY_ADMIN')")
    public ResponseEntity<InventoryItemDTO> updateItem(
            @PathVariable Long id,
            @RequestBody InventoryItem item,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        item.setId(id);
        InventoryItem saved = inventoryService.saveItem(item, userDetails.getUsername(), request.getRemoteAddr());
        return ResponseEntity.ok(mapToItemDTO(saved));
    }

    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasRole('INVENTORY_ADMIN')")
    public ResponseEntity<?> deleteItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        inventoryService.deleteItem(id, userDetails.getUsername(), request.getRemoteAddr());
        return ResponseEntity.ok(Map.of("message", "Inventory item deleted successfully."));
    }

    // --- Allocations ---

    @GetMapping("/allocations")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INVENTORY_ADMIN')")
    public ResponseEntity<List<InventoryAllocationDTO>> getAllocations(
            @RequestParam(required = false, defaultValue = "") String query) {
        List<InventoryAllocation> allocations = inventoryService.searchAllocations(query);
        List<InventoryAllocationDTO> dtos = allocations.stream().map(this::mapToAllocationDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/allocations")
    @PreAuthorize("hasRole('INVENTORY_ADMIN')")
    public ResponseEntity<InventoryAllocationDTO> allocateItem(
            @RequestBody Map<String, Object> requestBody,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String sku = (String) requestBody.get("sku");
        String username = (String) requestBody.get("username");
        int quantity = requestBody.containsKey("quantity") ? Integer.parseInt(requestBody.get("quantity").toString()) : 1;
        int daysToDue = requestBody.containsKey("daysToDue") ? Integer.parseInt(requestBody.get("daysToDue").toString()) : 0;

        InventoryAllocation saved = inventoryService.allocateItem(sku, username, quantity, daysToDue, userDetails.getUsername(), request.getRemoteAddr());
        return ResponseEntity.ok(mapToAllocationDTO(saved));
    }

    @PostMapping("/allocations/{id}/return")
    @PreAuthorize("hasRole('INVENTORY_ADMIN')")
    public ResponseEntity<InventoryAllocationDTO> returnItem(
            @PathVariable Long id,
            @RequestBody Map<String, String> requestBody,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String condition = requestBody.getOrDefault("condition", "RETURNED");
        InventoryAllocation saved = inventoryService.returnItem(id, condition, userDetails.getUsername(), request.getRemoteAddr());
        return ResponseEntity.ok(mapToAllocationDTO(saved));
    }

    // --- Mappers ---

    private InventoryItemDTO mapToItemDTO(InventoryItem item) {
        InventoryItemDTO dto = new InventoryItemDTO();
        dto.setId(item.getId());
        dto.setItemName(item.getItemName());
        dto.setSku(item.getSku());
        dto.setCategory(item.getCategory());
        dto.setDescription(item.getDescription());
        dto.setLocation(item.getLocation());
        dto.setTotalQuantity(item.getTotalQuantity());
        dto.setAvailableQuantity(item.getAvailableQuantity());
        dto.setCreatedAt(item.getCreatedAt());
        return dto;
    }

    private InventoryAllocationDTO mapToAllocationDTO(InventoryAllocation allocation) {
        InventoryAllocationDTO dto = new InventoryAllocationDTO();
        dto.setId(allocation.getId());
        dto.setItemId(allocation.getItem().getId());
        dto.setItemName(allocation.getItem().getItemName());
        dto.setItemSku(allocation.getItem().getSku());
        dto.setCategory(allocation.getItem().getCategory());
        
        dto.setAllocatedToId(allocation.getAllocatedTo().getId());
        dto.setAllocatedToUsername(allocation.getAllocatedTo().getUsername());
        
        dto.setAllocatedByUsername(allocation.getAllocatedBy().getUsername());
        dto.setQuantity(allocation.getQuantity());
        dto.setAllocationDate(allocation.getAllocationDate());
        dto.setExpectedReturnDate(allocation.getExpectedReturnDate());
        dto.setActualReturnDate(allocation.getActualReturnDate());
        dto.setStatus(allocation.getStatus());
        dto.setRemarks(allocation.getRemarks());
        dto.setCreatedAt(allocation.getCreatedAt());

        // Resolve display name
        String roleName = allocation.getAllocatedTo().getRole().getName();
        if ("ROLE_STUDENT".equals(roleName)) {
            Optional<Student> student = studentRepository.findByUserUsername(dto.getAllocatedToUsername());
            dto.setAllocatedToName(student.isPresent() ? student.get().getName() : dto.getAllocatedToUsername());
        } else if ("ROLE_FACULTY".equals(roleName)) {
            Optional<Faculty> faculty = facultyRepository.findByUserUsername(dto.getAllocatedToUsername());
            dto.setAllocatedToName(faculty.isPresent() ? faculty.get().getName() : dto.getAllocatedToUsername());
        } else {
            dto.setAllocatedToName(dto.getAllocatedToUsername());
        }

        return dto;
    }
}
