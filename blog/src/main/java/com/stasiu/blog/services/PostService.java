package com.stasiu.blog.services;

import java.util.List;
import java.util.UUID;

import com.stasiu.blog.domain.CreatePostRequest;
import com.stasiu.blog.domain.UpdatePostRequest;
import com.stasiu.blog.domain.entities.Post;
import com.stasiu.blog.domain.entities.User;

public interface PostService {

    Post getPost(UUID id);
    List<Post> getAllPosts(UUID categoryId, UUID tagId);
    List<Post> getDraftPosts(User user); 
    Post createPost(User user, CreatePostRequest createPostRequest);
    Post updatePost(UUID id, UpdatePostRequest updatePostRequest);
    void deletePost(UUID id);

}
