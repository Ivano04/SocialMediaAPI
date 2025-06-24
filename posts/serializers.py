from rest_framework import serializers
from .models import Post, Comment, Like
from accounts.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    author = UserSerializer(read_only=True)
    likes = LikeSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'created_at', 'comments', 'likes']
