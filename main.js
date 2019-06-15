const {app, BrowserWindow, Menu, ipcMain, dialog, shell, nativeImage} = require('electron');
var fs = require('fs');
var Datastore = require('nedb')
, db = new Datastore({ filename: app.getPath('appData')+'/farm-suraksha/data/new.db'});
db.loadDatabase();
/**/
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
var request = require('request');
var path = require('path');
const express = require("express");
const _ = require("lodash");
const blockchain_1 = require("./blockchain");
const p2p_1 = require("./p2p");
const transactionPool_1 = require("./transactionPool");
const wallet_1 = require("./wallet");
const httpPort = parseInt(process.env.HTTP_PORT) || 3001;
const p2pPort = parseInt(process.env.P2P_PORT) || 6001;
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('ngudbhavisTheCorseDeveloperOFThisPortal!');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    tls: {
        ciphers:'SSLv3'
    },
    auth: {
        user: "ngudbhavtest@outlook.com",
        pass: "NGUdbhav"
    }
});
var login = false;
var loggedId = 0;
var emailId = '';
var person;
p2p_1.initP2PServer(6001);
var io = require('socket.io-client');
var socket = io.connect("http://ec2-13-234-35-142.ap-south-1.compute.amazonaws.com:3001/", {
    reconnection: true
});
socket.on('connect', function () {
    console.log('connected');
    socket.on('clientEvent', function (data) {
        console.log('message from the server:', data);
        if(emailId == data.email){
            login = true;
            loggedId = data._id;
            person = data;
            createLoginWindow(data.type);
        }
    });
    socket.on('getMap', function(data){
        console.log('software');

        socket.emit('returnMap', {data:blockchain_1.getTransactionMap()});
    });
});
    wallet_1.initWallet();
/**/
let image;
var personType = '';
if (process.platform === 'darwin') {
    image = path.join(__dirname, 'images/logo.icns');
}
else{
    image = path.join(__dirname, 'images/logo.ico');
}
let win, win2, addWin, win3;
var menuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Convert to MongoDB',
                click: function(menuItem, BrowserWindow, event){
                    if(win){
                        createWindow2();
                    }
                }
            },
            {
                label: 'Convert to MySQL',
                click: function(menuItem, BrowserWindow, event){
                    if(win2){
                        createWindow();
                    }
                }
            },
            {
                label: 'Close',
                role: 'quit'
            }
        ]
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: function(menuItem, BrowserWindow, event){
                    dialog.showMessageBox(
                        {
                            type: 'info',
                            buttons:['Open Browser?', 'Close'],
                            title: 'Created By NGUdbhav',
                            detail: 'TriCO stands for Tri-Covertor. This app converts excel to mysql/mongodb data. Visit me! www.ngudbhav.me',

                        }
                    , function(response){
                        if(response === 0){
                            shell.openExternal('https://www.ngudbhav.me');
                        }
                    });
                }
            }
        ]
    }
];
var users;
ipcMain.on('getUsers', function(e, item){
    request('http://ec2-13-234-35-142.ap-south-1.compute.amazonaws.com:3001/getUsers', function(error, httpResponse, body){
        if(error) throw error;
        else{
        	users = body;
            win3.webContents.send('sendUsers', body);
        }
    });
});
ipcMain.on('details',function(e, item){
    person.balance = blockchain_1.getAccountBalance();
    console.log(person.balance);
    console.log(person.balance[0]);
    if	(person.balance[0] != undefined && person.balance[0].product == 'NA' ){
    	console.log('YO');
    	person.balance.shift();
    }
    win3.webContents.send('gettingDetails', person);
p2p_1.connectToPeers("http://172.16.0.100:6001");
//p2p_1.connectToPeers("http://172.16.0.236:6001");
p2p_1.connectToPeers("http://172.16.81.92:6001");

});
function createLoginWindow(e){
    win3 = new BrowserWindow({width: 1200, height: 800});
     win3.loadFile('views/transact.html');
    win3.on('closed', function(){
        win3 = null;
    });
    win.close();
}
function createWindow(){
    //Login only on current app and not on every app.
    win = new BrowserWindow({width: 800, height: 800});
    //win.loadFile('views/templates/factory.amp.html');
    //win.loadFile('views/login.html');
    //win.loadFile('views/templates/land-sea.amp.html');
   	//win.loadFile('views/signup.html');
    win.loadFile('views/transact.html');
    win.on('closed', function(){
        win = null;
    });
    //var menuBuild = Menu.buildFromTemplate(menuTemplate);
    //Menu.setApplicationMenu(menuBuild);
}
ipcMain.on('getdata', function(e, item){
	console.log('sending');
	win3.webContents.send('newData', blockchain_1.getBlockchain());
	console.log(blockchain_1.getBlockchain());
});
function createProductionForm(){
    win3 = new BrowserWindow({width: 800, height: 800});
    win3.loadFile('views/production.html');
    win3.on('closed', function(){
        win3 = null;
    });
    win.close();
}
function createRegisterWindow(){
    win2 = new BrowserWindow({width: 800, height: 800});
    win2.loadFile('views/signup.html');
    win2.on('closed', function(){
        win2 = null;
    });
}
ipcMain.on('login', function(e, item){
    console.log(item);
    emailId = item.email;
});
ipcMain.on('registeration', function(e, item){
    item.btcAddress = wallet_1.getPublicFromWallet();
    request.post('http://ec2-13-234-35-142.ap-south-1.compute.amazonaws.com:3001/register', {form: item}, function(error, httpResponse, body){
        if(error) throw error;
        else{
            console.log(body);
            if(body == 'error'){
                dialog.showErrorBox('Some Error occured!', error);
            }
            else{
                dialog.showMessageBox('Verification Email has been sent to your email. Click on the link to login!');
            }
        }
    });
});
ipcMain.on('productionForm', function(e, item){
    createProductionForm();
});
ipcMain.on('transact', function(e, item){
    console.log(item);
    try {
        const resp = blockchain_1.generatenextBlockWithTransaction(item.address, item.product, parseInt(item.amount));
        console.log(resp);
        if(!resp){
        	const options = {
        		type: 'question',
        		buttons: ['Ok'],
        		defaultId: 2,
        		title: 'Question',
        		message: 'Transaction not Possible'
        	};
        	dialog.showMessageBox(null, options);
        }
        else{
        	const options = {
        		type: 'question',
        		buttons: ['Ok'],
        		defaultId: 2,
        		title: 'Question',
        		message: 'Transaction Successful'
        	};
        	dialog.showMessageBox(null, options);
 	       win3.webContents.send('transactionDone', resp.data[1].id);
        }
    }
    catch (e) {
        console.log(e);
        dialog.showErrorBox('Error occured', e.message);
    }
});
ipcMain.on('produce', function(e, item){
    const newBlock = blockchain_1.generateNextBlock(item.product, parseInt(item.amount));
    if(!newBlock){
    	const options = {
    		type: 'question',
    		buttons: ['Ok'],
    		defaultId: 2,
    		title: 'Question',
    		message: 'Production Error'
    	};
        dialog.showMessageBox(null, options);
    }
    else{
        const options = {
        	type: 'question',
        	buttons: ['Ok'],
        	defaultId: 2,
        	title: 'Question',
        	message: 'Production Successful'
        };
        dialog.showMessageBox(null, options);
    }
});
ipcMain.on('blocks', function(e, item){
    win.webContents.send('blocks', blockchain_1.queryTransactionHistory(item.var));
});
ipcMain.on('history', function(e, item){
    var h = blockchain_1.getHistory();
    console.log('returning');
    win3.webContents.send('history', h[wallet_1.getPublicFromWallet()]);
});
ipcMain.on('mineBlock', function(e, item){
    //Factory Production Work!
    console.log(item);
    const product = item.product;
    const amount = item.amount;
    const newBlock = blockchain_1.generateNextBlock(product, parseInt(amount));
        //Update the blockchain on client.
    if (newBlock === null) {
        win3.webContents.send('could not generate block');
    }
    else {
            //Trnsaction SuccessFul
        win3.webContents.send('success', 'The Production is completed. You can now send the product to the distributor.');
        console.log(newBlock);
    }
});
ipcMain.on('balances', function(e, item){
    const balance = blockchain_1.getAccountBalance();
    console.log(balance)
        console.log(balance);
    console.log(balance[0]);
    if	(balance[0] != undefined && balance[0].product == 'NA' ){
    	console.log('YO');
    	balance.shift();
    }

    win3.webContents.send('balances', balance);
});
ipcMain.on('address', function(e, item){
    //Get my address
    const address = wallet_1.getPublicFromWallet();
    console.log(address);
    win3.webContents.send('address',address );
});
ipcMain.on('mineTransaction', function(e, item){
    //Do the transaction
    const address = req.body.address;
    const product = req.body.product;
    const amount = req.body.amount;
    try {
        const resp = blockchain_1.generatenextBlockWithTransaction(address, product, parseInt(amount));
        console.log(resp);
        win3.webContents.send('success', 'The Production is completed. You can now send the product to the distributor.');
    }
    catch (e) {
        console.log(e.message);
    }
});

if(process.platform==='darwin'){
    menuTemplate.unshift({});
}
app.on('ready', createWindow);
app.on('window-all-closed', function(){
    if(process.platform!=='darwin'){
        app.quit();
    }
});
app.on('activate', function(){
    if(win===null){
        createWindow();
    }
});
//p2p_1.connectToPeers("http://172.16.0.100:6001");
//p2p_1.connectToPeers("http://172.16.0.236:6001");
//p2p_1.connectToPeers("http://172.16.81.92:6001");
