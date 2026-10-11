package com.peoplehub.hrms.service;

import com.peoplehub.hrms.dto.DesignationDto;
import com.peoplehub.hrms.entity.Designation;
import com.peoplehub.hrms.repository.DesignationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DesignationService {

    private final DesignationRepository designationRepository;

    public DesignationService(DesignationRepository designationRepository) {
        this.designationRepository = designationRepository;
    }

    public List<DesignationDto> getAllDesignations() {
        return designationRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }
    
    public DesignationDto getDesignationById(Long id) {
        return designationRepository.findById(id).map(this::mapToDto).orElse(null);
    }

    public void saveDesignation(DesignationDto dto) {
        Designation desig = new Designation();
        if (dto.getId() != null) {
            desig = designationRepository.findById(dto.getId()).orElse(new Designation());
        }
        desig.setName(dto.getName());
        desig.setDescription(dto.getDescription());
        designationRepository.save(desig);
    }

    public void deleteDesignation(Long id) {
        designationRepository.deleteById(id);
    }

    private DesignationDto mapToDto(Designation desig) {
        DesignationDto dto = new DesignationDto();
        dto.setId(desig.getId());
        dto.setName(desig.getName());
        dto.setDescription(desig.getDescription());
        return dto;
    }
}
