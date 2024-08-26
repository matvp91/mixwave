const {MasterPlaylist, SessionData} = require('../../../types');

const playlist = new MasterPlaylist({
  sessionDataList: createSetssionDataList()
});

function createSetssionDataList() {
  const setssionDataList = [];
  setssionDataList.push(new SessionData({
    id: 'com.example.lyrics',
    uri: 'lyrics.json'
  }));
  setssionDataList.push(new SessionData({
    id: 'com.example.title',
    language: 'en',
    value: 'This is an example'
  }));
  setssionDataList.push(new SessionData({
    id: 'com.example.title',
    language: 'es',
    value: 'Este es un ejemplo'
  }));
  return setssionDataList;
}

module.exports = playlist;
