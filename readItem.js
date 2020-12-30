const { BrowserWindow } = require("electron");

//Offscreen browserwindow
let offscreenWindow;

//exported readitem function
module.exports = (url, callback) => {
  //create offscreen window
  offscreenWindow = new BrowserWindow({
    width: 500,
    height: 500,
    show: false,
    webPreferences: {
      offscreen: true,
    },
  });

  //load item url
  offscreenWindow.loadURL(url);

  //wait for content to finish loading

  offscreenWindow.webContents.on("did-finish-load", (e) => {
    //get page title
    let title = offscreenWindow.getTitle();

    //get screenshot thumbnail
    offscreenWindow.webContents.capturePage().then((image) => {
      //get image as a dataurl
      let screenshot = image.toDataURL();

      //excute callback with new item object

      callback({
        title,
        screenshot,
        url,
      });

      //clean up

      offscreenWindow.close();
      offscreenWindow = null;
    });
  });
};
