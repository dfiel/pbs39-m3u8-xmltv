var http = require("http")
var request = require("request")
const {create} = require("xmlbuilder2");

const LANG_EN = {lang: "en"};
const EPG_FUTURE_DAYS = 5;

const M3U8_PORT = 4343;
const XMLTV_PORT = 3434;

http.createServer(function(req, rsp){
    var options = { uri: "https://forerunnerrtmp.livestreamingcdn.com/output18/output18.stream/playlist.m3u8"}

    request(options, function(err, response, body){
        lines = ['#EXTM3U', '#EXTINF:-1 tvg-id="pbs39" group-title="Education",PBS39', 'https://forerunnerrtmp.livestreamingcdn.com/output18/output18.stream/' + body.split('\n')[3], '']
        rsp.writeHead(200)
        rsp.end(lines.join('\n'))
        console.log(lines)
    })
}).listen(M3U8_PORT)

console.log("M3U8 Proxy Started on port " + M3U8_PORT)

http.createServer(function(req, rsp){
    var mdate = new Date();
    var listings = []

    var xmltv = create({version: '1.0', encoding: 'UTF-8'})
                .ele('tv', {
                    'source-info-url': "https://www.wlvt.org/pbs39-tv-schedules/",
                    'source-info-name': "WLVT PBS39",
                    'generator-info-name': "dfiel/pbs39-m3u8-xmltv",
                    'generator-info-url': "https://github.com/dfiel/pbs39-m3u8-xmltv.git"
                }).dtd({sysID: "xmltv.dtd"})
                    .ele('channel', { id: "pbs39"})
                        .ele('display-name').txt('39 WLVT').up()
                        .ele('display-name').txt('PBS39 WLVT').up()
                        .ele('icon', { src: "https://image.pbs.org/bento3-prod/wlvt2-pbs/2019%20PBS39%20Blue/e5fd2adf69_PBS39-2019-Blue.png"}).up()
                    .up();
    
    for (let i = -1; i < EPG_FUTURE_DAYS; i++) {
        var date = new Date(mdate.getTime() + (i * 86400000));
        var options = { uri: `https://jaws.pbs.org/tvss/station/WLVT/providers-feed/day/${date.getFullYear()}${(date.getMonth()+1).toLocaleString(undefined, {minimumIntegerDigits: 2})}${date.getDate()}/?callback=&provider=Broadcast&kids=&kidsflag=false`};
        console.log(options);

        request(options, function(err, response, body){
            var data = JSON.parse(body.substring(1, body.length-1));
            var broadcast;
            var wlvt;
    
            for (head of data.headends){
                if (head.name === "Broadcast") broadcast = head;
            }
    
            for (feed of broadcast.feeds){
                if (feed.short_name === "WLVTDT") wlvt = feed;
            }

            listings[this.i+1] = wlvt.listings;

            if (listings.length > EPG_FUTURE_DAYS && !listings.includes()) finish()
        }.bind({i:i}))
    }

    function finish() {
        for (let i = -1; i < EPG_FUTURE_DAYS; i++) {
            var list = listings[i+1];
            var date = new Date(mdate.getTime() + (i * 86400000));
            for (listing of list) {
                var stime = new Date(date.getTime());
                stime.setHours(listing.start_time.slice(0,2), listing.start_time.slice(2,4),0,0);
                var etime = new Date(stime.getTime() + listing.minutes*60000);
        
                var title = (listing.title === undefined) ? "Unknown" : listing.title.replace(/[^a-zA-Z ]/g, "");
                var stitle = (listing.episode_title === undefined) ? "Unknown" : listing.episode_title.replace(/[^a-zA-Z ]/g, "");
                var desc = (listing.episode_description === undefined) ? "Unknown" : listing.episode_description.replace(/[^a-zA-Z ]/g, "");
        
                xmltv = xmltv.ele('programme', {
                    start: formatTimeXML(stime),
                    stop: formatTimeXML(etime),
                    channel: "pbs39"
                })
                    .ele('title', LANG_EN).txt(title).up()
                    .ele('sub-title', LANG_EN).txt(stitle).up()
                    .ele('desc', LANG_EN).txt(desc).up()
                .up();
            }
        }
        
        xmltv = xmltv.doc();
    
        rsp.writeHead(200);
        rsp.end(xmltv.end({prettyPrint: true}));
        console.log("Served XMLTV update")
    }
}).listen(XMLTV_PORT);

function formatTimeXML(date) {
    return `${date.getFullYear()}${date.getMonth()+1}${date.getDate()}${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}00 -0500`;
}

console.log("XMLTV Provider Started on port " + XMLTV_PORT);