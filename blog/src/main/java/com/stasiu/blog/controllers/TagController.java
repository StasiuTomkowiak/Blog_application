package com.stasiu.blog.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stasiu.blog.domain.dtos.TagResponse;
import com.stasiu.blog.domain.entities.Tag;
import com.stasiu.blog.mappers.TagMapper;
import com.stasiu.blog.services.TagService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;
    private final TagMapper tagMapper;
    
    @GetMapping
    public ResponseEntity<List<TagResponse>> getAllTags() {

        List<Tag> tags = tagService.getTags();
        List<TagResponse> tagResponses = tags.stream().map(tagMapper::toTagResponse).toList();
        return ResponseEntity.ok(tagResponses);
    }
}
