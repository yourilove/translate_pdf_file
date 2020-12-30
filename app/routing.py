from django.urls import re_path
from django.conf.urls import url
from app import consumers


websocket_urlpatterns = [
    # url(r'^ws/msg/(?P<room_name>[^/]+)/$', consumers.SyncConsumer),
    # url(r'^ws/msg/(?P<room_name>[^/]+)/', consumers.AsyncConsumer),
    url(r'^ws/chat/(?P<chat_room>[^/]+)/(?P<chat_user>[^/]+)/$', consumers.AsyncConsumer),
    # re_path(r'ws/chat/(?P<chat_room>\w+)/(?P<chat_user>\w+)/$', consumers.AsyncConsumer),
]