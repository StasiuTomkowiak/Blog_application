package com.stasiu.blog.services;

import java.util.List;

import com.stasiu.blog.domain.entities.Category;

public interface CategoryService {

    List<Category> listCategories();
    
}
