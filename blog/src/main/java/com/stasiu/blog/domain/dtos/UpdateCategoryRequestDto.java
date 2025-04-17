package com.stasiu.blog.domain.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCategoryRequestDto {

    @NotBlank(message = "Category name is required")
    @Size(min = 3, max = 50, message = "Category name must be between {min} and {max} characters")
    @Pattern(regexp = "^[\\w\\s-]+$", message = "Category name can only contain letters, numbers, and spaces or hyphens")
    private String name;
}
