package com.stasiu.blog.services.implementation;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.stasiu.blog.domain.entities.User;
import com.stasiu.blog.repositories.UserRepository;
import com.stasiu.blog.services.UserService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User getUserById(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found with id:"  + id));
    }

}
