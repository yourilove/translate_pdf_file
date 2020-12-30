# translate_pdf_file
to translate pdf files from other languages to chinese.

# envirenment bulid
1.  python 3.7.8
2.  pip install Django=2.2.1
3.  pip install -U channels
4.  pip install channels_redis
      download redis(version==5.0.10) server in URL:https://github.com/tporadowski/redis/releases
5.  pip install daphne

# run project
1.  python manage.py runserver
2.  daphne -b 0.0.0.0 -p 8001 translate_pdf_file.asgi:application
3.  run redis serever
