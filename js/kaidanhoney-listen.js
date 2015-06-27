navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var peer = new Peer({key: 'cb69f547-95c3-4d28-a501-23cac048c169'});

navigator.getUserMedia({audio: true, video: true}, function (stream) {
	// 送信
	var call = peer.call("talk", stream);

	// ストリームが来た場合のイベント
	call.on("stream", function(talk_stream) {
		$("#video_box").attr("src", URL.createObjectURL(talk_stream));
	});

}, function(error) {});