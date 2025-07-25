package com.example.retotecnico.services;

import com.example.retotecnico.models.UserEntity;

import java.util.List;

public interface UserService {

    UserEntity createUser(UserEntity user);
    UserEntity updateUser(Long userId,UserEntity user);
    void deleteUser(Long userId);
    UserEntity getUserById(Long userId);
    List<UserEntity> getAllUsers();
    UserEntity getUserByUsername(String username);
}
