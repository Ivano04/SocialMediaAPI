from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    UserList,
    RegisterUserView,
    FollowUserView,
    AdminSelfView,
    UserAdminViewSet,
    UserProfileView,
)
from .token_views import CustomTokenObtainPairView

# Router per le viewset (admin)
router = DefaultRouter()
router.register('admin-users', UserAdminViewSet, basename='admin-users')

# Rotte individuali
urlpatterns = [
    path('', UserList.as_view(), name='user-list'),
    path('register/', RegisterUserView.as_view(), name='register'),
    path('follow/<str:username>/', FollowUserView.as_view(), name='follow-user'),
    path('token/', CustomTokenObtainPairView.as_view(), name='custom_token_obtain_pair'),
    path('admin-users/', AdminSelfView.as_view(), name='admin-self'),
    path('profile/<str:username>/', UserProfileView.as_view(), name='user-profile'),
]

# Aggiunta delle rotte registrate dal router
urlpatterns += router.urls
