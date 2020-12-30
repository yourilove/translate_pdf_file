function $(id){
    return document.getElementById(id);
}

window.onload = function(){
    var btn_clear_all = document.getElementById('clear-all');
    btn_clear_all.disabled = true;
    var btn_update_all = document.getElementById('upload-all');
    btn_update_all.disabled = true;

    var btn_translate_all = document.getElementById('translate-all');
    btn_translate_all.disabled = true;
    var btn_download_all = document.getElementById('download-all');
    btn_download_all.disabled = true;

    var file_size = document.getElementById("uploadform-pdf-files");
    var right_div1 = document.getElementById("right-div1");
    var flag_tranlate_all = 0, flag_download_all = 0;
    
    var url_upload = 'http://localhost:8000' + '/app/upload/';
    // var url_translate = 'ws://localhost:6379' + '/ws/msg/';
    var url_translate = 'ws://localhost:8001' + '/ws/chat/';
    var url_download = 'http://localhost:8000' + '/app/download/';
    var files_to_upload = [];

    right_div1.style.height = file_size.clientHeight + 'px';
    
    interval = setInterval(function(){
         
        if(files_to_upload.length == 0) return;
        console.log(files_to_upload.length);
        for(var i = 0; i < files_to_upload.length; i ++){
            if($('left_progressBar_' + i).value == '100'){
                $('delete_' + i).disabled = true;
                $('upload_' + i).disabled = true;
                $('translate_' + i).disabled = false;
            }
        }
        for(var i = 0; i < files_to_upload.length; i ++){
            if($('right_progressBar_' + i).value == '100'){
                $('download_' + i).disabled = false;
            }
        }

        
        var temp = 0;
        for(temp = 0; temp < files_to_upload.length; temp ++){
            if($('translate_' + temp).disabled){
                break;
            }
        }
        if(temp == files_to_upload.length){
            $('translate-all').disabled = false;
            btn_update_all.disabled = true;
        }

        var temp = 0;
        for(temp = 0; temp < files_to_upload.length; temp ++){
            if($('download_' + temp).disabled){
                break;
            }
        }
        if(temp == files_to_upload.length){
            $('download-all').disabled = false;
        }


    },100);

    clear_all = function(){
        clear_table();
        files_to_upload = [];
        btn_clear_all.disabled = true;
        btn_update_all.disabled = true;
        btn_translate_all.disabled = true;
        btn_download_all.disabled = true;
        
    }

    clear_table = function(){
        var left_table_tbody = document.getElementById('left-table-tbody');
        if (left_table_tbody !== "undefined") {
            while(left_table_tbody.hasChildNodes()){
                left_table_tbody.removeChild(left_table_tbody.lastChild);
            }
        }

        var right_table_tbody = document.getElementById('right-table-tbody');
        if (right_table_tbody !== "undefined") {
            while(right_table_tbody.hasChildNodes()){
                right_table_tbody.removeChild(right_table_tbody.lastChild);
            }
        }
    }

    refresh_table = function(){
        var left_table = document.getElementById('left-table');
        var right_table = document.getElementById('right-table');
        for(var i = 0; i < files_to_upload.length; i++){
            
            var left_table_tr = left_table.insertRow(i);
            var right_table_tr = right_table.insertRow(i);

            var left_cell_0 = left_table_tr.insertCell(0);
            left_cell_0.innerHTML = files_to_upload[i].name;
            // console.log(files_to_upload[i].name);
            var left_cell_1 = left_table_tr.insertCell(1);
            left_cell_1.innerHTML = "<input type = 'button' value = 'delete' id = 'delete_" + i + "' onclick = delete_line(this) />";
            var left_cell_2 = left_table_tr.insertCell(2);
            left_cell_2.innerHTML = "<input type = 'button' value = 'upload' id = 'upload_" + i + "' onclick = upload_line(this) />";
            var left_cell_3 = left_table_tr.insertCell(3);
            left_cell_3.innerHTML = "<progress id='left_progressBar_" + i + "' value='0' max='100' ></progress>";

            var right_cell_0 = right_table_tr.insertCell(0);
            right_cell_0.innerHTML = files_to_upload[i].name;
            // console.log(file.name);
            var right_cell_1 = right_table_tr.insertCell(1);
            right_cell_1.innerHTML = "<input type = 'button' value = 'tranlate' id = 'translate_" + i + "' onclick = translate_line(this) disabled />";
            var right_cell_2 = right_table_tr.insertCell(2);
            right_cell_2.innerHTML = "<progress id='right_progressBar_" + i + "' value='0' max='100' ></progress>";
            var right_cell_3 = right_table_tr.insertCell(3);
            right_cell_3.innerHTML = "<input type = 'button' value = 'download' id = 'download_" + i + "' onclick = download_line(this)  disabled />";

        }

        left_table.style.fontSize = '10rem';
        right_table.style.fontSize = '10rem';
    }

    delete_line = function(cell){
        
        var i = cell.parentNode.parentNode.rowIndex;
        
        files_to_upload.splice(i, 1);
       
        console.log(files_to_upload);
        clear_table();

        refresh_table();
        
    }

     //上传成功响应
     function uploadComplete(evt) {
        //服务断接收完文件返回的结果
        // var result = evt.target.responseText.split(' ');
        // if(result[1] == 'success') {
        //     alert("上传成功！");
        // }else{
        //     alert("上传失败！");
        // }

    }
    //上传失败
    function uploadFailed(evt) {
        alert("上传失败！");
    }
    //取消上传
    function cancleUploadFile(){
        xhr.abort();
    }

    xhr_upload = function(fileobj, tmp){
        var xhr = new XMLHttpRequest();
        var form = new FormData();
        form.append('file', fileobj);

        
        xhr.open('post', url_upload, true);    //post方式，url为服务器请求地址，true 该参数规定请求是否异步处理
        xhr.onload = uploadComplete;
        xhr.onerror = uploadFailed;

        xhr.upload.onprogress = function(evt){
            progressid = 'left_progressBar_' + tmp;
            console.log(progressid)
            var progressBar = $(progressid);
            if (evt.lengthComputable){
                progressBar.value = evt.loaded / evt.total * 100;
            }
        };
        xhr.upload.onloadstart = function(){
            ot = new Date().getTime();  //设置上传开始时间
            oloaded = 0;    //设置上传开始时，以上传的文件大小为0
        }

        xhr.send(form);
    }

    upload_line = function(cell){
        var left_table = document.getElementById('left-table');

        var i = cell.parentNode.parentNode.rowIndex;
        var file_name = left_table.rows[i].cells[0].innerHTML;
        // console.log(i,file_name);

        var tmp = 0;
        for(tmp = 0; tmp < files_to_upload.length; tmp ++){
            if(files_to_upload[tmp].name == file_name){
                break;
            } 
        }
        var fileobj = files_to_upload[tmp];
        
        xhr_upload(fileobj, tmp);
        
    }

    upload_all = function(){
        for(var i = 0; i < files_to_upload.length; i++){
            if($('left_progressBar_' + i).value == '0'){
                xhr_upload(files_to_upload[i], i);
            }
        }
    }
    
    translate_line = function(cell){
        btn_clear_all.disabled = true;
        btn_translate_all.disabled = true;

        var right_table = document.getElementById('right-table');
        var i = cell.parentNode.parentNode.rowIndex;
        var file_name = right_table.rows[i].cells[0].innerHTML;
        var translate_line_file = url_translate + file_name + '/client/';
        var status_comm = 0;
        progressid = 'right_progressBar_' + i;
        console.log(progressid)
        var progressBar = $(progressid);
        $('translate_' + i).disabled = true;
        let ws = new WebSocket(translate_line_file);

        ws.onopen = function () {
            console.log('WebSocket建立连接');
            message_send = {'step': 0};
            ws.send(JSON.stringify({'message': message_send}));
        };
    
        ws.onmessage = function (e) {
            console.log('WebSocket接收消息：');
            let data = JSON.parse(e.data);
            
            let message_rev = data['message'];
            console.log(data);
            console.log(status_comm);
            switch(status_comm){
                case 0:
                    if(message_rev['step'] == 0){
                        message_send = {'step': 1};
                        status_comm = 1;
                    }
                    
                    break;
                case 1:
                    if(message_rev['step'] == 1){
                        message_send = {'step': 2};
                        status_comm = 2;
                    }
                    break;
                case 2:
                    if(message_rev['step'] == 1){
                        message_send = {'step': 2};
                    }else{
                        message_send = {'step': 3};
                        status_comm = 3;
                    }
                    break;
                case 3:
                    if(message_rev['step'] == 2){
                        message_send = {'step': 3};
                        progressBar.value = message_rev['percent'];
                        
                    }else if(message_rev['step'] == 3){
                        progressBar.value = 100;
                        $('download' + i).disabled = false;
                        message_send = {'step': 4};
                        status_comm = 4;
                    }else if(message_rev['step'] == 4){
                        progressBar.value = 0;
                        message_send = {'step': 4};
                        status_comm = 4;
                    }else if(message_rev['step'] == 5){
                        message_send = {'step': 4};
                        status_comm = 4;
                    }
                    break;
                case 4:
                    ws.close();
                    break;
               
            }
            
            ws.send(JSON.stringify({'message': message_send}));
        };
        ws.onclose = function (e) {
            console.log('WebSocket关闭连接');
        };
    
    }

    download_line = function(cell){
        var right_table = document.getElementById('right-table');

        var i = cell.parentNode.parentNode.rowIndex;
        var file_name = right_table.rows[i].cells[0].innerHTML;

        var download_line_file = url_download + file_name;

        window.open(download_line_file);
    }
    pullfiles = function(){
        flag_tranlate_all = 0; 
        flag_download_all = 0;
        btn_clear_all.disabled = false;
        btn_update_all.disabled = false;
        $('translate-all').disabled = true;
        $('download-all').disabled = true;

        var file_input = document.getElementById("uploadform-pdf-files");
        var tmp_files = file_input.files;
        clear_table();
        for(var i = 0; i < tmp_files.length; i++){
            files_to_upload.push(tmp_files[i]);
        }
        console.log(files_to_upload);
        
        refresh_table();
        
    }
    document.querySelector('#uploadform-pdf-files').onchange = pullfiles;
    btn_clear_all.onclick = clear_all;
    btn_update_all.onclick = upload_all;
    
}