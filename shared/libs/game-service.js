import axios from 'axios';

let gameList = [];


let getGames = async () => {
  if (gameList.length === 0) {
    gameList = (await axios.get(`${process.env.VUE_APP_APIURI}game`)).data.data;
  }
  return gameList;
}

let checkIfPathExists = (path) => {
    return new Promise((resolve, reject) => {
      overwolf.io.fileExists(path, (checked) => {
        resolve(checked.found);
      });
  });
};

let isGameInstalled = (game, os) => {
    return new Promise(async (resolve, reject) => {
      if (typeof overwolf !== "undefined") {
        let exist = await checkIfPathExists(game.installPath[os]);
        game.isInstalled = exist;
        if (game.isInstalled) {
          localStorage.setItem(game.name + '_install_path', game.installPath[os]);
        } else {
          if (localStorage.getItem(game.name + "_install_path")) {
            exist = await checkIfPathExists(localStorage.getItem(game.name + "_install_path"));
            game.isInstalled = exist;
            if (game.isInstalled) {
              localStorage.setItem(game.name + '_install_path', localStorage.getItem(game.name + "_install_path"));
            }
          }
        }
      } else {
        game.isInstalled = false;
      }
      resolve(game.isInstalled);
    });
};


export default {
  isGameInstalled,
  getGames,
};
