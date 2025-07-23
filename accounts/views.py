from rest_framework import generics, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import CustomUser
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)
from posts.models import Notification

User = get_user_model()


class UserAdminViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class UserList(generics.ListAPIView):
    """
    Restituisce la lista di tutti gli utenti registrati.
    Accessibile solo se autenticati via JWT.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class FollowUserView(APIView):
    """
    Permette all'utente autenticato di seguire o smettere di seguire un altro utente.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        user_to_follow = get_object_or_404(CustomUser, username=username)

        if request.user == user_to_follow:
            return Response({"detail": "You cannot follow yourself."}, status=400)

        if user_to_follow in request.user.following.all():
            return Response({"detail": "You are already following this user."}, status=400)

        request.user.following.add(user_to_follow)

        Notification.objects.create(
            recipient=user_to_follow,
            actor=request.user,
            verb="ha iniziato a seguirti"
        )

        return Response({"detail": f"You are now following {username}."}, status=201)

    def delete(self, request, username):
        user_to_unfollow = get_object_or_404(CustomUser, username=username)

        if user_to_unfollow not in request.user.following.all():
            return Response({"detail": "You are not following this user."}, status=400)

        request.user.following.remove(user_to_unfollow)
        return Response({"detail": f"You have unfollowed {username}."}, status=204)


class AdminSelfView(APIView):
    """
    Restituisce i dati dell'utente autenticato.
    Utilizzata per l'accesso admin personale.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserProfileView(APIView):
    """
    Restituisce il profilo dettagliato di un utente (username, email, bio, follower/following, post).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        user = get_object_or_404(CustomUser, username=username)
        serializer = UserProfileSerializer(user, context={'request': request})
        return Response(serializer.data)
