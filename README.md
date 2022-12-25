# pbs39-m3u8-xmltv
An M3U8 proxy and XMLTV provider for PBS39 WLVT, written in Node.JS.

PBS39 WLVT provides a free live stream on their website, as well as electronic programming guide (EPG) data. However, this information is not in a ready to use format for Live TV streaming software (e.g. xTeVe, Jellyfin). This software runs as a light middleware to parse the data available on the PBS39 website and provide it in a standard M3U8 and XMLTV format.

The easiest way to run this is to use pkg to build a standard binary and run it as a systemd service. The server.js file inlcudes both the M3U8 proxy and the XMLTV provider, and is the recommended file to "compile".

This software is tested to work with xTeVe as of 12/24/2022. I give no guarantees to the performance of this software, use at your own risk.
