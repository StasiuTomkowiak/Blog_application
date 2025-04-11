package com.stasiu.blog.domain.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false,unique = true)
    private String mail;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Post> posts = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // @Override
    // public boolean equals(Object o)
    // {
    //     if (this == o) return true;
    //     if (o == null || getClass() != o.getClass()) return false;
    //     User user = (User) o;
    //     return Objects.equals(id, user.id) && Objects.equals(mail, user.mail) && Objects.equals(password, user.password) && Objects.equals(name, user.name) && Objects.equals(createdAt, user.createdAt);
    // }

    // @Override
    // public int hashCode()
    // {
    //     return Objects.hash(id, mail, password, name, createdAt);
    // }

    @PrePersist
    protected void onCreate()
    {
        createdAt = LocalDateTime.now();
    }
}
