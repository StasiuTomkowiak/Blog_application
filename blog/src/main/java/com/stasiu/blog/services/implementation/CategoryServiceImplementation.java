package com.stasiu.blog.services.implementation;

import java.util.List;

import org.springframework.stereotype.Service;

import com.stasiu.blog.domain.entities.Category;
import com.stasiu.blog.repositories.CategoryRepository;
import com.stasiu.blog.services.CategoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryServiceImplementation implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<Category> listCategories() {
        return categoryRepository.findAllWithPostCount();
    }

}
