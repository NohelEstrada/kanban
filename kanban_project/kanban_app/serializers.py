from rest_framework import serializers
from .models import State, User, Task, TaskAssignee

class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email']

class TaskSerializer(serializers.ModelSerializer):
    state = StateSerializer(read_only=True)
    state_id = serializers.PrimaryKeyRelatedField(
        queryset=State.objects.all(), source='state', write_only=True
    )
    assignees = UserSerializer(many=True, read_only=True)
    assignee_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, write_only=True, source='assignees'
    )

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'state', 'state_id', 'assignees', 'assignee_ids']

    def create(self, validated_data):
        assignees = validated_data.pop('assignees', [])
        task = Task.objects.create(**validated_data)
        task.assignees.set(assignees)
        return task

    def update(self, instance, validated_data):
        assignees = validated_data.pop('assignees', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if assignees is not None:
            instance.assignees.set(assignees)
        return instance
