from django.urls import path
from .views import (
    StateListCreateView, StateRetrieveUpdateDestroyView,
    UserListCreateView, UserRetrieveUpdateDestroyView,
    TaskListCreateView, TaskRetrieveUpdateDestroyView
)

urlpatterns = [
    # Endpoints para States
    path('states/', StateListCreateView.as_view(), name='state-list-create'),
    path('states/<int:pk>/', StateRetrieveUpdateDestroyView.as_view(), name='state-detail'),

    # Endpoints para Users
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', UserRetrieveUpdateDestroyView.as_view(), name='user-detail'),

    # Endpoints para Tasks
    path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', TaskRetrieveUpdateDestroyView.as_view(), name='task-detail'),
]
