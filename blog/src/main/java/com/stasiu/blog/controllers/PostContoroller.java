package com.stasiu.blog.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stasiu.blog.domain.dtos.PostDto;
import com.stasiu.blog.domain.entities.Post;
import com.stasiu.blog.mappers.PostMapper;
import com.stasiu.blog.services.PostService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(path = "/api/v1/posts")
@RequiredArgsConstructor
public class PostContoroller {

    private final PostService postService;
    private final PostMapper postMapper;

    @GetMapping
    public ResponseEntity<List<PostDto>> getAllPosts(
            @RequestParam(required = false) UUID categoryId, 
            @RequestParam(required = false) UUID tagId){
        List<Post> posts =  postService.getAllPosts(categoryId, tagId);
        List<PostDto> postDtos = posts.stream()
            .map(postMapper::toDto)
            .toList();
        return ResponseEntity.ok(postDtos);
    }

}
