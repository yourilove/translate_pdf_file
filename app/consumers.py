
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import json, os, sys, time

from app.transfer_thread import translate_files
transfer_source = {'baidu': 'baidu', 'google': 'google'}

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
upload_file_path = os.path.join(BASE_DIR, 'upload_file')
download_file_path = os.path.join(BASE_DIR, 'download_file')

if sys.platform in ['win32', 'win64']:
    upload_file_path = upload_file_path.replace('\\', '/') + '/'
    download_file_path = download_file_path.replace('\\', '/') + '/'
else:
    upload_file_path = upload_file_path + '/'
    download_file_path = download_file_path + '/'




class AsyncConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):  # 连接时触发
        print('connect')
        self.chat_room = self.scope['url_route']['kwargs']['chat_room']
        self.user_name = self.scope['url_route']['kwargs']['chat_user']  
        self.translate_file = ''
        # 将新的连接加入到群组
        await self.channel_layer.group_add(self.chat_room, self.channel_name)

        await self.accept()
         

    async def disconnect(self,close_code):  # 断开时触发
        print('disconnect')
        # 将关闭的连接从群组中移除
        await self.channel_layer.group_discard(self.chat_room, self.channel_name)


    # Receive message from WebSocket
   
    async def receive(self, text_data=None, bytes_data=None):  # 接收消息时触发
        
        text_data_json = json.loads(text_data)
        message_rev = text_data_json['message']
        # print(message_rev['step'])
        if message_rev['step'] == 0:    #创建翻译对象
            self.translate_file = translate_files(transfer_source['baidu'], 'pdf', os.path.join(upload_file_path + self.chat_room), os.path.join(download_file_path + self.chat_room))
            
            message_send = {'step': self.translate_file.status}
        elif message_rev['step'] == 1:  #开始准备翻译
            self.translate_file.start()
            # print(self.translate_file.translate_source)
            message_send = {'step': 1}
        elif  message_rev['step'] == 2: #判断有没有进入翻译流程
            message_send = {'step': self.translate_file.status}
        elif message_rev['step'] == 3:  #获取翻译情况
            if self.translate_file.status == 2:
                time.sleep(0.5)
                translated_pages_count, all_page_nums = self.translate_file.get_translated_status()
                # print('all_page_nums',all_page_nums)
                if all_page_nums:
                    tmp = int(translated_pages_count / all_page_nums * 100)
                    message_send = {'step': self.translate_file.status, 'percent': tmp}
                else:
                    message_send = {'step': self.translate_file.status, 'percent': 0}
            else:
                message_send = {'step': self.translate_file.status}
        elif message_rev['step'] == 4:  #清除翻译对象
            self.translate_file.translate_close()
            message_send = {'step': 4}
            self.disconnect(0)
        await self.channel_layer.group_send(
            self.chat_room,
            {
                'type': 'system_message',
                'message': message_send
            }
        )

    # Receive message from room group
    async def system_message(self, event):
        # print(event)
        message = event['message']

        # Send message to WebSocket单发消息
        await self.send(text_data=json.dumps({
            'message': message
        }))


# 同步方式，仅作示例，不使用
class SyncConsumer(WebsocketConsumer):
    def connect(self):
        # 从打开到使用者的WebSocket连接的chat/routing.py中的URL路由中获取'room_name'参数。
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        print('WebSocket建立连接：', self.room_name)
        # 直接从用户指定的房间名称构造通道组名称
        self.room_group_name = 'msg_%s' % self.room_name

        # 加入房间
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )  # async_to_sync(…)包装器是必需的，因为ChatConsumer是同步WebsocketConsumer，但它调用的是异步通道层方法。(所有通道层方法都是异步的。)

        # 接受WebSocket连接。
        self.accept()
        simple_username = self.scope["session"]["session_simple_nick_name"]  # 获取session中的值

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': '@{} 已加入房间'.format(simple_username)
            }
        )

    def disconnect(self, close_code):
        print('WebSocket关闭连接')
        # 离开房间
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # 从WebSocket中接收消息
    def receive(self, text_data=None, bytes_data=None):
        print('WebSocket接收消息：', text_data)
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # 发送消息到房间
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # 从房间中接收消息
    def chat_message(self, event):
        message = event['message']

        # 发送消息到WebSocket
        self.send(text_data=json.dumps({
            'message': message
        }))


def send_group_msg(room_name, message):
    # 从Channels的外部发送消息给Channel
    """
    from assets import consumers
    consumers.send_group_msg('ITNest', {'content': '这台机器硬盘故障了', 'level': 1})
    consumers.send_group_msg('ITNest', {'content': '正在安装系统', 'level': 2})
    :param room_name:
    :param message:
    :return:
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'notice_{}'.format(room_name),  # 构造Channels组名称
        {
            "type": "system_message",
            "message": message,
        }
    )

