package com.stasiu.blog.services;

import java.util.List;
import java.util.UUID;

import com.stasiu.blog.domain.CreatePostRequest;
import com.stasiu.blog.domain.entities.Post;
import com.stasiu.blog.domain.entities.User;

public interface PostService {

    List<Post> getAllPosts(UUID categoryId, UUID tagId);
    List<Post> getDraftPosts(User user); 
    Post createPost(User user, CreatePostRequest createPostRequest);
}
