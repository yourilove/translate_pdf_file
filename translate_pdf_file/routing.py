
from channels.auth import AuthMiddlewareStack
from channels.http import AsgiHandler
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.sessions import SessionMiddlewareStack
import app.routing

# application = ProtocolTypeRouter({
#     # 'http':AsgiHandler,
#     'websocket': AllowedHostsOriginValidator(  
#         AuthMiddlewareStack(
#             URLRouter(
#                 app.routing.websocket_urlpatterns
#             )
#         ) 
#     ),
# })

application = ProtocolTypeRouter({
    # (http->django views is added by default)
    # 【channels】（第6步）添加路由配置指向应用的路由模块
    'websocket': SessionMiddlewareStack(  # 使用Session中间件，可以请求中session的值
        URLRouter(
            app.routing.websocket_urlpatterns
        )
    ),
})