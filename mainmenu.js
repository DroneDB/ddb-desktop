const { Menu, ipcMain, shell } = require('electron');

function dispatchEvent(window, event){
    window.webContents.executeJavaScript(`dispatchEvent(new Event("${event}"))`);
}

module.exports = {
    setupMainMenu: function(app){
        const template = [
            { 
            label: "&File", 
            submenu: [
                    {
                        id: "btnShare",
                        label: "&Share",
                        enabled: false,
                        click: function(_, window){
                            dispatchEvent(window, 'btnShare_Click');
                        },
                        accelerator: 'CmdOrCtrl+S'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: "&Quit",
                        click: function(){
                            app.exit(0);
                        },
                        accelerator: 'CmdOrCtrl+Q'
                    }
                ] 
            },
            {
                label: "Debug",
                submenu: [
                    {
                        role: 'toggledevtools'
                    },
                    {
                        role: 'reload'
                    },
                    {
                        role: 'forceReload'
                    }
                ]
            },
            {
                label: "&Help",
                submenu: [
                    {
                        id: "btnReportBug",
                        label: "&Report a Bug",
                        visible: true,
                        click: function(_, window){
                            shell.openItem("https://github.com/DroneDB/DroneDB/issues");
                        }
                    },
                    {
                        id: "btnReportFeedback",
                        label: "&Give Feedback",
                        visible: true,
                        click: function(_, window){
                            shell.openItem("https://dronedb.app/contact");
                        }
                    },
                    {
                        label: "&About",
                        click: function(_, window){
                            dispatchEvent(window, 'btnAbout_Click');
                        }
                    }
                ]
            }
        ]

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);

        ipcMain.on('setMenuItem', (event, arg) => {
            const mi = menu.getMenuItemById(arg.id);
            if (mi){
                mi[arg.property] = arg.value;
            }
        });
    }
}