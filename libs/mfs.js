module.exports = {
    getDriveList: async () => {
        if (process.platform === "win32"){
            const spawn = require("child_process").spawn;

            function listDrives(){
                const list  = spawn('cmd');

                return new Promise((resolve, reject) => {
                    const result = [];
                    list.stdout.on('data', function (data) {
                        const output = String(data);
                        const out = output.split("\n").map(e=>e.trim()).filter(e=>e != "");
                        const allowedDriveTypes = [1, 2, 3, 4, 6]; // https://docs.microsoft.com/en-us/windows/win32/cimwin32prov/win32-logicaldisk

                        for (let i = 0; i < out.length; i++){
                            const matches = out[i].split(/\s+/);
                            if (matches.length == 2 && !isNaN(parseInt(matches[0]))){
                                const [driveType, name] = matches;
                                if (allowedDriveTypes.indexOf(parseInt(driveType)) !== -1){
                                    result.push(name + "/");
                                }
                            }
                        }
                    });

                    list.on('exit', function (code) {
                        if (code !== 0) reject(code);
                        else resolve(result);
                    });

                    list.stdin.write('wmic logicaldisk get name,drivetype\n');
                    list.stdin.end();
                });
            }

            return (await listDrives()).flat().sort();
        }else{
            return ["/"];
        }
    },

    getHomeDirectory: () => {
        const homeDir = require('os').homedir();
        if (process.platform == "win32"){
            return homeDir.replace(/\\/g, '/');
        }else return homeDir;
    },

    createFolder: async (folder) => {
        return new Promise((resolve, reject) => {
            const fs = require('fs');
            fs.mkdir(folder, err => {
                if (!err) resolve();
                else reject(err);
            });
        });
    },

    remove: async (path) => {
        if (path === '/' || !path) throw new Error(`Cannot remove ${path}`);

        return new Promise((resolve, reject) => {
            const fs = require('fs');
            fs.lstat(path, (err, stats) => {
                if (err) reject(err);
                else{
                    if (stats.isDirectory()){
                        fs.rmdir(path, { recursive: true }, err => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }else{
                        fs.unlink(path, err => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                }
            });
        });
    },

    rename: async function(oldPath, newPath){

        return new Promise((resolve, reject) => {
            const fs = require('fs');
            fs.rename(oldPath, newPath, err => {
                if (err) reject(err);
                else resolve();
            })
        });
    }
}