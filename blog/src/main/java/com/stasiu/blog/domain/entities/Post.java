package com.stasiu.blog.domain.entities;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.stasiu.blog.domain.PostStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import lombok.*;

@Entity
@Table(name = "posts")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PostStatus status;

    @Column(nullable = false)
    private Integer readingTime;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToMany
    @JoinTable(
        name = "post_tags",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // @Override
    // public int hashCode() {
    //     return java.util.Objects.hash(id, title, content, status, readingTime, createdAt, updatedAt);
    // }

    // @Override
    // public boolean equals(Object obj) {
    //     if (this == obj)
    //         return true;
    //     if (obj == null)
    //         return false;
    //     if (getClass() != obj.getClass())
    //         return false;
    //     Post other = (Post) obj;
    //     if (id == null) {
    //         if (other.id != null)
    //             return false;
    //     } else if (!id.equals(other.id))
    //         return false;
    //     if (title == null) {
    //         if (other.title != null)
    //             return false;
    //     } else if (!title.equals(other.title))
    //         return false;
    //     if (content == null) {
    //         if (other.content != null)
    //             return false;
    //     } else if (!content.equals(other.content))
    //         return false;
    //     if (status != other.status)
    //         return false;
    //     if (readingTime == null) {
    //         if (other.readingTime != null)
    //             return false;
    //     } else if (!readingTime.equals(other.readingTime))
    //         return false;
    //     if (createdAt == null) {
    //         if (other.createdAt != null)
    //             return false;
    //     } else if (!createdAt.equals(other.createdAt))
    //         return false;
    //     if (updatedAt == null) {
    //         if (other.updatedAt != null)
    //             return false;
    //     } else if (!updatedAt.equals(other.updatedAt))
    //         return false;
    //     return true;
    // }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
}
