package com.stasiu.blog.services;

import java.util.UUID;

import com.stasiu.blog.domain.dtos.SignUpRequest;
import com.stasiu.blog.domain.entities.User;

public interface UserService {
    User getUserById(UUID id);
    User signUpUser(SignUpRequest signUpRequest);
}
