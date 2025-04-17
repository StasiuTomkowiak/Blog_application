package com.stasiu.blog.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.stasiu.blog.domain.CreatePostRequest;
import com.stasiu.blog.domain.UpdatePostRequest;
import com.stasiu.blog.domain.dtos.CreatePostRequestDto;
import com.stasiu.blog.domain.dtos.PostDto;
import com.stasiu.blog.domain.dtos.UpdatePostRequestDto;
import com.stasiu.blog.domain.entities.Post;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PostMapper {

    @Mapping(target = "author", source = "author")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "tags", source = "tags")
    @Mapping(target = "status", source = "status") 
    PostDto toDto(Post post);

    CreatePostRequest toCreatePostRequest(CreatePostRequestDto dto);

    UpdatePostRequest toUpdatePostRequest(UpdatePostRequestDto dto);
}
