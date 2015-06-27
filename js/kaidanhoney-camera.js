// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
//機能取得(HTML5)

console.log('start getUserMedia.');
navigator.getUserMedia({
    //navigator.getUserMedia ( constraints, successCallback, errorCallback );
    //https://developer.mozilla.org/ja/docs/Web/API/Navigator/getUserMedia
    video: true,
    audio: true
    //successCallback に渡されるLocalMediaStream オブジェクトがサポートするメディアタイプ。
}, function(localStream){
//LocalMediaStream オブジェクトが取得できた場合、呼び出されるコールバック関数。
    console.log('complete getUserMedia.');
    $('html')
        .removeClass('status-media-false')
        //$(“class名を削除したい要素のCSSセレクタ”).removeClass(“削除したいclass名”);
        .addClass('status-media-true');
        //$(“class名を追加したい要素のCSSセレクタ”).addClass(“追加したいclass名”);
    $('#video').attr('src', URL.createObjectURL(localStream));
    //.attr( name, value ) 戻り値:jQuery  指定した属性にvalueの値を設定します。
    //createObjectURL メソッドは、それが作成されたウィンドウ内の document と同じ寿命を持つ、新しいオブジェクトの URL を作成します。
    //新しいオブジェクトの URL は、指定された File オブジェクトを表します。
    //構文 objectURL = window.URL.createObjectURL(file);

    connect();

    function connect() {
        console.log('start connection to server.');

        var peer = new Peer({
            key: LICENSE_KEY,
            debug: 3
        });
        var peerCall;

        peer.on('open', function() {
            console.log('complete connection to server. peer ID is ' + peer.id);
            $('html')
                .removeClass('status-server-false')
                .addClass('status-server-true');

            peerCall();

            function peerCall() {
                console.log('start mediaConnection to display.');
                $('html')
                    .removeClass('status-p2p-connected status-p2p-disconnected')
                    .addClass('status-p2p-connecting');
                var mediaConnection = peer.call(VIEWER_ID, localStream);
                var timeStartCall = Date.now();

                mediaConnection.on('close', function() {
                    console.warn('mediaConnection gets closed.');
                    $('html')
                        .removeClass('status-p2p-connected status-p2p-connecting')
                        .addClass('status-p2p-disconnected');
                    clearInterval(watchMediaConnection);
                    watchMediaConnection = -1;
                    $(window).off('unload');
                    var interval = 5000 + Math.floor(Math.random() * 5000);
                    setTimeout(peerCall, interval);
                });

                mediaConnection.on('error', function(error) {
                    console.warn('mediaConnection error. ' + error);
                    $('html')
                        .removeClass('status-p2p-connecting status-p2p-connecting')
                        .addClass('status-p2p-disconnected');
                    clearInterval(watchMediaConnection);
                    watchMediaConnection = -1;
                    $(window).off('unload');
                    var interval = 5000 + Math.floor(Math.random() * 5000);
                    setTimeout(peerCall, interval);
                });

                $(window).on('unload', function() {
                    if (watchMediaConnection !== -1) {
                        clearInterval(watchMediaConnection);
                    }
                });

                var watchMediaConnection = setInterval(function() {
                    if (!mediaConnection) {
                        console.error('mediaConnection doesn\'t exist');
                        return;
                    }
                    if (mediaConnection.open && !$('html').hasClass('status-p2p-connected')) {
                        console.log('complete mediaConnection to display.');
                        $('html')
                            .removeClass('status-p2p-disconnected status-p2p-connecting')
                            .addClass('status-p2p-connected');
                        timeStartCall = -1;
                        return;
                    }
                    if (!mediaConnection.open && $('html').hasClass('status-p2p-connected')) {
                        console.warn('mediaConnection doesn\'t connected anymore.');
                        $('html')
                            .removeClass('status-p2p-connected status-p2p-connecting')
                            .addClass('status-p2p-disconnected');
                        clearInterval(watchMediaConnection);
                        watchMediaConnection = -1;
                        $(window).off('unload');
                        var interval = 5000 + Math.floor(Math.random() * 5000);
                        setTimeout(peerCall, interval);
                        return;
                    }
                    if (timeStartCall !== -1) {
                        if ((Date.now() - timeStartCall) > 30 * 1000) {
                            console.warn('mediaConnection time out.');
                            $('html')
                                .removeClass('status-p2p-connected status-p2p-connecting')
                                .addClass('status-p2p-disconnected');
                            clearInterval(watchMediaConnection);
                            watchMediaConnection = -1;
                            $(window).off('unload');
                            mediaConnection.close();
                            var interval = 5000 + Math.floor(Math.random() * 5000);
                            setTimeout(peerCall, interval);
                        }
                    }
                }, 100);
            };
        });

        peer.on('error', function(err){
            console.warn('connection to server error. ' + err);
            if (err.message.search(/^Error: Could not connect to peer/)) {
                console.log('wait for peerCall()');
                return;
            }

            $('html')
                .removeClass('status-server-true')
                .addClass('status-server-false');
            if (peer.disconnected) {
                var interval = 5000 + Math.floor(Math.random() * 5000);
                setTimeout(connect, interval);
            }
        });

        peer.on('close', function(){
            console.warn('connection to server closes.');
            $('html')
                .removeClass('status-server-true')
                .addClass('status-server-false');
            if (peer.disconnected) {
                var interval = 5000 + Math.floor(Math.random() * 5000);
                setTimeout(connect, interval);
            }
        });

        $(window).on('beforeunload', function(){
            if (!peer.destroyed) {
                peer.destroy();
            }
        });
    }
}, function(){
    //呼び出しが失敗した際に実行されるコールバック関数。最近の Firefox では必須となっています。省略された場合、 NS_ERROR_XPC_NOT_ENOUGH_ARGS error がスローされます。
    var message = 'Failed to access the webcam and microphone. '
        + 'Make sure to run this demo on an http server '
        + 'and click allow when asked for permission by the browser.';
    alert(message);
});
