package com.peoplehub.hrms.service;

import com.peoplehub.hrms.dto.HolidayDto;
import com.peoplehub.hrms.entity.Holiday;
import com.peoplehub.hrms.repository.HolidayRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HolidayService {
    private final HolidayRepository holidayRepository;

    public HolidayService(HolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }

    public List<Holiday> getAllHolidays() {
        return holidayRepository.findAllByOrderByDateAsc();
    }
    
    public List<Holiday> getHolidaysBetween(LocalDate start, LocalDate end) {
        return holidayRepository.findByDateBetweenOrderByDateAsc(start, end);
    }

    public HolidayDto getHolidayDtoById(Long id) {
        return holidayRepository.findById(id).map(h -> {
            HolidayDto dto = new HolidayDto();
            dto.setId(h.getId());
            dto.setName(h.getName());
            dto.setDate(h.getDate());
            dto.setDescription(h.getDescription());
            return dto;
        }).orElse(null);
    }

    public void saveHoliday(HolidayDto dto) {
        Holiday h = new Holiday();
        if (dto.getId() != null) {
            h = holidayRepository.findById(dto.getId()).orElse(new Holiday());
        }
        h.setName(dto.getName());
        h.setDate(dto.getDate());
        h.setDescription(dto.getDescription());
        holidayRepository.save(h);
    }

    public void deleteHoliday(Long id) {
        holidayRepository.deleteById(id);
    }
}
