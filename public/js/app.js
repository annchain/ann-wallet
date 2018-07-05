/**
 *Edit by stig.
 *2017/4/12
 */
var path = require('path');
var sqlite3Obj = require('../../sqlite3/db.js');
var ethAccounts = require('./lib/ethereumjs-accounts.js');
var bip39 = require('bip39');
const webContents = require('electron').webContents;
const shell = require('electron').shell;
//const BrowserWindow = require('electron').remote.BrowserWindow;
//const newWindowBtn = document.getElementById('new-window');
const C =  require('./common.js');
var validator = require('validator');

global.CryptoJS = require('browserify-cryptojs');
require('browserify-cryptojs/components/enc-base64');
require('browserify-cryptojs/components/md5');
require('browserify-cryptojs/components/evpkdf');
require('browserify-cryptojs/components/cipher-core');
require('browserify-cryptojs/components/aes');

var tokenABI = '[{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"total","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}]';
var multisigWalletABI = '[{"constant":false,"inputs":[{"name":"_owner","type":"address"}],"name":"removeOwner","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_addr","type":"address"}],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"m_numOwners","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"m_lastDay","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[],"name":"resetSpentToday","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"m_spentToday","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"}],"name":"addOwner","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"m_required","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_h","type":"bytes32"}],"name":"confirm","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_newLimit","type":"uint256"}],"name":"setDailyLimit","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"execute","outputs":[{"name":"_r","type":"bytes32"}],"type":"function"},{"constant":false,"inputs":[{"name":"_operation","type":"bytes32"}],"name":"revoke","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_newRequired","type":"uint256"}],"name":"changeRequirement","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"_operation","type":"bytes32"},{"name":"_owner","type":"address"}],"name":"hasConfirmed","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"ownerIndex","type":"uint256"}],"name":"getOwner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"}],"name":"kill","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"}],"name":"changeOwner","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"m_dailyLimit","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"inputs":[{"name":"_owners","type":"address[]"},{"name":"_required","type":"uint256"},{"name":"_daylimit","type":"uint256"}],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"operation","type":"bytes32"}],"name":"Confirmation","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"operation","type":"bytes32"}],"name":"Revoke","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"oldOwner","type":"address"},{"indexed":false,"name":"newOwner","type":"address"}],"name":"OwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newOwner","type":"address"}],"name":"OwnerAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"oldOwner","type":"address"}],"name":"OwnerRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newRequirement","type":"uint256"}],"name":"RequirementChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_from","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"to","type":"address"},{"indexed":false,"name":"data","type":"bytes"},{"indexed":false,"name":"created","type":"address"}],"name":"SingleTransact","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"operation","type":"bytes32"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"to","type":"address"},{"indexed":false,"name":"data","type":"bytes"},{"indexed":false,"name":"created","type":"address"}],"name":"MultiTransact","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"operation","type":"bytes32"},{"indexed":false,"name":"initiator","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"to","type":"address"},{"indexed":false,"name":"data","type":"bytes"}],"name":"ConfirmationNeeded","type":"event"}]';

var app = angular.module('myApp', []);
app.controller('myCtrl',function($scope,$http,$timeout){
    $scope.test = "test angularjs";
    $scope.hidePop = function (e) {
        jQuery('.popup').hide();
        jQuery('.mainContent').show();
    }

    $scope.refresh = function(){
        $timeout(function(){
            var data = 1;
            $scope.data = data;
        },0);
    }
    $scope.showContractArea = true;
    $scope.blockInfoArea = true;
    $scope.infoArea = true;
    $scope.validatorsSwitch = 1;
    $scope.contractQuery = 1;
    $scope.contractExec = 1;

    $scope.accountList = new Array();
    $scope.EthaccountList = new Array();

    /**  初始化页面数据  ------------start------------- **/
    $scope.initPage = function(){

        $scope.accountList = new Array();
        $scope.EthaccountList = new Array();
        $scope.contractList = new Array();
        sqlite3Obj.query("SELECT * From usr").then(function(data){
            console.log(data);
            // if(data.result == 'success'){
                $scope.accountList = data.data;
                console.log($scope.accountList);
                $scope.refresh();
            // }
        });
        sqlite3Obj.query("SELECT * From contract").then(function(data){
            $scope.contractList = data.data;
            console.log($scope.contractList);
            $scope.refresh();
        });
        sqlite3Obj.query("SELECT * From user").then(function(data){
            console.log(data);
            // if(data.result == 'success'){
                $scope.EthaccountList = data.data;
                console.log($scope.EthaccountList);
                $scope.refresh();
            // }
        });
        //此处写查询数据库合约的代码，并对 $scope.contractList赋值

    }

    $scope.initPage();
     /**  初始化页面数据 ------------end------------- **/
    //$scope.ipList = ["http://10.253.105.196:46657/", "http://10.253.169.129:30001/","http://101.132.104.7:46657/"];
    $scope.ipList = [{"name":"testnet01","server":"http://10.253.105.196:46657/"},{"name":"testnet02","server":"http://10.253.169.129:30001/"},{"name":"mainnet","server":"http://101.132.104.7:46657/"}];
    /**  新账户   ------------start------------- **/
    $scope.newAccountArea = false; //控制新账户详情的显示
    $scope.showAccountArea =true;
    $scope.showEthAccountArea =true;  

    $scope.setIp = function(){
        C.setIp($scope.newIp.server);
        alert("网络配置成功");
        jQuery('.popup').hide();
        jQuery('.mainContent').show();
    }

    $scope.createAccount = function(){
        if($scope.accountPwd == ""){
            alert('请输入密码');
        }else if($scope.accountPwd.length < 6){
            alert('密码长度不足6位');
        }else{
            var Accounts = new ethAccounts();
            var newAccount = Accounts.new($scope.ethAccountPwd);
            var getAccount = Accounts.get(newAccount.address,$scope.ethAccountPwd);
            console.log(newAccount);
            console.log(getAccount);

            var usrinfoArray = new Array();

            C.genKeypair($scope.accountPwd).then(function(kp_ed){
                //console.log(kp_ed);
                var privKey_ed_encrypt = CryptoJS.AES.encrypt(kp_ed.privkey,$scope.accountPwd).toString();
                global.kp_ed = kp_ed;
                global.privKey_ed_encrypt = privKey_ed_encrypt;
                return sqlite3Obj.createTable("CREATE TABLE  IF NOT EXISTS usr (pubKey char(64),privKey char(216),ethAddress char(42),ethPrivate char(128))")
            }).then(function(data){
                if(data.result == "success")
                    var privKey_secp_encrypt = CryptoJS.AES.encrypt(getAccount.private,$scope.accountPwd).toString();
                    global.privKey_secp_encrypt = privKey_secp_encrypt;
                    return sqlite3Obj.execute("INSERT INTO usr VALUES (?,?,?,?)",[kp_ed.pubkey,privKey_ed_encrypt,newAccount.address,privKey_secp_encrypt]);
            }).then(function(data){
                if(data.result == "success")
                    return sqlite3Obj.execute("INSERT INTO user VALUES (?,?)",[newAccount.address,privKey_secp_encrypt])
            }).then(function(data){
                if(data.result == "success")
                    console.log("in success");
                    var accountObj = {};
                    accountObj.pubKey = kp_ed.pubkey;
                    //console.log(account.pubKey);
                    accountObj.chop_private = privKey_ed_encrypt;
                    accountObj.choe_private = privKey_secp_encrypt;
                    accountObj.relatedAddress = newAccount.address;
                    accountObj.encrypt = true;
                    accountObj.recoverPhrase = bip39.entropyToMnemonic(getAccount.private);
                        
                    $scope.newAccountObj = accountObj;
                    console.log(accountObj);

                    $scope.accountList.push(accountObj);
                    $scope.EthaccountList.push(newAccount);                    
                    $scope.newAccountArea = true;
                    jQuery('#newAccountArea').show();
                    jQuery('#newEthAccountArea').hide();
                    console.log($scope.accountList);
                    $scope.refresh();
            })
        }
    }

    $scope.createEthAccount = function(){
        if($scope.ethAccountPwd == ""){
            alert('请输入密码');
        }else if($scope.ethAccountPwd.length < 6){
            alert('密码长度不足6位');
        }else{
            var Accounts = new ethAccounts();
            var newAccount = Accounts.new($scope.ethAccountPwd);
            var getAccount = Accounts.get(newAccount.address,$scope.ethAccountPwd);
            console.log(newAccount);
            console.log(getAccount);

            var userinfoArray = new Array();

            /*---新建数据库。密码、加密私钥、地址存入数据库---*/
            sqlite3Obj.createTable("CREATE TABLE  IF NOT EXISTS user (address char(42),private char(128))").then(function (data) {
                if(data.result == "success")
                    return sqlite3Obj.execute("INSERT INTO user VALUES (?,?)",[newAccount.address,newAccount.private]);
            }).then(function (data){
                console.log(data);
                if(data.result == "success"){
                    console.log("in success");
                    $scope.newAccountObj = newAccount;
                    $scope.newAccountObj.recoverPhrase = bip39.entropyToMnemonic(getAccount.private);
                    $scope.EthaccountList.push(newAccount);
                    $scope.newEthAccountArea = true;
                    jQuery('#newEthAccountArea').show();
                    jQuery('#newAccountArea').hide();
                    console.log($scope.EthaccountList);
                    $scope.refresh();
                }
                    
            }).then().catch(function (err) {
                console.log("err=", err);
            });
        }
    }

    /**  新账户 ------------end------------- **/

    /**  备份账户 ------------start------------- **/

    $scope.backUp = function(type){
        if(type==1){
            try {
                decryptPri = CryptoJS.AES.decrypt($scope.myEthAccountInfo.private,$scope.backUp.password).toString(CryptoJS.enc.Utf8);
                if(decryptPri==""){
                    alert("输入的密码错误，请重新输入。");
                    $scope.backUp.password = "";
                }else{
                    var printData = {};
                    var type = "secp";
                    printData.address = $scope.myEthAccountInfo.address;
                    printData.secp_privKey = decryptPri;
                    printData.recoverPhrase = bip39.entropyToMnemonic(decryptPri);
                    C.layoutPDF(type,printData);
                }
            }catch(err){
                return err;
            }
        }else if(type==2){
            console.log("in type 2");
            $scope.myEthAccountAddr = $scope.myAccountInfo.ethAddress;
            $scope.getEthAccountInfo();
            decrypt_ed_Pri = CryptoJS.AES.decrypt($scope.myAccountInfo.privKey,$scope.backUp.password).toString(CryptoJS.enc.Utf8);
            decrypt_secp_Pri = CryptoJS.AES.decrypt($scope.myAccountInfo.ethPrivate,$scope.backUp.password).toString(CryptoJS.enc.Utf8);
            console.log(decrypt_ed_Pri);
            console.log(decrypt_secp_Pri);
            if(decrypt_ed_Pri==""||decrypt_secp_Pri==""){
                alert("输入的密码错误，请重新输入。");
                $scope.backUp.password = "";
            }else{
                var printData = {};
                var type = "pair";
                printData.address = $scope.myAccountInfo.ethAddress;
                printData.secp_privKey = decrypt_secp_Pri;
                printData.recoverPhrase = bip39.entropyToMnemonic(decrypt_secp_Pri);
                printData.pubKey = $scope.myAccountInfo.pubKey;
                printData.ed_privKey = decrypt_ed_Pri;
                C.layoutPDF(type,printData);
            }
        }
       
    }

    /**  备份账户 ------------end------------- **/

    /**  恢复账户   ------------start------------- **/
    $scope.recoverAccountArea = false;

    $scope.recoverAccount_CHOE_RP = function(){
        $scope.refresh();
        if($scope.recoverPhrase == "" && $scope.accountPasswd == ""){
            alert('请输入账户助记词或密码');
        }else{
            var Accounts = new ethAccounts();
            var recoverPhrase = $scope.recoverPhrase;
            var recoverAccountPrivate = bip39.mnemonicToEntropy(recoverPhrase);
            var recoverAccountAddress = Accounts.re(recoverAccountPrivate);
            var Pwd = $scope.accountPasswd;
            var usrEncryptPrivate = CryptoJS.AES.encrypt(recoverAccountPrivate,Pwd);
            var recoverAccount = new Array();
            recoverAccount.address = recoverAccountAddress;
            recoverAccount.private = usrEncryptPrivate;
            //var usrinfoArray = new Array();

            /*---将恢复的账户存入数据库---*/
            sqlite3Obj.createTable("CREATE TABLE  IF NOT EXISTS user (address char(42),private char(128))").then(function (data){
                if(data.result == "success"){
                    var module = '!'+usrEncryptPrivate;
                    console.log(module);
                    var private = module.replace("!","");
                    console.log(private);
                    return sqlite3Obj.execute("INSERT INTO user VALUES (?,?)",[recoverAccount.address,recoverAccount.private]);
                }
            }).then(function (data){
                if(data.result == "success"){
                    console.log("in success");
                    $scope.recoverAccountObj = recoverAccount;
                    $scope.EthaccountList.push(recoverAccount);
                    $scope.recoverAccountArea = true;
                    //jQuery('#recoverAccountArea').show();
                    console.log($scope.EthaccountList);
                    $scope.refresh();
                }
            }).then().catch(function (err){
                console.log('err = '+err);
            });
        }
    }

    $scope.recoverAccount_CHOE_PK = function(){
        $scope.refresh();
        if($scope.eth_privateKey == "" && $scope.accountPasswd == ""){
            alert('请输入账户私钥或密码');
        }else{
            var Accounts = new ethAccounts();
            var recoverAccountPrivate = $scope.eth_privateKey;
            var recoverAccountAddress = Accounts.re(recoverAccountPrivate);
            var Pwd = $scope.accountPasswd;
            var usrEncryptPrivate = CryptoJS.AES.encrypt(recoverAccountPrivate,Pwd);
            var recoverAccount = new Array();
            recoverAccount.address = recoverAccountAddress;
            recoverAccount.private = usrEncryptPrivate;
            //var usrinfoArray = new Array();

            /*---将恢复的账户存入数据库---*/
            sqlite3Obj.createTable("CREATE TABLE  IF NOT EXISTS user (address char(42),private char(128))").then(function (data){
                if(data.result == "success"){
                    var module = '!'+usrEncryptPrivate;
                    console.log(module);
                    var private = module.replace("!","");
                    console.log(private);
                    return sqlite3Obj.execute("INSERT INTO user VALUES (?,?)",[recoverAccount.address,recoverAccount.private]);
                }
            }).then(function (data){
                if(data.result == "success"){
                    console.log("in success");
                    $scope.recoverAccountObj = recoverAccount;
                    $scope.EthaccountList.push(recoverAccount);
                    $scope.recoverAccountArea = true;
                    //jQuery('#recoverAccountArea').show();
                    console.log($scope.EthaccountList);
                    $scope.refresh();
                }
            }).then().catch(function (err){
                console.log('err = '+err);
            });
        }
    }

    $scope.recoverAccount_CHOP_PK = function(){
        $scope.refresh();
        if($scope.chorus_privateKey == "" && $scope.accountPasswd == ""){
            alert('请输入账户私钥或密码');
        }else{
            var pri = $scope.chorus_privateKey;
            var pubKey = $scope.chorus_privateKey.slice(64,128);
            var usrEncryptPrivate = CryptoJS.AES.encrypt($scope.chorus_privateKey,$scope.accountPasswd);
            usrEncryptPrivate = '!'+usrEncryptPrivate;
            usrEncryptPrivate = usrEncryptPrivate.replace("!","");
            //console.log(usrEncryptPrivate);
            var recoverCHORUSAccount = new Array();
            recoverCHORUSAccount.address = pubKey;
            recoverCHORUSAccount.private = usrEncryptPrivate;
            //var usrinfoArray = new Array();

            sqlite3Obj.createTable("CREATE TABLE  IF NOT EXISTS usr (pubKey char(64),privKey char(216),ethAddress char(42),ethPrivate char(128))").then(function(data){
                if(data.result=="success"){
                    return sqlite3Obj.execute("INSERT INTO usr VALUES (?,?,?,?)",[recoverCHORUSAccount.address,recoverCHORUSAccount.private,null,null]);
                }
            }).then(function(data){
                if(data.result=="success"){
                    console.log("in success");
                    $scope.recoverAccountObj = recoverCHORUSAccount;
                    var accountObj = {};
                    accountObj.pubKey = recoverCHORUSAccount.address;
                    //console.log(account.pubKey);
                    accountObj.privKey = recoverCHORUSAccount.private;
                    $scope.accountList.push(accountObj);
                    $scope.recoverAccountArea = true;
                    //jQuery('#recoverAccountArea').show();
                    console.log($scope.accountList);
                    $scope.refresh();
                }
            }).then().catch(function (err){
                console.log('err = '+err);
            });

            
        }
    }
    /**  恢复账户   ------------end------------- **/    

    /**  我的账户 ------------start------------- **/
    $scope.getAccountInfo = function(){
        //console.log('in getAccountInfo:'+$scope.myAccountAddr);
        if($scope.myAccountAddr != "" && $scope.myAccountAddr != null){
            var sql = 'SELECT * from usr where pubKey =="'+$scope.myAccountAddr+'"';
            //console.log(sql);
            sqlite3Obj.query(sql).then(function(data){
                //console.log(data);
                if(data.result == "success"){
                    $scope.myAccountInfo = data.data[0];
                    console.log($scope.myAccountInfo.pubKey);
                    C.getBalance($scope.myAccountInfo.pubKey).then(function(data){
                        console.log(data);
                        $scope.myAccountInfo.balance = data.share_balance;
                        $scope.myAccountInfo.power = data.share_guaranty;
                        $scope.refresh();
                    }).then().catch(function (err) {
                        alert("err in getAccountInfo.getBalance=", err);
                    });
                    // C.getPower($scope.myAccountInfo.pubKey).then(function(data){
                    //     //console.log(data);
                    //     $scope.myAccountInfo.power = data;
                    //     $scope.refresh();
                    // }).then().catch(function (err) {
                    //     alert("err in getAccountInfo.getPower=", err);
                    // });
                
                }
            }).then().catch(function (err) {
                alert("err in getAccountInfo.query=", err);
            });
        }else{
            console.log('请选择账户');
        }
    }

    $scope.getEthAccountInfo = function(){
        console.log('in getAccountInfo:'+$scope.myEthAccountAddr);
        if($scope.myEthAccountAddr != "" && $scope.myEthAccountAddr != null){
            var sql = 'SELECT * from user where address =="'+$scope.myEthAccountAddr+'"';
            //console.log(sql);
            sqlite3Obj.query(sql).then(function(data){
                console.log(data);
                if(data.result == "success"){
                    $scope.myEthAccountInfo = data.data[0];
                    console.log($scope.myEthAccountInfo);
                    $scope.refresh();
                    C.getEthBalance($scope.myEthAccountInfo.address).then(function(data){
                        console.log(data);
                        $scope.myEthAccountInfo.balance = +data/1000000000;
                        $scope.refresh();
                    }).then().catch(function (err) {
                        alert("err in getAccountInfo.getEthBalance=", err);
                    });
                    C.getNonce($scope.myEthAccountInfo.address).then(function(data){
                        console.log(data);
                        $scope.myEthAccountInfo.nonce = data;
                        $scope.refresh();
                    }).then().catch(function (err) {
                        alert("err in getAccountInfo.getEthBalance=", err);
                    });
                
                }
            }).then().catch(function (err) {
                alert("err in getEthAccountInfo.query=", err);
            });
        }else{
            console.log('请选择账户');
        }
    }

    /**  我的账户 ------------end------------- **/

    /**  选择账户 ------------start------------- **/
    $scope.selectAccount = function(){
        console.log($scope.currentAccountAddr);
        $scope.showBalanceInMainPage(1);
        C.getBalanceInMainPage($scope.currentAccountAddr.address,function(data){
            console.log(data);
            $scope.accountBalance = data;
            $scope.$apply();
        });//暂未调通首页余额。

    }
    /**  我的账户 ------------end------------- **/

    /**  合约 ------------start------------- **/
    /**  合约 ------------end------------- **/

    /**  解析合约ABI ------------start-------------  **/

    $scope.getFunList = new Array();
    $scope.newContract = {};
    $scope.analysisContract = function(){
        $scope.getFunList = new Array();
        if($scope.newContract && $scope.newContract.address && $scope.newContract.ABI){
             console.log($scope.newContract);
            if(C.isJSON($scope.newContract.ABI)){
                try{
                    $scope.getFunList = C.filterGetFun(C.toJSON($scope.newContract.ABI));
                    $scope.sentFunList = C.filterSentFun(C.toJSON($scope.newContract.ABI));
                    console.log($scope.getFunList);
                    console.log($scope.sentFunList);
                    $scope.refresh();
                }catch(err){
                    console.log(err);
                }
                $('#contractShow').modal('show');
            }else{
                alert('ABI格式不正确');
            }
        }else{
            alert('合约地址或者ABI填写有误');
        }
    }


     /**  解析合约ABI  ------------end-------------  **/

     $scope.funAreaHome = false;
     /**  选择合约  ------------start-------------  **/
      $scope.selectMyCotract = function(){
        if(!$scope.myContract) return false;
        console.log($scope.myContract);
        //$scope.showSelectMode(1);

        //$scope.funAreaHome = true; //显示函数区域

        var abi = $scope.myContract.abi;

        $scope.getFunList = C.filterGetFun(C.toJSON(abi));  //解析函数列表
        $scope.sentFunList = C.filterSentFun(C.toJSON(abi));
      }

     /**  选择合约  ------------end-------------  **/

      /**  获取函数  ------------start-------------  **/
     //下拉框选择事件
     $scope.selectGetfun = function(){
        //$scope.showSure = true;
        if(!$scope.getFunObj) return false;
        console.log($scope.getFunObj);

        var outputArr = $scope.getFunObj.outputs;
        $scope.funcInputs = $scope.getFunObj.inputs;
        console.log(outputArr);
        console.log($scope.funcInputs);
    }

    $scope.selectSentfun = function(){
        //$scope.showSure = true;
        if(!$scope.sentFunObj) return false;
        console.log($scope.sentFunObj);

        var outputArr = $scope.sentFunObj.outputs;
        $scope.funcInputs = $scope.sentFunObj.inputs;
        console.log(outputArr);
        console.log($scope.funcInputs);
    }

/**   queryContract ------------start-------------  **/
    $scope.queryContract = function(){
        var contractABI = $scope.myContract.abi;
        contractABI = contractABI.replace(/[\r\t]/g,""); 
        contractABI = contractABI.replace(/[\r\n]/g,"");
        var str = "'";
        contractABI = contractABI.replace(new RegExp(str,'g'),'"'); 
        console.log(contractABI);
        var funcName = $scope.getFunObj.name;
        var contractFunc = $scope.getFunObj;
        var params = $scope.getParams;
        console.log(params);
        console.log(contractFunc);

        if($scope.funcInputs.length > 0){

            var argArr = new Array();
            for(var i=0;i<params.length;i++)
                argArr.push(params[i]);
            
            argArr.push(function(err,result){
            if(err) {
                console.log("error");
                console.log(err);
                }

            if(result){
                console.log(result);
                callback(result);
                }
            });
            console.log(argArr)
            var p = argArr.splice(0,params.length);
            var data = {
                "function":funcName,
                "params":p
            };

            data = JSON.stringify(data);
            console.log(data);

            var postData = {
                "jsonrpc":"2.0",
                "method":"contract_payload",
                "params":[data,contractABI]
            };

            postData = JSON.stringify(postData);
            console.log(postData);
        
            C.getContractPayload(postData).then(function(result){
                console.log($scope.myEthAccountInfo);
                var fromAddr = $scope.myEthAccountAddr;
                var toAddr = $scope.myContract.address;
                var value = 0;
                var gas = 212100;
                var gasPrice = 1;
                var nonce = +$scope.myEthAccountInfo.nonce;
                var data = result;

                C.ethTranferContractquery(fromAddr,toAddr,value,nonce,gas,gasPrice,data).then(function(data){
                    console.log(data.result);
                    $scope.queryResultArea = true;
                    $scope.queryResult = data.result.result.data;
                    var outputType = $scope.getFunObj.outputs[0].type;
                    console.log(outputType);
                    console.log(data.result.result.data);
                    $scope.getEthAccountInfo();
                    if(outputType == "uint256" || outputType == "uint8"){
                        $scope.queryResult = parseInt($scope.queryResult,16);
                        $scope.$apply();
                    }else if(outputType == "string"){
                        $scope.queryResult = new Buffer(($scope.queryResult), 'hex').toString('utf8');
                        console.log($scope.queryResult);
                        $scope.$apply();
                    }else if(outputType == "bool"){
                        $scope.queryResult = new Buffer(($scope.queryResult), 'hex').toString('utf8');
                        console.log($scope.queryResult);
                        $scope.$apply();
                    }
                }).then().catch(function(data){
                    console.log(data);
                    //alert("交易失败。",data);  
                })
            });
        }else{

            var data = {
                "function":funcName
            };

            data = JSON.stringify(data);
            var postData = {
                "jsonrpc":"2.0",
                "method":"contract_payload",
                "params":[data,contractABI]
            };
            postData = JSON.stringify(postData);
            C.getContractPayload(postData).then(function(result){
                console.log($scope.myEthAccountInfo);
                var fromAddr = $scope.myEthAccountAddr;
                var toAddr = $scope.myContract.address;
                var value = 0;
                var gas = 212100;
                var gasPrice = 1;
                var nonce = +$scope.myEthAccountInfo.nonce;
                var data = result;

                C.ethTranferContractquery(fromAddr,toAddr,value,nonce,gas,gasPrice,data).then(function(data){
                    console.log(data.result);
                    $scope.queryResultArea = true;
                    $scope.queryResult = data.result.result.Data;
                    var outputType = $scope.getFunObj.outputs[0].type;
                    console.log(outputType);
                    $scope.getEthAccountInfo();
                    if(outputType == "uint256" || outputType == "uint8"){
                        $scope.queryResult = parseInt($scope.queryResult,16);
                        $scope.$apply();
                    }else if(outputType == "string"){
                        $scope.queryResult = new Buffer(($scope.queryResult), 'hex').toString('utf8');
                        console.log($scope.queryResult);
                        $scope.$apply();
                    }else if(outputType == "bool"){
                        $scope.queryResult = new Buffer(($scope.queryResult), 'hex').toString('utf8');
                        console.log($scope.queryResult);
                        $scope.$apply();
                    }
                }).then().catch(function(data){
                    console.log(data);
                    //alert("交易失败。",data);  
                })
            });
        }

        //
    }

/**   queryContract ------------end-------------  **/

/**   execContract ------------start-------------  **/

    $scope.execContract = function(){
        var contractABI = $scope.myContract.abi;
        contractABI = contractABI.replace(/[\r\t]/g,""); 
        contractABI = contractABI.replace(/[\r\n]/g,"");
        var funcName = $scope.sentFunObj.name;
        var contractFunc = $scope.sentFunObj;
        var params = $scope.sentParams;
        console.log(contractFunc);

        if($scope.funcInputs.length > 0){

            var argArr = new Array();
            for(var i=0;i<params.length;i++)
                argArr.push(params[i]);
            
            argArr.push(function(err,result){
            if(err) {
                console.log("error");
                console.log(err);
                }

            if(result){
                console.log(result);
                callback(result);
                }
            });
            console.log(argArr)
            var p = argArr.splice(0,params.length);
            //argArrstr = argArr.join("-");
            //console.log(argArrstr);
            var data = {
                "function":funcName,
                "params":p
            };
            data = JSON.stringify(data);
            console.log(data);

            var postData = {
                "jsonrpc":"2.0",
                "method":"contract_payload",
                "params":[data,contractABI]
            };

            postData = JSON.stringify(postData);
            // var str = '"';
            // post_data = postData.replace(new RegExp(str,'g'),'\"');
            // console.log(post_data);
        
            C.getContractPayload(postData).then(function(result){
                console.log($scope.myEthAccountInfo);
                var fromAddr = $scope.myEthAccountAddr;
                var toAddr = $scope.myContract.address;
                var value = 0;
                var inputPassphrase = $scope.inputPwd;
                //var Pwd = $scope.myEthAccountInfo.passphrase;
                var gas = 4100000;
                var gasPrice = 1;
                var nonce = +$scope.myEthAccountInfo.nonce;
                var data = result;

                var pri = CryptoJS.AES.decrypt($scope.myEthAccountInfo.private,inputPassphrase).toString(CryptoJS.enc.Utf8);
                C.ethTranfer(pri,fromAddr,toAddr,value,nonce,gas,gasPrice,data).then(function(data){
                    //console.log(data);
                    $scope.getEthAccountInfo();
                    alert("交易成功！\n Txhash:"+"0x"+data.txhash);
                    console.log(data.result);
                    $scope.getAccountInfo();
                    $scope.refresh();
                    $scope.showEthTransferFlag = false;
                    $scope.showEthAccountArea = true;
                    ethtransferObj = {};
                }).then().catch(function(data){
                    console.log(data);
                    //alert("交易失败。",data);  
                })
            });
        }else{
            var data = {
                "abi":contractABI,
                "function":funcName
            };
            data = JSON.stringify(data);
            var postData = {
                "jsonrpc":"2.0",
                "method":"contract_payload",
                "params":[data]
            };
            postData = JSON.stringify(postData);
            var str = '"';
            post_data = postData.replace(new RegExp(str,'g'),'\"');
            console.log(post_data);
            C.getContractPayload(post_data).then(function(result){
                console.log($scope.myEthAccountInfo);
                var fromAddr = $scope.myEthAccountAddr;
                var toAddr = $scope.myContract.address;
                var value = 0;
                var inputPassphrase = $scope.inputPwd;
                //var Pwd = $scope.myEthAccountInfo.passphrase;
                var gas = 4100000;
                var gasPrice = 1;
                var nonce = +$scope.myEthAccountInfo.nonce;
                var data = result;

                var pri = CryptoJS.AES.decrypt($scope.myEthAccountInfo.private,inputPassphrase).toString(CryptoJS.enc.Utf8);
                C.ethTranfer(pri,fromAddr,toAddr,value,nonce,gas,gasPrice,data).then(function(data){
                    $scope.getEthAccountInfo();
                    //console.log(data);
                    alert("交易已提交！\n Txhash:0x"+data);
                    $scope.showEthTransferFlag = false;
                    $scope.showEthAccountArea = true;
                    ethtransferObj = {};
                }).then().catch(function(data){
                    console.log(data);
                    //alert("交易失败。",data);  
                })
            });
        }
    }

/**   execContract ------------end-------------  **/


     /**  获取函数  ------------end-------------  **/

     /**  根据参数获取返回值  ------------start-------------  **/

     $scope.getParams = new Array();
     $scope.sentParams = new Array();
     $scope.params = new Array(); //初始化首页合约函数参数
     $scope.conf = [];

      /**   保存合约 ------------start-------------  **/
       $scope.saveContract = function(){
            console.log($scope.newContract);
            console.log($scope.newContract.address);
            var abi = angular.copy($scope.newContract.ABI);
            abi = abi.replace(/"/g,"'");

            sqlite3Obj.createTable("CREATE TABLE  IF NOT EXISTS contract (name char,address char,abi TEXT)").then(function (data) {
                if(data.result == "success")
                    return sqlite3Obj.execute("INSERT INTO contract VALUES (?,?,?)",[$scope.newContract.name,$scope.newContract.address,abi]);
            }).then(function(data){
                if(data.result == "success"){
                    $scope.initPage();
                    alert('保存成功');
                    $('#contractShow').modal('hide');
                    $scope.hideWatch();
                }
            }).then().catch(function(err){
                console.log("err=", err);
            });
        }


     /**   保存合约 ------------end-------------  **/

     /**   删除数据 ------------start-------------  **/

     $scope.deleteAccount = function(){
        var currentAddr = $scope.myAccountInfo.pubKey;
        var sqc = 'DELETE FROM usr WHERE pubKey == "'+currentAddr+'"';
        console.log(sqc);
        sqlite3Obj.execute(sqc).then(function (data){
            if (data.result == "success"){
                alert("账户"+currentAddr+"已被删除");
                $scope.myAccountInfo = null;
                $scope.initPage();
            }
        }).then().catch(function (data){
            alert(err);
        });
        
     }

     $scope.deleteEthAccount = function(){
        var currentAddr = $scope.myEthAccountInfo.address;
        var sqc = 'DELETE FROM user WHERE address == "'+currentAddr+'"';
        console.log(sqc);
        sqlite3Obj.execute(sqc).then(function (data){
            if (data.result == "success"){
                alert("账户"+currentAddr+"已被删除");
                $scope.myEthAccountInfo = null;
                $scope.initPage();
            }
        }).then().catch(function (data){
            alert(err);
        });
        
     }

     $scope.deleteContract = function(){
        var currentAddr = $scope.myContract.address;
        var sqc = 'DELETE FROM contract WHERE address == "'+currentAddr+'"';
        console.log(sqc);
        sqlite3Obj.execute(sqc).then(function (data){
            if (data.result == "success"){
                alert("合约"+$scope.myContract.name+"已被删除");
                $scope.myContract = null;
                $scope.initPage();
            }
        }).then().catch(function (data){
            alert(err);
        });
        
     }

     /**   删除数据 ------------end-------------  **/

     /**   验证密码 ------------start-------------  **/
     /*
     $scope.verifyPassword = function(){
        var current = webContents.getFocusedWebContents();
        let code = "$('.password').show()";
        current.executeJavaScript(code);
     }
     */
     /**   验证密码 ------------end-------------  **/

     /**   发送coin ------------start-------------  **/

     $scope.transfer = function(){
        console.log($scope.transferObj);
        console.log($scope.myAccountInfo);
        console.log($scope.myEthAccountInfo);
        var ethaddr = $scope.myEthAccountInfo.address;
        var fromAddr = $scope.transferObj.from;
        var toAddr = $scope.transferObj.to;
        var value = +$scope.transferObj.amount;
        if($scope.isAccountPair==true){
            var inputPassphrase = $scope.transferObj.password;
            var inputEthPassphrase = $scope.transferObj.password;
        }else{
            var inputPassphrase = $scope.transferObj.password;
            var inputEthPassphrase = $scope.transferObj.ethpassword;
        }
        //var Pwd = $scope.myAccountInfo.passphrase;
        var gas = +$scope.transferObj.gas || 212100;
        var gasPrice = +$scope.transferObj.gasPrice || 1;
        var nonce = +$scope.myEthAccountInfo.nonce;

        var ethpri = CryptoJS.AES.decrypt($scope.myEthAccountInfo.private,inputEthPassphrase).toString(CryptoJS.enc.Utf8);
        var pri = CryptoJS.AES.decrypt($scope.myAccountInfo.privKey,inputPassphrase).toString(CryptoJS.enc.Utf8);
        C.txTranfer(ethaddr,ethpri,pri,fromAddr,toAddr,value,nonce,gas,gasPrice).then(function(data){
            $scope.getEthAccountInfo();
            //console.log(data);
            alert("交易已提交！\n Txhash:0x"+data);
            $scope.showTransferFlag = false;
            $scope.showAccountArea = true;
        }).then().catch(function(data){
            console.log(data);
            //alert("交易失败。",data);  
        })
    }

    $scope.ethTransfer = function(){
        console.log($scope.ethtransferObj);
        console.log($scope.myEthAccountInfo);
        var fromAddr = $scope.ethtransferObj.from;
        var toAddr = $scope.ethtransferObj.to;
        var value = +$scope.ethtransferObj.amount*1000000000;
        var inputPassphrase = $scope.ethtransferObj.password;
        //var Pwd = $scope.myEthAccountInfo.passphrase;
        var gas = +$scope.ethtransferObj.gas||212100;
        var gasPrice = +$scope.ethtransferObj.gasPrice||1;
        var nonce = +$scope.myEthAccountInfo.nonce;
        var data = "0x"+$scope.ethtransferObj.data;

        var pri = CryptoJS.AES.decrypt($scope.myEthAccountInfo.private,inputPassphrase).toString(CryptoJS.enc.Utf8);
        C.ethTranfer(pri,fromAddr,toAddr,value,nonce,gas,gasPrice,data).then(function(data){
            $scope.getEthAccountInfo();
            console.log(data);
            alert("交易已提交！\n Txhash:"+"0x"+data.txhash);
            $scope.showEthTransferFlag = false;
            $scope.showEthAccountArea = true;
            ethtransferObj = {};
        }).then().catch(function(data){
            console.log(data);
            //alert("交易失败。",data);  
        })
    }
    /**   发送coin ------------end-------------  **/

    /**   合约部署 ------------start-------------  **/

    $scope.deployContract = function(){
        console.log($scope.myEthAccountInfo);
        var fromAddr = $scope.myEthAccountInfo.address;
        var toAddr = "";
        var value = 0;
        var inputPassphrase = $scope.depContract.password;
        //var Pwd = $scope.myEthAccountInfo.passphrase;
        var data = $scope.depContract.code;
        var gas = +$scope.depContract.gas||212100;
        var gasPrice = +$scope.depContract.gasPrice||1;
        var nonce = +$scope.myEthAccountInfo.nonce;

        var pri = CryptoJS.AES.decrypt($scope.myEthAccountInfo.private,inputPassphrase).toString(CryptoJS.enc.Utf8);
        C.ethTranfer(pri,fromAddr,toAddr,value,nonce,gas,gasPrice,data).then(function(data){
            $scope.getEthAccountInfo();
            console.log(data);
            //alert("交易已提交！\n Txhash:"+data.txhash);
            //var txhash = data.txhash；
            console.log("交易已提交！\n Txhash:"+data.txhash);
            $scope.showTransferFlag = false;
            $scope.showAccountArea = true;
            return C.getContractAddress(fromAddr,nonce);
        }).then(function(data){
            console.log("0x"+data);
            var contractAddress = "0x"+data;
            var contractABI = $scope.depContract.ABI;
            var contractName = $scope.depContract.name;
            alert("合约地址:\n"+contractAddress);
            return sqlite3Obj.execute("INSERT INTO contract VALUES (?,?,?)",[contractName,contractAddress,contractABI]);
        }).then(function(data){
            if(data.result == "success"){
                $scope.initPage();
                alert('保存成功');
                $scope.showDeployArea = false;
                $scope.showContractArea = true;
                $scope.depContract = "";
                //$('#contractShow').modal('hide');
                //$scope.hideWatch();
            }
        }).then().catch(function(data){
            console.log(data);
            //alert("交易失败。",data);  
        })
    }

    /**   合约部署 ------------end-------------  **/

    /**   抵押coin ------------start-------------  **/

    $scope.mortgage = function(){
        console.log($scope.mortgageObj);
        console.log($scope.myAccountInfo);
        console.log($scope.myEthAccountInfo);
        var ethaddr = $scope.myEthAccountInfo.address;
        var fromAddr = $scope.mortgageObj.from;
        if($scope.isAccountPair==true){
            var inputPassphrase = $scope.mortgageObj.password;
            var inputEthPassphrase = $scope.mortgageObj.password;
        }else{
            var inputPassphrase = $scope.mortgageObj.password;
            var inputEthPassphrase = $scope.mortgageObj.ethpassword;
        }
        var value = +$scope.mortgageObj.amount;
        //var Pwd = $scope.myAccountInfo.passphrase;
        var type = "mortgage";
        var gas = +$scope.mortgageObj.gas||212100;
        var gasPrice = +$scope.mortgageObj.gasPrice||1;
        var nonce = +$scope.myEthAccountInfo.nonce;

        var ethpri = CryptoJS.AES.decrypt($scope.myEthAccountInfo.private,inputEthPassphrase).toString(CryptoJS.enc.Utf8);
        var pri = CryptoJS.AES.decrypt($scope.myAccountInfo.privKey,inputPassphrase).toString(CryptoJS.enc.Utf8);
        var type = "mortgage";
        C.txMortgageorRedemption(type,ethaddr,ethpri,fromAddr,pri,value,nonce,gas,gasPrice).then(function(data){
            $scope.getEthAccountInfo();
            //console.log(data);
            alert("交易已提交！\n Txhash:0x"+data);
        }).then().catch(function(data){
            console.log(data);
            //alert("交易失败。",data);  
        })
    }

    /**   抵押coin ------------end-------------  **/

    /**   解押coin ------------start-------------  **/

    $scope.redemption = function(){
        console.log($scope.redemptionObj);
        console.log($scope.myAccountInfo);
        console.log($scope.myEthAccountInfo);
        var ethaddr = $scope.myEthAccountInfo.address;
        var fromAddr = $scope.redemptionObj.from;
        if($scope.isAccountPair==true){
            var inputPassphrase = $scope.redemptionObj.password;
            var inputEthPassphrase = $scope.redemptionObj.password;
        }else{
            var inputPassphrase = $scope.redemptionObj.password;
            var inputEthPassphrase = $scope.redemptionObj.ethpassword;
        }
        var value = +$scope.redemptionObj.amount;
        //var Pwd = $scope.myAccountInfo.passphrase;
        var type = "redemption";
        var gas = +$scope.redemptionObj.gas||212100;
        var gasPrice = +$scope.redemptionObj.gasPrice||1;
        var nonce = +$scope.myEthAccountInfo.nonce;

        var ethpri = CryptoJS.AES.decrypt($scope.myEthAccountInfo.private,inputEthPassphrase).toString(CryptoJS.enc.Utf8);
        var pri = CryptoJS.AES.decrypt($scope.myAccountInfo.privKey,inputPassphrase).toString(CryptoJS.enc.Utf8);
        var type = "redemption";
        C.txMortgageorRedemption(type,ethaddr,ethpri,fromAddr,pri,value,nonce,gas,gasPrice).then(function(data){
            $scope.getEthAccountInfo();
            //console.log(data);
            alert("交易已提交！\n Txhash:0x"+data);
        }).then().catch(function(data){
            console.log(data);
            alert("交易失败。",data);  
        })
    }

    /**   解押coin ------------end-------------  **/

    /**   取得发送出的总额 ------------start-------------  **/

    $scope.calculate = function(){
        var value = Number($scope.transferObj.amount);
        var gas = Number($scope.transferObj.gas);
        var gasPrice = Number($scope.transferObj.gasPrice);
        var gasCost = (gas*gasPrice/1000000000000000000);
        $scope.transferObj.total = value+gasCost+"ETH";
        $scope.showTotalIndex(1);
    }

    /**   取得发送出的总额 ------------end-------------  **/

    // /**   控制台 ------------start-------------  **/
    // /**   控制台 ------------end-------------  **/

    // /**   编译合约 ------------start-------------  **/
    // /**   编译合约 ------------end-------------  **/

    /**   选择编译后的合约 ------------start-------------  **/

    $scope.selectCotracts = function(){
        //console.log($scope.selectedCotracts);
        var data = $scope.cpcontract;
        $scope.compileContract = true;
        $scope.showCompileResult = true;
        $scope.getCode = data.contracts[$scope.selectedCotracts].bytecode;
        $scope.getABI = data.contracts[$scope.selectedCotracts].interface;
        $scope.refresh();
    }
    /**   选择编译后的合约 ------------end-------------  **/

    /**   例子 ------------start-------------  **/

     /**   例子 ------------end-------------  **/



    
    $scope.showNewAccount = function () {
        jQuery('.newAccount').show();
        jQuery('.mainContent').hide();
    }

    $scope.showServerSet = function () {
        jQuery('.ServerSet').show();
        jQuery('.mainContent').hide();
    }

    $scope.showNewAsset = function () {
        jQuery('.newAseet').show();
        jQuery('.mainContent').hide();
    }

    $scope.accountSwitch = true;
    $scope.toggleAccount = function (type) {
        
        if (type == 1){
            $scope.showGenAccount = true;
            $scope.showBackupAccount = false;
        }else if (type == 2){
            $scope.showGenAccount = false;
            $scope.showBackupAccount = true;
            $scope.showCHOE_backup_1 = false;
            $scope.showCHOE_backup_2 = false;
            $scope.showCHOP_backup = false;
        }
    
    }

    $scope.backUpNextStep = function(){
        if($scope.typeChoice==0){
            $scope.showCHOE_backup_1= true;
            $scope.showCHOE_backup_2= false;
            $scope.showCHOP_backup= false;
            $scope.showGenAccount = false;
            $scope.showBackupAccount = false;
        }else if($scope.typeChoice==1){
            $scope.showCHOE_backup_2= true;
            $scope.showCHOE_backup_1= false;
            $scope.showCHOP_backup= false;
            $scope.showGenAccount = false;
            $scope.showBackupAccount = false;
        }else if($scope.typeChoice==2){
            $scope.showCHOP_backup= true;
            $scope.showCHOE_backup_1= false;
            $scope.showCHOE_backup_2= false;
            $scope.showGenAccount = false;
            $scope.showBackupAccount = false;
        }
    }

    //$scope.SelectMode = false;
    $scope.showSelectMode = function (type){

        if (type == 1){
            $scope.SelectMode = true;
        }else{
            $scope.SelectMode = false;
        }
    }

    $scope.showBalanceInMainPage = function(type){
        if(type == 1){
            $scope.showBalance = true;
        }else{
            $scope.showBalance = false;
        }
    }

    $scope.showfunAreaQuery = function (){
        $scope.contractExec = 1;
        $scope.contractQuery += 1;
        if ($scope.contractQuery%2==0){
            $scope.funAreaQuery = true;
            $scope.funAreaTrade = false;
            $scope.funcInputs = 0;
            $scope.sentParams = new Array();
            $scope.inputPwd = "";
            if($scope.getFunObj)
                $scope.selectGetfun();
        }else{
            $scope.funAreaQuery = false;
        }
    }

    $scope.showfunAreaTrade = function (){
        $scope.contractQuery = 1;
        $scope.contractExec += 1;
        if ($scope.contractExec%2==0){
            $scope.funAreaTrade = true;
            $scope.funAreaQuery = false;
            $scope.funcInputs = 0;
            $scope.getParams = new Array();
            $scope.queryResultArea = false;
            if($scope.sentFunObj)  
                $scope.selectSentfun();
        }else{
            $scope.funAreaTrade = false;
        }
    }

    $scope.showInputGasPrice = function (type){
        if (type ==1){
            $scope.showGasPrice = true;
        }else{
            $scope.showGasPrice = false;
        }
    }

    $scope.showTotalIndex = function (type){
        if (type ==1){
            $scope.showTotal = true;
        }else{
            $scope.showTotal = false;
        }
    }

    $scope.hideControl = function(){
        jQuery(".control").hide();
    }

    $scope.transferObj = {};
    $scope.showTransfer = function(){
        $scope.showTransferFlag = true;
        $scope.showAccountArea = false;
        $scope.transferObj.from =  $scope.myAccountInfo.pubKey;
        $scope.myEthAccountAddr = $scope.myAccountInfo.ethAddress;
        if($scope.myAccountInfo.ethAddress==null){
            $scope.isAccountPair = false;
        }else{
            $scope.getEthAccountInfo();
            $scope.isAccountPair = true;
        }
    }

    $scope.hideTransfer = function(){
        $scope.showTransferFlag = false;
        $scope.showAccountArea = true;
    }

    $scope.ethtransferObj = {};
    $scope.showEthTransfer = function(){
        $scope.showEthTransferFlag = true;
        $scope.showEthAccountArea = false;
        $scope.ethtransferObj.from =  $scope.myEthAccountInfo.address;
    }

    $scope.hideEthTransfer = function(){
        $scope.showEthTransferFlag = false;
        $scope.showEthAccountArea = true;
    }

    $scope.showBackup = function(type){
        if(type==1){
            $scope.showAccountArea = false;
            $scope.showChorusAccountBackupArea = true;
        }else if(type==2){
            $scope.showEthAccountArea = false;
            $scope.showEthAccountBackupArea = true;
        }
    }

    $scope.hideChorusAccountBackupArea = function(){
        $scope.showChorusAccountBackupArea = false;
        $scope.showAccountArea = true;
    }

    $scope.hideEthAccountBackupArea = function(){
        $scope.showEthAccountBackupArea = false;
        $scope.showEthAccountArea = true;
    }

    $scope.setting = function(){
        $scope.showTranferSetting = true;
    }

    $scope.mortgageObj = {};
    $scope.showMortgage = function(){
        $scope.showMortgageFlag = true;
        $scope.showAccountArea = false;
        $scope.mortgageObj.from =  $scope.myAccountInfo.pubKey;
        $scope.myEthAccountAddr = $scope.myAccountInfo.ethAddress;
        if($scope.myAccountInfo.ethAddress==null){
            $scope.isAccountPair = false;
        }else{
            $scope.getEthAccountInfo();
            $scope.isAccountPair = true;
        }
    }

    $scope.hideMortgage = function(){
        $scope.showMortgageFlag = false;
        $scope.showAccountArea = true;
    }

    $scope.redemptionObj = {};
    $scope.showRedemption = function(){
        $scope.showRedemptionFlag = true;
        $scope.showAccountArea = false;
        $scope.redemptionObj.from =  $scope.myAccountInfo.pubKey;
        $scope.myEthAccountAddr = $scope.myAccountInfo.ethAddress;
        if($scope.myAccountInfo.ethAddress==null){
            $scope.isAccountPair = false;
        }else{
            $scope.getEthAccountInfo();
            $scope.isAccountPair = true;
        }
    }

    $scope.hideRedemption = function(){
        $scope.showRedemptionFlag = false;
        $scope.showAccountArea = true;
    }

    $scope.showWatch = function(){
        $scope.showContractArea = false;
        $scope.showWatchArea = true;
    }

    $scope.hideWatch = function(){
        $scope.showWatchArea = false;
        $scope.showEnterContractDetailsArea = false;
        $scope.showContractArea = true;
        $scope.newContract = {};
    }

    $scope.showDeploy = function(){
        $scope.showContractArea = false;
        $scope.showDeployArea = true;
    }

    $scope.hideDeploy = function(){
        $scope.showDeployArea = false;
        $scope.showContractArea = true;
    }

    $scope.showDevelop = function(){
        var Remixurl = 'https://ethereum.github.io/browser-solidity/#version=soljson-latest.js&optimize=false';
        $scope.showContractArea = false;
        $scope.showSelectContract = false;
        $scope.showDeployArea = true;
        shell.openExternal(Remixurl);
    }

    $scope.hideDevelop = function(){
        $scope.showDevelopArea = false;
        $scope.showContractArea = true;
        $scope.showButton = true;
        $scope.showCompileResult = false
        $scope.getCode ='';
        $scope.getABI ='';
        $scope.solidityCode ='';
    }

    $scope.showABI = function(){
        $scope.showABIArea = true;
        $scope.showContractArea = false;
    }

    $scope.hideABI = function(){
        $scope.showABIArea = false;
        $scope.showContractArea = true;
    }

    $scope.showEnterContractDetails = function(){
        $scope.showContractArea = false;
        $scope.showWatchArea = false;
        $scope.showEnterContractDetailsArea = true;
        console.log($scope.typeChoice);
        if($scope.typeChoice == 0){
            $scope.newContract.ABI = tokenABI;
        }else if($scope.typeChoice == 1){
            $scope.newContract.ABI = multisigWalletABI;
        }else{
            console.log('please input contract ABI.');
        }
    }

    $scope.showValidatorsArea = function(){
        $scope.validatorsSwitch += 1;
        console.log($scope.infoBlock.validators);
        if($scope.validatorsSwitch%2==0){
            $scope.validatorsArea = true;
        }else{
            $scope.validatorsArea = false;
        }
    }

    $scope.backToTypeChoice = function(){
        $scope.showWatchArea = true;
        $scope.showEnterContractDetailsArea = false;
        $scope.showContractArea = false;
        $scope.newContract = {};
    }

    $scope.getBlockInfo = function(){
        $scope.showqueryBlockInfo = false;
        C.getBlockInfo($scope.blockOrTx).then(function(data){
            console.log("in getBlockInfo");
            console.log(data);
            console.log("in getBlockInfo");
            $scope.blockOrTx = data.number;
            $scope.blockInfo = data;
            $scope.showqueryBlockInfo = true;
            $scope.$apply();
        }).then().catch(function (err){
            console.log(err);
        });
    }

    $scope.getTxInfo = function(){
        $scope.showTxInfo = false;
        if($scope.txHash){
            C.getTxInfo($scope.txHash).then(function(data){
                console.log(data);
                $scope.txInfoObj = data.result.tx;
                $scope.txInfoPayload = data.result.tx.payload;
                $scope.showTxInfo = true;
                $scope.$apply();
            }).then().catch(function (err){
                console.log(err);
            });
        }
    }

    $scope.searchTxOrBlock = function(){
        $scope.searchTx = false;
        console.log(C.isNumber($scope.blockOrTx));
        if(C.isNumber($scope.blockOrTx)){
            $scope.getBlockInfo();
        }else{
            $scope.searchTx = true;
            $scope.txHash = $scope.blockOrTx;
            $scope.getTxInfo();
        }
    }

    $scope.blockLoopFlag;
    $scope.getBlockLoop = function(){
        $scope.blockLoopFlag = setInterval(function(){
            $scope.getInfoBlock();
        },1000);
    }

    $scope.getInfoBlock = function(){
        $scope.showBlockInfo = false;
        C.getBlockInfo(0).then(function(data){
            console.log("in getInfoBlock");
            console.log(data);
            var blockTime = new Date(data.result.block.header.time/1000000);
            blockTime = blockTime.toString();
            $scope.infoBlock = data;
            $scope.infoBlock.time = blockTime.slice(0,25);
            return C.getValidators();
        }).then(function(data){
            $scope.infoBlock.validators = data;
            $scope.showBlockInfo = true;
            $scope.$apply();
        }).catch(function (err){
            console.log(err);
        });
    }
});
