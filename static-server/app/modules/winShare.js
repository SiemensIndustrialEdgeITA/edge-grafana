const { spawn } = require("child_process");


// LOW LEVEL SPAWN SHELL COMMANDS WRAPPER
function spawnCommandPromise(commandName, mainCommand, optionsCommand) {
  //
  // wrap with promise the spawn function to send command given by mainCommand + optionsCommand array
  //
  return new Promise((res, rej) => {
    // create out props
    let out = { stdout: null, stderr: null, err: null, rc: null };

    // create command to execute
    const child = spawn(mainCommand, optionsCommand);

    // based on output events get all data
    child.stdout.on("data", (data) => {
      console.log(`[INFO] - ${commandName} stdout: ${data}`);
      out.stdout = data.toString();
    });
    child.stderr.on("data", (data) => {
      console.log(`[INFO] - ${commandName} stderr: ${data}`);
      out.stderr = data.toString();
    });
    // on error event call reject promise
    child.on("error", (error) => {
      console.log(`[ERR_] - ${commandName} error: ${error.message}`);
      out.err = error.message;
      rej(out);
    });
    // on close event call resolve promise
    child.on("close", (code) => {
      console.log(`${commandName} process exited with code ${code}`);
      out.rc = code;
      out.stderr ? rej(out) : res(out);
    });
  });
}

// BASIC MOUNT COMMANDS FUNCTIONS
function getMounts() {
  //
  // get actual mounted folder with CIFS Protocol
  //
  return new Promise((res, rej) => {
    //
    spawnCommandPromise("getMounts", "mount", ["-t", "cifs"]).then(
      (resolveOut) => {
        res(resolveOut);
      },
      (rejectOut) => {
        rej(rejectOut);
      }
    );
  });
}



function unmountFolder(folder) {
  //
  // unmount a local folder from any type of mounting like CIFS.
  //
  return new Promise((res, rej) => {
    //
    spawnCommandPromise("unmountFolder", "umount", [folder]).then(
      (resolveOut) => {
        res(resolveOut);
      },
      (rejectOut) => {
        rej(rejectOut);
      }
    );
  });
}

function mountFolder(sharedFolder, user, pass, localFolder) {
  //
  // mount a Windows shared folder based on shared folder URL,
  // the authentication user and password and a local folder
  //
  return new Promise((res, rej) => {
    //
    spawnCommandPromise("mountFolder", "mount", [
      "-v",
      "-t",
      "cifs",
      sharedFolder,
      "-o",
      `user=${user},pass=${pass},uid=0,gid=0,sec=ntlmv2`,
      localFolder,
    ]).then(
      (resolveOut) => {
        res(resolveOut);
      },
      (rejectOut) => {
        rej(rejectOut);
      }
    );
  });
}

// EXPORTABLE FUNCTIONS
function mountShare(sharedFolderUrl, sharedUser, sharedPass, localMountFolder) {
  //
  // check actual mounts and mount a given folder
  //
  return new Promise((res, rej) => {
    // list all mounted folders
    getMounts()
      .then((resActMount) => {
        if (resActMount.stdout && resActMount.stdout.includes(sharedUser)) {
          // if already mounted unmount the requested local folder
          unmountFolder(localMountFolder);
        }
      })
      .then(() => {
        // try mount requested folder
        mountFolder(
          sharedFolderUrl,
          sharedUser,
          sharedPass,
          localMountFolder
        ).then(
          (resMount) => {
            // if no error, resolve
            //console.log(resMount);
            setTimeout(() => {
              res(resMount);
            }, 1000);
          },
          (rejMount) => {
            // if error, reject
            //console.log(rejMount);
            setTimeout(() => {
              rej(rejMount);
            }, 1000);
          }
        );
      });
  });
}


function unmountShare(localMountFolder) {
  //
  // unmount a shared folder based on local path
  //
  return new Promise((res, rej) => {
    // list all mounted folders
    getMounts()
      .then((resActMount) => {
        if (resActMount.stdout && resActMount.stdout.includes("serverino")) {
          // if already mounted unmount the requested local folder
          unmountFolder(localMountFolder);
        }
      })
      .then((resUnmount) => {
        // if no error, resolve
        //console.log(resUnmount);
        setTimeout(() => {
          res(resUnmount);
        }, 500);
      },
        (rejUnmount) => {
          // if error, reject
          //console.log(rejUnmount);
          setTimeout(() => {
            rej(rejUnmount);
          }, 500);
        });
  });
}

// EXPORT MODULES
module.exports.mountShare = mountShare;
module.exports.unmountShare = unmountShare;

//USAGE
// const localMountFolder = "/mnt/winshare";
// const sharedFolderUrl = "//172.16.1.99/shared_folder";
// //const sharedFolderUrl = "//192.168.1.120/shared_folder";
// const sharedUser = "siemens";
// const sharedPass = "Siemens1!";

// mountShare(sharedFolderUrl, sharedUser, sharedPass, localMountFolder).then(
//   (resMount) => {
//     console.log("[INFO] - Successfully mounted.");
//     console.log(resMount);
//     unmountShare(localMountFolder).then(
//       (resUnmount) => {
//         console.log("[INFO] - Successfully unmounted.");
//         console.log(resUnmount);
//       }
//     );
//   }
// );

//console.log(res ? "success" : "error");
//unmountShare(localMountFolder);
//mount -v -t cifs "//192.168.1.120/shared_folder" -o user=siemens,pass=Siemens1!,uid=0,gid=0,sec=ntlmv2 /mnt/winshare
//mount -v -t cifs "//172.16.1.99/shared_folder" -o user=siemens,pass=Siemens1!,uid=0,gid=0,sec=ntlmv2 /mnt/winshare
