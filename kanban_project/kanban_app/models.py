from django.db import models

# Create your models here.
from django.db import models

class State(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, null=True, blank=True)

    def __str__(self):
        return self.name


class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    state = models.ForeignKey(State, on_delete=models.CASCADE)

    # Relación muchos-a-muchos con User a través de una tabla intermedia
    assignees = models.ManyToManyField(
        User,
        through='TaskAssignee',
        related_name='tasks'
    )

    def __str__(self):
        return self.title


class TaskAssignee(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('task', 'user')

    def __str__(self):
        return f"{self.user.name} -> {self.task.title}"
