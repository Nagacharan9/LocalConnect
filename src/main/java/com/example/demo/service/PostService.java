package com.example.demo.service;

import com.example.demo.dto.PostDto;
import com.example.demo.entity.Comment;
import com.example.demo.entity.Post;
import com.example.demo.entity.PostLike;
import com.example.demo.entity.User;
import com.example.demo.enums.NotificationType;
import com.example.demo.exception.ApiException;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.PostLikeRepository;
import com.example.demo.repository.PostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostService {

    private final PostRepository      postRepository;
    private final PostLikeRepository  postLikeRepository;
    private final CommentRepository   commentRepository;
    private final UserService         userService;
    private final NotificationService notificationService;

    public PostService(PostRepository postRepository, PostLikeRepository postLikeRepository, CommentRepository commentRepository, UserService userService, NotificationService notificationService) {
        this.postRepository = postRepository;
        this.postLikeRepository = postLikeRepository;
        this.commentRepository = commentRepository;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    @Transactional
    public PostDto.PostResponse createPost(PostDto.CreatePostRequest req) {
        User author = userService.currentUser();
        Post post = Post.builder()
                .author(author)
                .content(req.getContent())
                .imageUrl(req.getImageUrl())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .build();
        post = postRepository.save(post);
        return PostDto.PostResponse.from(post, false);
    }

    @Transactional(readOnly = true)
    public Page<PostDto.PostResponse> getNearbyFeed(double lat, double lng,
                                                     double radiusKm, int page, int size) {
        User me = userService.currentUser();
        return postRepository
                .findNearbyPosts(lat, lng, radiusKm, PageRequest.of(page, size))
                .map(p -> PostDto.PostResponse.from(p,
                        postLikeRepository.existsByPostIdAndUserId(p.getId(), me.getId())));
    }

    @Transactional
    public PostDto.PostResponse toggleLike(Long postId) {
        User me = userService.currentUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> ApiException.notFound("Post not found"));

        postLikeRepository.findByPostIdAndUserId(postId, me.getId()).ifPresentOrElse(
                like -> {
                    postLikeRepository.delete(like);
                    post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
                },
                () -> {
                    postLikeRepository.save(PostLike.builder().post(post).user(me).build());
                    post.setLikeCount(post.getLikeCount() + 1);
                    // Notify post author
                    if (!post.getAuthor().getId().equals(me.getId())) {
                        notificationService.send(
                            post.getAuthor().getId(), NotificationType.POST_LIKE,
                            me.getName() + " liked your post",
                            post.getContent().substring(0, Math.min(60, post.getContent().length())),
                            post.getId()
                        );
                    }
                }
        );
        return PostDto.PostResponse.from(postRepository.save(post),
                postLikeRepository.existsByPostIdAndUserId(postId, me.getId()));
    }

    @Transactional
    public PostDto.CommentResponse addComment(Long postId, String text) {
        User me = userService.currentUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> ApiException.notFound("Post not found"));

        Comment comment = Comment.builder().post(post).author(me).text(text).build();
        comment = commentRepository.save(comment);
        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        if (!post.getAuthor().getId().equals(me.getId())) {
            notificationService.send(
                post.getAuthor().getId(), NotificationType.POST_COMMENT,
                me.getName() + " commented on your post",
                text.substring(0, Math.min(80, text.length())),
                post.getId()
            );
        }
        return PostDto.CommentResponse.from(comment);
    }

    @Transactional(readOnly = true)
    public Page<PostDto.CommentResponse> getComments(Long postId, int page, int size) {
        if (!postRepository.existsById(postId)) throw ApiException.notFound("Post not found");
        return commentRepository
                .findByPostIdOrderByCreatedAtAsc(postId, PageRequest.of(page, size))
                .map(PostDto.CommentResponse::from);
    }
}
