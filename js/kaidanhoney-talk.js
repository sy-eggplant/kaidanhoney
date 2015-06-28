navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var peer = new Peer("talk", {key: 'cb69f547-95c3-4d28-a501-23cac048c169'});

var kowaiCount = 0;

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


        call.on("close", function() {
            $("#"+call.peer).remove();
        });
    });

    peer.on("connection", function(conn) {
        // 繋がったらここが呼ばれる
        
        conn.on("data", function(data) {
            // データがきたらこの中が動作する
            console.log(data);
            kowaiCount++;
            conn.send(kowaiCount);
            document.getElementById("kawanum").innerHTML=kowaiCount;
        })
    });



}, function(error) {});

function playSE(bgmId){
    document.getElementById(bgmId).play();
}
function playBGM(bgmId){
    document.getElementById(bgmId).play();
}

