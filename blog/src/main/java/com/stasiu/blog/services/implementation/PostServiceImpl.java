package com.stasiu.blog.services.implementation;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stasiu.blog.domain.PostStatus;
import com.stasiu.blog.domain.entities.Category;
import com.stasiu.blog.domain.entities.Post;
import com.stasiu.blog.domain.entities.Tag;
import com.stasiu.blog.repositories.PostRepository;
import com.stasiu.blog.services.CategoryService;
import com.stasiu.blog.services.PostService;
import com.stasiu.blog.services.TagService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final CategoryService categoryService;
    private final TagService tagService;
    
    @Override
    @Transactional(readOnly = true)
    public List<Post> getAllPosts(UUID categoryId, UUID tagId) {
        if(tagId != null && categoryId != null){
            Category category = categoryService.getCategoryById(categoryId);
            Tag tag = tagService.getTagById(tagId);
            return postRepository.findAllByStatusAndCategoryAndTagsContaining(
                PostStatus.PUBLISHED, 
                category, 
                tag
            );
        }
        if(categoryId != null){
            Category category = categoryService.getCategoryById(categoryId);
            return postRepository.findAllByStatusAndCategory(
                PostStatus.PUBLISHED, 
                category
            );
        }
        if(tagId != null){
            Tag tag = tagService.getTagById(tagId);
            return postRepository.findAllByStatusAndTagsContaining(
                PostStatus.PUBLISHED, 
                tag
            );
        }
        return postRepository.findAllByStatus(PostStatus.PUBLISHED);
    }

}
