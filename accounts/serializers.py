from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import get_user_model
from posts.models import Post

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    followers = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    following = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    is_staff = serializers.BooleanField(read_only=True)
    followers_count = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'bio', 'following', 'followers', 'followers_count', 'is_staff']

    def get_followers_count(self, obj):
        return obj.followers.count()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

class SimplePostSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'content', 'created_at', 'image']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class UserProfileSerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following = serializers.SerializerMethodField()
    followers = serializers.SerializerMethodField()
    posts = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'bio',
            'posts_count', 'following_count', 'followers_count',
            'following', 'followers', 'posts'
        ]

    def get_posts_count(self, obj):
        return Post.objects.filter(author=obj).count()

    def get_following_count(self, obj):
        return obj.following.count()

    def get_followers_count(self, obj):
        return CustomUser.objects.filter(following=obj).count()

    def get_following(self, obj):
        return list(obj.following.values_list('username', flat=True))

    def get_followers(self, obj):
        return list(CustomUser.objects.filter(following=obj).values_list('username', flat=True))

    def get_posts(self, obj):
        request = self.context.get('request')
        user_posts = Post.objects.filter(author=obj).order_by('-created_at')
        return SimplePostSerializer(user_posts, many=True, context={'request': request}).data
