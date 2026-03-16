package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.PostDto;
import com.example.demo.service.PostService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PostDto.PostResponse>> createPost(
            @Valid @RequestBody PostDto.CreatePostRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Post created", postService.createPost(request)));
    }

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<Page<PostDto.PostResponse>>> getFeed(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5.0") double radius,
            @RequestParam(defaultValue = "0")   int page,
            @RequestParam(defaultValue = "20")  int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                postService.getNearbyFeed(lat, lng, radius, page, size)));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<PostDto.PostResponse>> toggleLike(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(postService.toggleLike(id)));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<Page<PostDto.CommentResponse>>> getComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                postService.getComments(id, page, size)));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<PostDto.CommentResponse>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody PostDto.CommentRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Comment added",
                        postService.addComment(id, request.getText())));
    }
}
