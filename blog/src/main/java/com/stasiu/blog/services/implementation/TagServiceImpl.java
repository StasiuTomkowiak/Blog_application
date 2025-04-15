package com.stasiu.blog.services.implementation;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.stasiu.blog.domain.entities.Tag;
import com.stasiu.blog.repositories.TagRepository;
import com.stasiu.blog.services.TagService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;
    
    @Override
    public List<Tag> getTags() {
        return tagRepository.findAllWithPostCount();        
    }

    @Transactional
    @Override
    public List<Tag> createTags(Set<String> tagNames) {
        List<Tag> existingTags = tagRepository.findByNameIn(tagNames);

        Set<String> existingTagnames = existingTags.stream()
            .map(Tag::getName)
            .collect(Collectors.toSet());

        List<Tag> newtags = tagNames.stream()
            .filter(tagName -> !existingTagnames.contains(tagName))
            .map(name -> Tag.builder()
                .name(name)
                .posts(new HashSet<>())
                .build())
            .toList();
        
        List<Tag> savedTags = new ArrayList<>();

        if(!newtags.isEmpty()) {
            savedTags = tagRepository.saveAll(newtags);
        }

        savedTags.addAll(existingTags);
        return savedTags;
    }

}
