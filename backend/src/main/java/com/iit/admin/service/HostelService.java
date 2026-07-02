package com.iit.admin.service;

import com.iit.admin.dto.*;
import com.iit.admin.entity.*;
import com.iit.admin.exception.BadRequestException;
import com.iit.admin.exception.ResourceNotFoundException;
import com.iit.admin.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HostelService {

    @Autowired
    private HostelRepository hostelRepository;

    @Autowired
    private HostelRoomRepository hostelRoomRepository;

    @Autowired
    private HostelAllotmentRepository hostelAllotmentRepository;

    @Autowired
    private HostelRequestRepository hostelRequestRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogService activityLogService;

    // --- Hostels ---

    @Transactional
    public HostelDTO createHostel(HostelDTO dto, String adminUsername, String ipAddress) {
        if (hostelRepository.findByName(dto.getName()).isPresent()) {
            throw new BadRequestException("Hostel name is already taken!");
        }
        Hostel hostel = new Hostel();
        hostel.setName(dto.getName());
        hostel.setType(dto.getType());
        hostel.setDescription(dto.getDescription());
        Hostel saved = hostelRepository.save(hostel);
        activityLogService.log(adminUsername, "CREATE_HOSTEL", "Created new hostel: " + saved.getName(), ipAddress);
        return mapToHostelDTO(saved);
    }

    @Transactional
    public HostelDTO updateHostel(Long id, HostelDTO dto, String adminUsername, String ipAddress) {
        Hostel hostel = hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with ID: " + id));

        hostelRepository.findByName(dto.getName()).ifPresent(h -> {
            if (!h.getId().equals(id)) {
                throw new BadRequestException("Hostel name is already in use by another hostel.");
            }
        });

        hostel.setName(dto.getName());
        hostel.setType(dto.getType());
        hostel.setDescription(dto.getDescription());
        Hostel updated = hostelRepository.save(hostel);
        activityLogService.log(adminUsername, "UPDATE_HOSTEL", "Updated hostel profile: " + updated.getName(), ipAddress);
        return mapToHostelDTO(updated);
    }

    @Transactional
    public void deleteHostel(Long id, String adminUsername, String ipAddress) {
        Hostel hostel = hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with ID: " + id));
        hostelRepository.delete(hostel);
        activityLogService.log(adminUsername, "DELETE_HOSTEL", "Deleted hostel: " + hostel.getName(), ipAddress);
    }

    public List<HostelDTO> getAllHostels() {
        return hostelRepository.findAll().stream().map(this::mapToHostelDTO).collect(Collectors.toList());
    }

    // --- Rooms ---

    @Transactional
    public HostelRoomDTO addRoom(Long hostelId, HostelRoomDTO dto, String adminUsername, String ipAddress) {
        Hostel hostel = hostelRepository.findById(hostelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with ID: " + hostelId));

        if (hostelRoomRepository.findByHostelIdAndRoomNumber(hostelId, dto.getRoomNumber()).isPresent()) {
            throw new BadRequestException("Room number " + dto.getRoomNumber() + " already exists in this hostel.");
        }

        int capacity = 1;
        if ("DOUBLE".equals(dto.getSharingType())) capacity = 2;
        else if ("TRIPLE".equals(dto.getSharingType())) capacity = 3;

        HostelRoom room = new HostelRoom();
        room.setHostel(hostel);
        room.setRoomNumber(dto.getRoomNumber());
        room.setSharingType(dto.getSharingType());
        room.setCapacity(capacity);
        room.setRent(dto.getRent());
        room.setOccupiedCount(0);

        HostelRoom saved = hostelRoomRepository.save(room);
        activityLogService.log(adminUsername, "ADD_HOSTEL_ROOM", "Added room " + saved.getRoomNumber() + " to hostel: " + hostel.getName(), ipAddress);
        return mapToRoomDTO(saved);
    }

    @Transactional
    public HostelRoomDTO updateRoom(Long roomId, HostelRoomDTO dto, String adminUsername, String ipAddress) {
        HostelRoom room = hostelRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));

        int capacity = 1;
        if ("DOUBLE".equals(dto.getSharingType())) capacity = 2;
        else if ("TRIPLE".equals(dto.getSharingType())) capacity = 3;

        if (room.getOccupiedCount() > capacity) {
            throw new BadRequestException("Cannot decrease sharing capacity below the current occupant count (" + room.getOccupiedCount() + ").");
        }

        room.setSharingType(dto.getSharingType());
        room.setCapacity(capacity);
        room.setRent(dto.getRent());

        HostelRoom updated = hostelRoomRepository.save(room);
        activityLogService.log(adminUsername, "UPDATE_HOSTEL_ROOM", "Updated room details for room ID: " + roomId, ipAddress);
        return mapToRoomDTO(updated);
    }

    @Transactional
    public void deleteRoom(Long roomId, String adminUsername, String ipAddress) {
        HostelRoom room = hostelRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));
        if (room.getOccupiedCount() > 0) {
            throw new BadRequestException("Cannot delete room because it currently has active student occupants.");
        }
        hostelRoomRepository.delete(room);
        activityLogService.log(adminUsername, "DELETE_HOSTEL_ROOM", "Deleted room number: " + room.getRoomNumber(), ipAddress);
    }

    public List<HostelRoomDTO> getRoomsInHostel(Long hostelId) {
        return hostelRoomRepository.findByHostelId(hostelId).stream().map(this::mapToRoomDTO).collect(Collectors.toList());
    }

    public List<HostelRoomDTO> getAvailableRoomsInHostel(Long hostelId) {
        // Fetch rooms where occupied count is less than capacity
        return hostelRoomRepository.findByHostelId(hostelId).stream()
                .filter(r -> r.getOccupiedCount() < r.getCapacity())
                .map(this::mapToRoomDTO)
                .collect(Collectors.toList());
    }

    // --- Allotments ---

    public Page<HostelAllotmentDTO> getActiveAllotments(Pageable pageable) {
        return hostelAllotmentRepository.findByStatus("ACTIVE", pageable).map(this::mapToAllotmentDTO);
    }

    public HostelAllotmentDTO getStudentAllotment(String username) {
        return hostelAllotmentRepository.findByStudentUserUsernameAndStatus(username, "ACTIVE")
                .map(this::mapToAllotmentDTO)
                .orElse(null);
    }

    @Transactional
    public HostelAllotmentDTO manualAllotRoom(Long studentId, Long roomId, String adminUsername, String ipAddress) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        HostelRoom room = hostelRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));

        if (hostelAllotmentRepository.findByStudentIdAndStatus(studentId, "ACTIVE").isPresent()) {
            throw new BadRequestException("Student already has an active room allotment.");
        }

        if (room.getOccupiedCount() >= room.getCapacity()) {
            throw new BadRequestException("Selected room " + room.getRoomNumber() + " is already at maximum capacity.");
        }

        HostelAllotment allotment = new HostelAllotment();
        allotment.setStudent(student);
        allotment.setRoom(room);
        allotment.setAllotmentDate(LocalDate.now());
        allotment.setStatus("ACTIVE");

        HostelAllotment saved = hostelAllotmentRepository.save(allotment);

        room.setOccupiedCount(room.getOccupiedCount() + 1);
        hostelRoomRepository.save(room);

        activityLogService.log(adminUsername, "ALLOT_HOSTEL_ROOM", "Allotted Room " + room.getRoomNumber() + " (" + room.getHostel().getName() + ") to student " + student.getName(), ipAddress);
        return mapToAllotmentDTO(saved);
    }

    @Transactional
    public void vacateRoom(Long allotmentId, String adminUsername, String ipAddress) {
        HostelAllotment allotment = hostelAllotmentRepository.findById(allotmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Allotment record not found with ID: " + allotmentId));

        if (!"ACTIVE".equals(allotment.getStatus())) {
            throw new BadRequestException("This allotment record is already closed/vacated.");
        }

        allotment.setStatus("VACATED");
        allotment.setVacateDate(LocalDate.now());
        hostelAllotmentRepository.save(allotment);

        HostelRoom room = allotment.getRoom();
        room.setOccupiedCount(Math.max(0, room.getOccupiedCount() - 1));
        hostelRoomRepository.save(room);

        activityLogService.log(adminUsername, "VACATE_HOSTEL_ROOM", "Vacated Room " + room.getRoomNumber() + " for student " + allotment.getStudent().getName(), ipAddress);
    }

    // --- Requests ---

    public Page<HostelRequestDTO> getPendingRequests(Pageable pageable) {
        return hostelRequestRepository.findByStatus("PENDING", pageable).map(this::mapToRequestDTO);
    }

    public Page<HostelRequestDTO> getStudentRequests(String username, Pageable pageable) {
        return hostelRequestRepository.findByStudentUserUsername(username, pageable).map(this::mapToRequestDTO);
    }

    @Transactional
    public HostelRequestDTO submitRequest(String username, HostelRequestDTO dto, String ipAddress) {
        Student student = studentRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + username));

        Hostel hostel = hostelRepository.findById(dto.getHostelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with ID: " + dto.getHostelId()));

        if (hostelAllotmentRepository.findByStudentIdAndStatus(student.getId(), "ACTIVE").isPresent()) {
            throw new BadRequestException("You already have an active room allotment. You must vacate your current room first.");
        }

        List<HostelRequest> pending = hostelRequestRepository.findByStudentUserUsernameAndStatus(username, "PENDING");
        if (!pending.isEmpty()) {
            throw new BadRequestException("You already have a pending room application request.");
        }

        HostelRequest req = new HostelRequest();
        req.setStudent(student);
        req.setHostel(hostel);
        req.setSharingType(dto.getSharingType());
        req.setStatus("PENDING");

        HostelRequest saved = hostelRequestRepository.save(req);
        activityLogService.log(username, "SUBMIT_HOSTEL_REQUEST", "Submitted hostel room request for preferred hostel: " + hostel.getName(), ipAddress);
        return mapToRequestDTO(saved);
    }

    @Transactional
    public HostelRequestDTO processRequest(Long requestId, String status, Long roomId, String remarks, String adminUsername, String ipAddress) {
        HostelRequest req = hostelRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel request not found with ID: " + requestId));

        if (!"PENDING".equals(req.getStatus())) {
            throw new BadRequestException("This request has already been actioned.");
        }

        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found: " + adminUsername));

        req.setStatus(status);
        req.setRemarks(remarks);
        req.setActionedBy(admin);

        if ("APPROVED".equals(status)) {
            if (roomId == null) {
                throw new BadRequestException("A Room ID must be specified to approve an allotment request.");
            }
            HostelRoom room = hostelRoomRepository.findById(roomId)
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));

            if (room.getOccupiedCount() >= room.getCapacity()) {
                throw new BadRequestException("Selected room " + room.getRoomNumber() + " is already full.");
            }

            HostelAllotment allotment = new HostelAllotment();
            allotment.setStudent(req.getStudent());
            allotment.setRoom(room);
            allotment.setAllotmentDate(LocalDate.now());
            allotment.setStatus("ACTIVE");
            hostelAllotmentRepository.save(allotment);

            room.setOccupiedCount(room.getOccupiedCount() + 1);
            hostelRoomRepository.save(room);

            activityLogService.log(adminUsername, "APPROVE_HOSTEL_REQUEST", "Approved hostel room request and allotted Room " + room.getRoomNumber() + " to student " + req.getStudent().getName(), ipAddress);
        } else {
            activityLogService.log(adminUsername, "REJECT_HOSTEL_REQUEST", "Rejected hostel room request for student " + req.getStudent().getName(), ipAddress);
        }

        HostelRequest saved = hostelRequestRepository.save(req);
        return mapToRequestDTO(saved);
    }

    // --- Mappers ---

    private HostelDTO mapToHostelDTO(Hostel hostel) {
        HostelDTO dto = new HostelDTO();
        dto.setId(hostel.getId());
        dto.setName(hostel.getName());
        dto.setType(hostel.getType());
        dto.setDescription(hostel.getDescription());
        return dto;
    }

    private HostelRoomDTO mapToRoomDTO(HostelRoom room) {
        HostelRoomDTO dto = new HostelRoomDTO();
        dto.setId(room.getId());
        dto.setHostelId(room.getHostel().getId());
        dto.setHostelName(room.getHostel().getName());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setSharingType(room.getSharingType());
        dto.setCapacity(room.getCapacity());
        dto.setRent(room.getRent());
        dto.setOccupiedCount(room.getOccupiedCount());
        return dto;
    }

    private HostelAllotmentDTO mapToAllotmentDTO(HostelAllotment allotment) {
        HostelAllotmentDTO dto = new HostelAllotmentDTO();
        dto.setId(allotment.getId());
        dto.setStudentId(allotment.getStudent().getId());
        dto.setStudentName(allotment.getStudent().getName());
        dto.setRollNumber(allotment.getStudent().getRollNumber());
        dto.setDepartment(allotment.getStudent().getDepartment().getName());
        dto.setRoomId(allotment.getRoom().getId());
        dto.setRoomNumber(allotment.getRoom().getRoomNumber());
        dto.setHostelName(allotment.getRoom().getHostel().getName());
        dto.setSharingType(allotment.getRoom().getSharingType());
        dto.setRent(allotment.getRoom().getRent());
        dto.setAllotmentDate(allotment.getAllotmentDate());
        dto.setVacateDate(allotment.getVacateDate());
        dto.setStatus(allotment.getStatus());
        return dto;
    }

    private HostelRequestDTO mapToRequestDTO(HostelRequest req) {
        HostelRequestDTO dto = new HostelRequestDTO();
        dto.setId(req.getId());
        dto.setStudentId(req.getStudent().getId());
        dto.setStudentName(req.getStudent().getName());
        dto.setRollNumber(req.getStudent().getRollNumber());
        dto.setDepartment(req.getStudent().getDepartment().getName());
        dto.setHostelId(req.getHostel().getId());
        dto.setHostelName(req.getHostel().getName());
        dto.setSharingType(req.getSharingType());
        dto.setStatus(req.getStatus());
        dto.setRemarks(req.getRemarks());
        dto.setActionedByName(req.getActionedBy() != null ? req.getActionedBy().getUsername() : null);
        dto.setCreatedAt(req.getCreatedAt());
        return dto;
    }
}
