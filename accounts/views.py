from rest_framework import generics
from .models import CustomUser
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import RegisterSerializer
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

User = get_user_model()

class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
class UserList(generics.ListAPIView):
    """
    Lista degli utenti registrati.
    Accessibile solo se autenticati via JWT.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

class FollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        user_to_follow = get_object_or_404(CustomUser, username=username)

        if request.user == user_to_follow:
            return Response({"detail": "You cannot follow yourself."}, status=400)

        if user_to_follow in request.user.following.all():
            return Response({"detail": "You are already following this user."}, status=400)

        request.user.following.add(user_to_follow)
        return Response({"detail": f"You are now following {username}."}, status=201)

    def delete(self, request, username):
        user_to_unfollow = get_object_or_404(CustomUser, username=username)

        if user_to_unfollow not in request.user.following.all():
            return Response({"detail": "You are not following this user."}, status=400)

        request.user.following.remove(user_to_unfollow)
        return Response({"detail": f"You have unfollowed {username}."}, status=204)
