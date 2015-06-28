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
            document.getElementById("kowanum").innerText=kowaiCount+'回怖がられました';
        })
    });



}, function(error) {});

function playSE(bgmId){
    document.getElementById(bgmId).play();
}
function playBGM(bgmId){
    document.getElementById(bgmId).play();
}

function bikkuri(){
    // tunagi

    peer.listAllPeers(function(list){


    var conn = peer.connect(list[0]);
    conn.on("open", function() {
        // 繋がった後，この中が動作する
        console.log(list[0]);
        conn.send("send bikkuri.");
    });

    conn.on("data", function(data) {
 
    });
      });
}
