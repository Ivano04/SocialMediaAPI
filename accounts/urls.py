from django.urls import path
from .views import UserList

from .views import RegisterUserView

urlpatterns = [
    path('', UserList.as_view()),
    path('register/', RegisterUserView.as_view()),
]
