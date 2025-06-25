from django.urls import path
from .views import UserList, RegisterUserView, FollowUserView, UserAdminViewSet
from rest_framework.routers import DefaultRouter

urlpatterns = [
    path('', UserList.as_view()),
    path('register/', RegisterUserView.as_view()),
    path('follow/<str:username>/', FollowUserView.as_view(), name='follow-user'),
]

router = DefaultRouter()
router.register('admin-users', UserAdminViewSet, basename='admin-users')

urlpatterns += router.urls

