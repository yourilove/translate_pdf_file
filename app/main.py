# -*- coding: utf-8 -*-
import sys
import io
import string
import os
import time

from transfer_process import translate_handle


# abs_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
abs_path = os.path.dirname(os.path.abspath(__file__))

if sys.platform in ['win32', 'win64']:
    abs_path = abs_path.replace('\\', '/')
    to_translate_dir = abs_path + '/to_translate/'
    translated_dir = abs_path + '/translated/'
else:
    to_translate_dir = abs_path + '/to_translate/'
    translated_dir = abs_path + '/translated/'

transfer_source = {'baidu': 'baidu', 'google': 'google'}

def main(argv):
    translate_deal = translate_handle(transfer_source['baidu'], to_translate_dir, translated_dir)
    translate_deal.start()
    translate_deal.join()




if __name__ == "__main__":
    argv = sys.argv
    main(argv)

