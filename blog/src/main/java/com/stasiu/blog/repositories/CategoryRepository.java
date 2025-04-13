package com.stasiu.blog.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.stasiu.blog.domain.entities.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    
}
