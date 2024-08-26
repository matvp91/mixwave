const test = require('ava');
const utils = require('../../../../helpers/utils');

// Master Playlist Tags MUST NOT appear in a Media Playlist
test('Master-Playlist-Tags', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
  `);
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXTINF:10,
    http://example.com/1
    #EXTINF:10,
    http://example.com/2
    #EXT-X-SESSION-DATA:DATA-ID="com.example.title",LANGUAGE="en",VALUE="This is an example"
  `);
});
