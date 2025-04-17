package com.stasiu.blog.services.implementation;

import java.util.UUID;

import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.stereotype.Service;

import com.stasiu.blog.domain.dtos.SignUpRequest;
import com.stasiu.blog.domain.entities.User;
import com.stasiu.blog.repositories.UserRepository;
import com.stasiu.blog.services.UserService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
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

    @Override
    @Transactional
    public User signUpUser(SignUpRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already in use: " + signUpRequest.getEmail());
        }

        User newUser = User.builder()
            .name(signUpRequest.getName())
            .email(signUpRequest.getEmail())
            .password(PasswordEncoderFactories.createDelegatingPasswordEncoder().encode(signUpRequest.getPassword()))
            .build();

        return userRepository.save(newUser);
    }

}
