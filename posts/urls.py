from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet, LikeViewSet

router = DefaultRouter()
router.register(r'', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet)
router.register(r'likes', LikeViewSet)

urlpatterns = router.urls
