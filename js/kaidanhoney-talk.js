navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var peer = new Peer("talk", {key: 'cb69f547-95c3-4d28-a501-23cac048c169'});

navigator.getUserMedia({audio: true, video: true}, function (stream) {

    peer.on("call", function(call) {
        call.answer(stream);

        call.on("stream", function(listen_stream) {
            $("#video_box").append(
                $("<video>")
                    .attr("autoplay", "autoplay")
                    .attr("id", call.peer)
                    .attr("src", URL.createObjectURL(listen_stream))
            );
        });


        call.on("close", function() {   //退室した時の処理
            $("#"+call.peer).remove();
        });
    });
}, function(error) {});

