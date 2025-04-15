package com.stasiu.blog.services.implementation;

import java.util.List;

import org.springframework.stereotype.Service;

import com.stasiu.blog.domain.entities.Tag;
import com.stasiu.blog.repositories.TagRepository;
import com.stasiu.blog.services.TagService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;
    
    @Override
    public List<Tag> getTags() {
        return tagRepository.findAllWithPostCount();        
    }

}
