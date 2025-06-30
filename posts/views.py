from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Post, Comment, Like, Notification
from .serializers import PostSerializer, CommentSerializer, LikeSerializer, NotificationSerializer
from .permissions import IsAuthorOrReadOnly, IsAuthorOrAdmin, IsAdminUser

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly, IsAuthorOrAdmin]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrAdmin]

    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)
        post = comment.post
        if post.author != self.request.user:
            Notification.objects.create(
                recipient=post.author,
                actor=self.request.user,
                verb="ha commentato il tuo post",
                target_post=post
            )

class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        post_id = request.data.get('post')
        user = request.user

        existing_like = Like.objects.filter(post_id=post_id, user=user).first()
        if existing_like:
            existing_like.delete()
            return Response({'detail': 'Like rimosso'}, status=status.HTTP_204_NO_CONTENT)

        like = Like.objects.create(post_id=post_id, user=user)
        post = Post.objects.get(id=post_id)
        if post.author != user:
            Notification.objects.create(
                recipient=post.author,
                actor=user,
                verb="ha messo like al tuo post",
                target_post=post
            )

        serializer = self.get_serializer(like)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Notification.objects.filter(recipient=self.request.user)
        qs.update(is_read=True)
        return qs

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_notifications_count(request):
    count = Notification.objects.filter(recipient=request.user, is_read=False).count()
    return Response({"unread_count": count})

class AdminPostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class AdminCommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('-created_at')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
