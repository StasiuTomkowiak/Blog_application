package com.stasiu.blog.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.stasiu.blog.domain.PostStatus;
import com.stasiu.blog.domain.entities.Category;
import com.stasiu.blog.domain.entities.Post;
import com.stasiu.blog.domain.entities.Tag;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    
    List<Post> findAllByStatusAndCategoryAndTagsContaining(
        PostStatus status, 
        Category category, 
        Tag tags
    );
    List<Post> findAllByStatusAndCategory(
        PostStatus status, 
        Category category
    );
    List<Post> findAllByStatusAndTagsContaining(
        PostStatus status, 
        Tag tags
    );
    List<Post> findAllByStatus(
        PostStatus status
    );


}
