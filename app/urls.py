from django.urls import path
from app import views


urlpatterns = [
    path('index/', views.index),
    path('upload/', views.upload),
    path('download/<str:file_name>/', views.download, name = 'download'),
    path('translate/<str:file_name>/', views.translate, name = 'translate'),
]