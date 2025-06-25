from django.urls import path
from .views import UserList
from .views import UserList, RegisterUserView, FollowUserView

urlpatterns = [
    path('', UserList.as_view()),
    path('register/', RegisterUserView.as_view()),
    path('follow/<str:username>/', FollowUserView.as_view(), name='follow-user'),
]
