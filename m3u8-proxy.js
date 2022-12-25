var http = require("http")
var request = require("request")

http.createServer(function(req, rsp){
    var options = { uri: "https://forerunnerrtmp.livestreamingcdn.com/output18/output18.stream/playlist.m3u8"}

    request(options, function(err, response, body){
        lines = ['#EXTM3U', '#EXTINF:-1 tvg-id="pbs39" group-title="Education",PBS39', 'https://forerunnerrtmp.livestreamingcdn.com/output18/output18.stream/' + body.split('\n')[3], '']
        rsp.writeHead(200)
        rsp.end(lines.join('\n'))
        console.log(lines)
    })
}).listen(4343)

console.log("Proxy Started")