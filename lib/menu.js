/**
 * Created by stig on 2017/3/31.
 */


/**
 * topMenu
 */

const electron = require('electron')
// Module to control application life.
const app = electron.app
const Menu = electron.Menu;
const webContents = require('electron').webContents;

let template = [{
    label: '编辑',
    submenu: [{
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
    },{

       label: 'Redo',

       accelerator: 'Shift+CmdOrCtrl+Z',

       selector: 'redo:'

     }, {

       type: 'separator'

     }, {

       label: 'Cut',

       accelerator: 'CmdOrCtrl+X',

       selector: 'cut:'

     }, {

       label: 'Copy',

       accelerator: 'CmdOrCtrl+C',

       selector: 'copy:'

     }, {

       label: 'Paste',

       accelerator: 'CmdOrCtrl+V',

       selector: 'paste:'

     },{
        label: '全选',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }]
}, {
    label: '视图',
    submenu: [{
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function (item, focusedWindow) {
            if (focusedWindow) {
                // on reload, start fresh and close any old
                // open secondary windows
                if (focusedWindow.id === 1) {
                    BrowserWindow.getAllWindows().forEach(function (win) {
                        if (win.id > 1) {
                            win.close()
                        }
                    })
                }
                focusedWindow.reload()
            }
        }
    }, {
        label: 'Toggle Full Screen',
        accelerator: (function () {
            if (process.platform === 'darwin') {
                return 'Ctrl+Command+F'
            } else {
                return 'F11'
            }
        })(),
        click: function (item, focusedWindow) {
            editHtml();
        }
    }]
}, {
        label: '测试',
        submenu: [{
            label: 'Toggle Developer Tools',
            accelerator: (function () {
                if (process.platform === 'darwin') {
                    return 'Alt+Command+I'
                } else {
                    return 'Ctrl+Shift+I'
                }
            })(),
            click: function (item, focusedWindow) {
                if (focusedWindow) {
                    focusedWindow.toggleDevTools()
                }
            }
        }]
    }, {
    label: '帮助',
    submenu: [{
        label: '控制台',
        click: function () {
            var current = webContents.getFocusedWebContents();
            // let code = "alert('配置IP成功')";
            let code = "$('.control').show()";
            current.executeJavaScript(code);
        }
    }]},
    {
    label: 'Help',
    role: 'help',
    submenu: [{
        label: 'Learn More',
        click: function () {
            electron.shell.openExternal('http://electron.atom.io')
        }
    }]
}]

function  editHtml() {
    var i = document.getElementById('testId');
    i.innerHTML('testCLick');
}

if (process.platform === 'darwin') {
    template.unshift({
        label: app.getName(),
        submenu: [
            {
                role: 'about'
            },
            {
                type: 'separator'
            },
            {
                role: 'services',
                submenu: []
            },
            {
                type: 'separator'
            },
            {
                role: 'hide'
            },
            {
                role: 'hideothers'
            },
            {
                role: 'unhide'
            },
            {
                type: 'separator'
            },
            {
                role: 'quit'
            }
        ]
    })
    // Edit menu.
    template[1].submenu.push(
        {
            type: 'separator'
        },
        {
            label: 'Speech',
            submenu: [
                {
                    role: 'startspeaking'
                },
                {
                    role: 'stopspeaking'
                }
            ]
        }
    )
}
const initMenu = function(){
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu)
}

module.exports = initMenu;
