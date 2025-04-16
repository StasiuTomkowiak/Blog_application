package com.stasiu.blog.services;

import java.util.UUID;

import com.stasiu.blog.domain.entities.User;

public interface UserService {
    User getUserById(UUID id);
}
