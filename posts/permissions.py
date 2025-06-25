from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAuthorOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.method in SAFE_METHODS or obj.author == request.user

class IsAuthorOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        # lettura per tutti
        if request.method in SAFE_METHODS:
            return True
        # scrittura solo per autore o admin
        return obj.author == request.user or request.user.is_staff
