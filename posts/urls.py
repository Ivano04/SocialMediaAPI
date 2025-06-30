from rest_framework.routers import DefaultRouter
from .views import (
    PostViewSet,
    CommentViewSet,
    LikeViewSet,
    AdminPostViewSet,
    AdminCommentViewSet,
    NotificationViewSet,
    unread_notifications_count
)
from django.urls import path

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet)
router.register(r'likes', LikeViewSet)
router.register(r'admin-posts', AdminPostViewSet, basename='admin-posts')
router.register(r'admin-comments', AdminCommentViewSet, basename='admin-comments')
router.register(r'notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('notifications/unread_count/', unread_notifications_count),
] + router.urls
