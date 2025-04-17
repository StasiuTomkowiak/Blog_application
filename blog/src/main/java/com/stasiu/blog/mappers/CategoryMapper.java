package com.stasiu.blog.mappers;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import com.stasiu.blog.domain.PostStatus;
import com.stasiu.blog.domain.dtos.CategoryDto;
import com.stasiu.blog.domain.dtos.CreateCategoryRequest;
import com.stasiu.blog.domain.dtos.UpdateCategoryRequest;
import com.stasiu.blog.domain.dtos.UpdateCategoryRequestDto;
import com.stasiu.blog.domain.entities.Category;
import com.stasiu.blog.domain.entities.Post;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CategoryMapper{

    @Mapping(target = "postCount", source="posts", qualifiedByName = "calculatePostCount")
    CategoryDto toDto(Category category);

    Category toEntity(CreateCategoryRequest createCategoryRequest);

    UpdateCategoryRequest toUpdateCategoryRequest(UpdateCategoryRequestDto updateCategoryRequestDto);

    @Named("calculatePostCount")
    default long calculatePostCount(List<Post> posts) {
        if(null == posts) {
            return 0;
        }
        return posts.stream()
                .filter(post -> PostStatus.PUBLISHED.equals(post.getStatus()))
                .count();
    }
}
