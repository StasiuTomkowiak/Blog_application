package com.stasiu.blog.repositories;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.stasiu.blog.domain.entities.Category;

@DataJpaTest
class CategoryRepositoryTest {

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void shouldReturnTrueIfCategoryExists() {
        Category category = new Category();
        category.setName("Test Category");
        categoryRepository.save(category);

        boolean exists = categoryRepository.existsByNameIgnoreCase("Test Category");

        assertTrue(exists);
    }

    @Test
    void shouldReturnFalseIfCategoryDoesNotExist() {
        boolean exists = categoryRepository.existsByNameIgnoreCase("Nonexistent Category");

        assertFalse(exists);
    }
}