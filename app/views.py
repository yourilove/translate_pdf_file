from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
import os, sys
from django.http import HttpResponse, Http404, FileResponse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
upload_file_path = os.path.join(BASE_DIR, 'upload_file')
download_file_path = os.path.join(BASE_DIR, 'download_file')

if sys.platform in ['win32', 'win64']:
    upload_file_path = upload_file_path.replace('\\', '/') + '/'
    download_file_path = download_file_path.replace('\\', '/') + '/'
else:
    upload_file_path = upload_file_path + '/'
    download_file_path = download_file_path + '/'

# Create your views here.
def index(request):
    return render(request, 'index.html')

def upload(request):
    if request.method == 'POST':
        files = request.FILES.get('file')
        # print(upload_file_path)
        file_path = upload_file_path + files.name
        with open(file_path, 'wb+') as save_file:
            for part in files.chunks():
                save_file.write(part)
                save_file.flush()
        return HttpResponse('upload success') 
    return HttpResponse('upload fail')

def download(request, file_name):
    # print(file_name)
    file_path = os.path.join(download_file_path, file_name)
    try:
        response = FileResponse(open(file_path, 'rb'))
        response['content_type'] = "application/octet-stream"
        response['Content-Disposition'] = 'attachment; filename=' + os.path.basename(file_path)
        return response
    except Exception:
        raise Http404

def translate(request, file_name):
    
    
    return HttpResponse('translate success')
