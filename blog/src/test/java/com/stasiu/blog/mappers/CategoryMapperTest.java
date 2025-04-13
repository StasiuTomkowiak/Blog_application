package com.stasiu.blog.mappers;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.stasiu.blog.domain.PostStatus;
import com.stasiu.blog.domain.dtos.CategoryDto;
import com.stasiu.blog.domain.entities.Category;
import com.stasiu.blog.domain.entities.Post;

@SpringBootTest
class CategoryMapperTest {

    @Autowired
    private CategoryMapper categoryMapper;

    @Test
    void shouldMapCategoryToDto() {
        Category category = new Category();
        category.setName("Test Category");
        category.setPosts(List.of(new Post(null, null, null, PostStatus.PUBLISHED, null, null, category, null, null, null), new Post(null, null, null, PostStatus.DRAFT, null, null, category, null, null, null)));

        CategoryDto dto = categoryMapper.toDto(category);

        assertEquals("Test Category", dto.getName());
        assertEquals(1, dto.getPostCount());
    }
}