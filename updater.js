//electron-updater module
const { dialog, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");

//configure log debugging
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";

//disable auto downloading of updates
autoUpdater.autoDownload = false;

//single export to check for and apply any available updates
module.exports = () => {
  //check for updates (GH Releases)
  autoUpdater.checkForUpdates();

  //listen for update found
  autoUpdater.on("update-available", () => {
    // prompt user to start download
    dialog.showMessageBox(
      {
        type: "info",
        title: "Update available",
        message:
          "A new version of Master-electron is avaliable. Do you want to update now?",
        buttons: ["Update", "No"],
      },
      (buttonIndex) => {
        //if button  0 (update),start downloading the update
        if (buttonIndex === 0) autoUpdater.downloadUpdate();
      }
    );
  });

  //   dialog.showMessageBox(null, options, (res) => {
  //     if (res === 0) {
  //       //Yes button pressed
  //       autoUpdater.downloadUpdate();
  //     } else if (res === 1) {
  //       //No button pressed
  //     }
  //   });

  //listen for update downloaded
  autoUpdater.on("update-downloaded", () => {
    //prompt user to install the update
    dialog.showMessageBox(
      {
        type: "info",
        title: "Update ready",
        message: "Install and restart now?",
        buttons: ["Yes", "Later"],
      },
      (buttonIndex) => {
        //install and restart if button 0 yes
        if (buttonIndex === 0) autoUpdater.quitAndInstall(false, true);
      }
    );
  });
};
