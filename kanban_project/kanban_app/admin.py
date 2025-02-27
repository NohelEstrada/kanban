from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import State, User, Task, TaskAssignee

admin.site.register(State)
admin.site.register(User)
admin.site.register(Task)
admin.site.register(TaskAssignee)
