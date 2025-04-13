package com.stasiu.blog.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import com.stasiu.blog.domain.entities.Category;
import com.stasiu.blog.repositories.CategoryRepository;
import com.stasiu.blog.services.implementation.CategoryServiceImpl;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    @Test
    void shouldCreateCategory() {
        Category category = new Category();
        category.setName("Test Category");

        when(categoryRepository.existsByNameIgnoreCase("Test Category")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenReturn(category);

        Category result = categoryService.createCategory(category);

        assertNotNull(result);
        assertEquals("Test Category", result.getName());
        verify(categoryRepository).save(category);
    }

    @Test
    void shouldThrowExceptionWhenCategoryExists() {
        Category category = new Category();
        category.setName("Test Category");

        when(categoryRepository.existsByNameIgnoreCase("Test Category")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> categoryService.createCategory(category));
    }

    @Test
    void shouldDeleteCategory() {
        UUID id = UUID.randomUUID();
        Category category = new Category();
        category.setPosts(List.of());

        when(categoryRepository.findById(id)).thenReturn(Optional.of(category));

        categoryService.deleteCategory(id);

        verify(categoryRepository).deleteById(id);
    }

}