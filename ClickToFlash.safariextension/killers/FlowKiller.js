function FlowKiller() {}

FlowKiller.prototype.canKill = function(data) {
    return (/flowplayer[^\/]*\.swf/i.test(data.src) && /(?:^|&)config=/.test(data.params));//
};

FlowKiller.prototype.process = function(data, callback) {
    var config = JSON.parse(decodeURIComponent(parseFlashVariables(data.params).config));
    var baseURL;
    if(config.clip) baseURL = config.clip.baseUrl;
    
    var mediaURL, mediaInfo;
    var playlist = new Array();
    var isAudio = true;
    if(config.playList) config.playlist = config.playList;
    if(typeof config.playlist === "object") {
        for(var i = 0; i < config.playlist.length; i++) {
            if(config.playlist[i].provider === "rtmp") continue;
            mediaURL = config.playlist[i].url;
            mediaInfo = getMediaInfo(mediaURL);
            if(mediaInfo) {
                if(config.playlist[i].baseUrl) baseURL = config.playlist[i].baseUrl;
                if(baseURL) {
                    if(!/\/$/.test(baseURL)) baseURL += "/";
                    mediaURL = baseURL + mediaURL;
                }
                playlist.push({"title": config.playlist[i].title, "posterURL": config.playlist[i].overlay, "sources": [{"url": mediaURL, "mediaType": mediaInfo.type, "isNative": mediaInfo.isNative}]}); // resolution:
                if(mediaInfo.type === "video") isAudio = false;
            }
        }
    } else if(config.clip) {
        if(config.clip.provider === "rtmp") return;
        mediaURL = config.clip.url;
        if(!mediaURL) return;
        mediaInfo = getMediaInfo(mediaURL);
        if(mediaInfo) {
            if(baseURL) {
                if(!/\/$/.test(baseURL)) baseURL += "/";
                mediaURL = baseURL + mediaURL;
            }
            playlist.push({"title": config.playlist[i].title, "posterURL": config.clip.overlay, "sources": [{"url": mediaURL, "mediaType": mediaInfo.type, "isNative": mediaInfo.isNative}]});
            if(mediaInfo.type === "video") isAudio = false;
        }
    } else return;
    
    var mediaData = {
        "playlist": playlist,
        "isAudio": isAudio
    };
    callback(mediaData);
};