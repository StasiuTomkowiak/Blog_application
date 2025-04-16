package com.stasiu.blog.services;

import java.util.List;
import java.util.UUID;

import com.stasiu.blog.domain.entities.Post;

public interface PostService {

    List<Post> getAllPosts(UUID categoryId, UUID tagId);
}
