package com.stasiu.blog.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stasiu.blog.domain.dtos.CategoryDto;
import com.stasiu.blog.domain.dtos.CreateCategoryRequest;
import com.stasiu.blog.domain.entities.Category;
import com.stasiu.blog.mappers.CategoryMapper;
import com.stasiu.blog.services.CategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(path = "/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;

    @GetMapping
    public ResponseEntity<List<CategoryDto>> listCategories(){
        List<CategoryDto> categories = categoryService.listCategories()
        .stream().map(categoryMapper::toDto)
        .toList();

        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(        
        @Valid @RequestBody CreateCategoryRequest createCategoryRequest){
            
        Category categoryToCreate = categoryMapper.toEntity(createCategoryRequest);
        Category savedCategory = categoryService.createCategory(categoryToCreate);
        
        return new ResponseEntity<>(
            categoryMapper.toDto(savedCategory), 
            HttpStatus.CREATED
        );
    }
    
}
