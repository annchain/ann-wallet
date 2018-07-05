/**
 * Created by stig on 2017/3/31.
 */
var fs = require('fs');
var path = require('path');
var cryptojs = require("cryptojs");
var ethUtil = require("ethereumjs-util");
var Crypto = cryptojs.Crypto;
var promise = require('bluebird');
var Tx = require('ethereumjs-tx');
//var SolidityFunction = require('web3/lib/web3/function');
var _ = require('lodash');
var child_process = require("child_process");
var ed = require('./lib/js-crypto/src');
var hex = require('./lib/js-crypto/src/hex');
var rlp = require('rlp');
var secp256k1 = require('secp256k1');
var sha256 = require("sha256");
var request = require('request');
var request_json = require('request-json');
var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = pdfFonts.pdfMake.vfs;
var nacl;
require("js-nacl").instantiate(function (nacl_instance){
    nacl = nacl_instance;
})

global.server = "http://101.132.104.7:46657/";
//server list = "http://10.253.105.196:46657/"
//server list = "http://10.253.169.129:30001/";//老干
var client = request_json.createClient(server);  

var obj = {};
var exePath = path.resolve(__dirname, './chorustool');
console.log(exePath);

function broadcastTx(type,rawTx){
    if(type=="chorus"){
        opCode = "010201";
    }else if(type=="eth"){
        opCode = "010101";
    }else if(type=="mortgage"){
        opCode = "010202";
    }else if(type=="redemption"){
        opCode = "010203";
    }else{
        console.log('type err');
    }

    var url =  server + 'broadcast_tx_commit?tx=0x' + opCode + rawTx;
    console.log(url);
    return new promise(function(resolve,reject){
        request(url,function(error,response,body){
            if(error){
                console.log("err:",error);
                reject(error);
            }
            var JSONbody = JSON.parse(body)
            console.log(JSONbody);
            resolve(JSONbody.result.data);
        });
    })
}

function contractQuery(rawTx){
    var url =  server + 'query_contract?tx=0x' + rawTx;
    console.log(url);
    return new promise(function(resolve,reject){
        request(url,function(error,response,body){
            if(error){
                console.log("err:",error);
                reject(error);
            }
            var JSONbody = JSON.parse(body)
            console.log(JSONbody);
            resolve(JSONbody);
        });
    })
}

obj.setIp = function(ip){
    global.server = ip;
}

obj.getContractPayload = function(params,abi){
    params = JSON.parse(params);
    return new promise(function(resolve,reject){
    console.log("in getContractPayload");
        client.post('', params, function(err, res, body) {  
            if(err){
                console.log(err);
                reject(err);
            }
            //console.log(body);
            console.log(res.statusCode,body);
            resolve(body.result.data);
            //console.log(res);  
        }); 
    })
}
//gen ed25519
obj.genKeypair = function(){
    return new promise(function(resolve,reject){
        console.log(ed);
        var kp = {};
        var privkey = ed.genPrivKeyEd25519();
        var pubkey = privkey.makePubKey();
        console.log(privkey);
        console.log(pubkey);
        var privkeyJSON = privkey.toJSON();
        var pubkeyJSON = pubkey.toJSON();
        kp.privkey = privkeyJSON['1'];
        kp.pubkey = pubkeyJSON['1'];
        resolve(kp);
    })
}

obj.getBalance = function(pubKey){
    console.log('in getBalance',pubKey);
    return new promise(function(resolve,reject){
        var url =  server + 'query_share?pubkey=0x' + pubKey;
        console.log(url);
        request(url,function(error,response,body){
            if(error){
                console.log("err:",error);
                reject(error);
            }
            var JSONbody = JSON.parse(body)
            console.log(JSONbody);
            resolve(JSONbody.result);
        });
    });
}

obj.getEthBalance = function(addr){
    return new promise(function(resolve,reject){
        console.log(addr);
        var url =  server + 'query_balance?address=' + addr;
        console.log(url);
        request(url,function(error,response,body){
            if(error){
                console.log("err:",error);
                reject(error);
            }
            var JSONbody = JSON.parse(body)
            console.log(JSONbody);
            resolve(JSONbody.result.balance);
        });
    })
}

obj.getNonce = function(addr){
    console.log('in getNonce',addr);
        return new promise(function(resolve,reject){
            var url =  server + 'query_nonce?address=' + addr;
            console.log(url);
            request(url,function(error,response,body){
                if(error){
                    console.log("err:",error);
                    reject(error);
                }
                var JSONbody = JSON.parse(body)
                console.log(JSONbody);
                resolve(JSONbody.result.nonce);
            });
        });
}

obj.getValidators = function(){
    return new promise(function(resolve,reject){
        var url =  server + 'validators';
        console.log(url);
        request(url,function(error,response,body){
            if(error){
                console.log("err:",error);
                reject(error);
            }
            var JSONbody = JSON.parse(body)
            console.log(JSONbody);
            resolve(JSONbody.result.validators);
        });
    })
}

obj.txTranfer = function(ethaddr,ethprivkey,privkey,from,to,value,nonce,gas,gasPrice){
    console.log('in txTranfer',ethaddr,ethprivkey,privkey,from,to,value,nonce,gas,gasPrice);
    return new promise(function(resolve,reject){
        var shareTx = new TxShareTransferWithoutsig(null);
            shareTx.ShareSrc = "0x"+from;
            shareTx.ShareDst = "0x"+to;
            shareTx.Amount = value;
            //console.log(shareTx.ShareSrc);
        var bs = rlp.encode(shareTx.raw);
        console.log("bs",bs.toString("hex"));
        var hs = ethUtil.sha256(bs);
        var pk = new Buffer(privkey, "hex");
        var sig = nacl.crypto_sign_detached(hs, pk);
        var buf = new Buffer(hex.encode(sig), "hex");
        console.log(buf);
        console.log(buf.toString("hex"));
        // var pk = new(ed.PrivKeyEd25519);
        // var privateKeyHex = new Buffer(privkey, 'hex');
        // pk.bytes = privateKeyHex;
        // var sigBytes = pk.signString(bs);
        //var sig = hex.encode(sigBytes);
        //var sigBytes = nacl.crypto_sign_detached(bs, privateKeyHex);
        // console.log(sigBytes);
        //var a = new Buffer(sigBytes,'hex');
        var shareTxx = new TxShareTransferWithsig(null);
            shareTxx.ShareSrc = "0x"+from;
            shareTxx.ShareDst = "0x"+to;
            shareTxx.Amount = value;
            shareTxx.ShareSig = buf;
        var hs1 = rlp.encode(shareTxx.raw);
        console.log("sigrlp", hs1);
        console.log(hs1.toString("hex"));

        var blockTx = new BlockTxwithoutsig(null);
            blockTx.GasLimit = gas;
            blockTx.GasPrice = gasPrice;
            blockTx.Nonce = nonce;
            blockTx.Sender = ethaddr;
            blockTx.Payload = hs1;
        var hs2 = rlp.encode(blockTx.raw);
        console.log("sigrlp", hs2.toString("hex"));
        var rawBlkTx = ethUtil.sha256(hs2);
        console.log("sighash", rawBlkTx.toString("hex"));

        var ethprivateKeyHex = new Buffer(ethprivkey, 'hex');
        var sigObj = secp256k1.sign(rawBlkTx, ethprivateKeyHex);
        console.log(sigObj);
        console.log(sigObj.recovery);
        console.log("sigObj", sigObj.signature.toString("hex"));
        var arr = new Uint8Array(1);
        arr[0] = sigObj.recovery;
        var recoveryBuf = new Buffer(arr.buffer);
        console.log(recoveryBuf);
        var arr2 = new Uint8Array(65);
        var sig = new Buffer(arr2.buffer);
        sigObj.signature.copy(sig,0,0,64);
        //recoveryBuf.copy(sig,65,0);
        sig[64]=sigObj.recovery;
        console.log(sig);

        var blockTxx = new BlockTxWithsig(null);
            blockTxx.GasLimit = gas;
            blockTxx.GasPrice = gasPrice;
            blockTxx.Nonce = nonce;
            blockTxx.Sender = ethaddr;
            blockTxx.Payload = hs1;
            blockTxx.Signature = sig;
        var hs3 = rlp.encode(blockTxx.raw);
        console.log(hs3.toString("hex"));
        //var txhash = sha256(hs3.toString("hex"));
        var txhash = sha256(hs3);
        console.log(txhash);
        resolve(txhash);
        var type = "chorus";
        broadcastTx(type,hs3.toString("hex"));
    }) 
}

obj.txMortgageorRedemption = function(type,ethaddr,ethprivkey,from,privkey,value,nonce,gas,gasPrice){
    console.log('in txMortgageorRedemption',type,ethaddr,from,privkey,value,nonce,gas,gasPrice);
    return new promise(function(resolve,reject){
        console.log(from);
        var shareTx = new TxShareEcoWithoutsig(null);
            shareTx.Source = '0x'+from;
            shareTx.Amount = value;
        var bs = rlp.encode(shareTx.raw);
        console.log("bs",bs.toString("hex"));
        var hs = ethUtil.sha256(bs);
        var pk = new Buffer(privkey, "hex");
        var sig = nacl.crypto_sign_detached(hs, pk);
        var buf = new Buffer(hex.encode(sig), "hex");
        console.log(buf);
        console.log(buf.toString("hex"));

        var shareTxx = new TxShareEcoWithsig(null);
            shareTxx.Source = '0x'+from;
            shareTxx.Amount = value;
            shareTxx.Signature = buf;
        var hs1 = rlp.encode(shareTxx.raw);
        console.log("sigrlp", hs1);
        console.log(hs1.toString("hex"));

        var blockTx = new BlockTxwithoutsig(null);
            blockTx.GasLimit = gas;
            blockTx.GasPrice = gasPrice;
            blockTx.Nonce = nonce;
            blockTx.Sender = ethaddr;
            blockTx.Payload = hs1;
        var hs2 = rlp.encode(blockTx.raw);
        console.log("sigrlp", hs2.toString("hex"));
        var rawBlkTx = ethUtil.sha256(hs2);
        console.log("sighash", rawBlkTx.toString("hex"));

        var ethprivateKeyHex = new Buffer(ethprivkey, 'hex');
        var sigObj = secp256k1.sign(rawBlkTx, ethprivateKeyHex);
        console.log(sigObj.recovery);
        console.log("sig", sigObj.signature.toString("hex"));
        var arr = new Uint8Array(1);
        arr[0] = sigObj.recovery;
        var recoveryBuf = new Buffer(arr.buffer);
        console.log(recoveryBuf);
        var arr2 = new Uint8Array(65);
        var sig = new Buffer(arr2.buffer);
        sigObj.signature.copy(sig,0,0,64);
        recoveryBuf.copy(sig,64,0);
        console.log(sig);

        var blockTxx = new BlockTxWithsig(null);
            blockTxx.GasLimit = gas;
            blockTxx.GasPrice = gasPrice;
            blockTxx.Nonce = nonce;
            blockTxx.Sender = ethaddr;
            blockTxx.Payload = hs1;
            blockTxx.Signature = sig;
        var hs3 = rlp.encode(blockTxx.raw);
        console.log(hs3.toString("hex"));
        //var txhash = sha256(hs3.toString("hex"));
        var txhash = sha256(hs3);
        console.log(txhash);
        resolve(txhash);
        broadcastTx(type,hs3.toString("hex"));
    }) 
}

obj.ethTranferContractquery = function(from,to,value,nonce,gas,gasPrice,data){
    console.log('in ethTranferContractquery',from,to,value,nonce,gas,gasPrice,data);
    return new promise(function(resolve,reject){
        var evmTx = new TxEvmCommon(null);
            evmTx.To = to;
            evmTx.Amount = value;
            evmTx.Load = data;
        var bs = rlp.encode(evmTx.raw);
        console.log("bs",bs.toString("hex"));

        var blockTxx = new BlockTxWithsig(null);
            blockTxx.GasLimit = gas;
            blockTxx.GasPrice = gasPrice;
            blockTxx.Nonce = nonce;
            blockTxx.Sender = from;
            blockTxx.Payload = bs;
            blockTxx.Signature = "";
        var hs1 = rlp.encode(blockTxx.raw);
        console.log("rlp", hs1.toString("hex"));
        contractQuery(hs1.toString("hex")).then(function(data){
            var result = {
                "result":data
            };
            resolve(result);  

        });
    })
}

obj.ethTranfer = function(privkey,from,to,value,nonce,gas,gasPrice,data){
    console.log('in ethTranfer',from,to,value,nonce,gas,gasPrice,data);
    return new promise(function(resolve,reject){
        var evmTx = new TxEvmCommon(null);
            evmTx.To = to;
            evmTx.Amount = value;
            evmTx.Load = data;
        var bs = rlp.encode(evmTx.raw);
        console.log("bs",bs.toString("hex"));

        var blockTx = new BlockTxwithoutsig(null);
            blockTx.GasLimit = gas;
            blockTx.GasPrice = gasPrice;
            blockTx.Nonce = nonce;
            blockTx.Sender = from;
            blockTx.Payload = bs;
        var hs1 = rlp.encode(blockTx.raw);
        console.log("sigrlp", hs1.toString("hex"));
        var rawBlkTx = ethUtil.sha256(hs1);
        console.log("sighash", rawBlkTx.toString("hex"));

        var privateKeyHex = new Buffer(privkey, 'hex');
        var sigObj = secp256k1.sign(rawBlkTx, privateKeyHex);
        console.log(sigObj);
        console.log(sigObj.recovery);
        console.log("sigObj", sigObj.signature.toString("hex"));
        var arr = new Uint8Array(1);
        arr[0] = sigObj.recovery;
        var recoveryBuf = new Buffer(arr.buffer);
        console.log(recoveryBuf);
        var arr2 = new Uint8Array(65);
        var sig = new Buffer(arr2.buffer);
        sigObj.signature.copy(sig,0,0,64);
        recoveryBuf.copy(sig,64,0);
        console.log(sig);

        var blockTxx = new BlockTxWithsig(null);
            blockTxx.GasLimit = gas;
            blockTxx.GasPrice = gasPrice;
            blockTxx.Nonce = nonce;
            blockTxx.Sender = from;
            blockTxx.Payload = bs;
            blockTxx.Signature = sig;
        console.log(blockTxx.GasLimit);
        console.log(blockTxx.Signature);
        var hs2 = rlp.encode(blockTxx.raw);
        console.log("hs2",hs2.toString("hex"));
        //var txhash = sha256(hs2.toString("hex"));
        var txhash = sha256(hs2);
        console.log(txhash);
        //resolve(txhash);
        var type = "eth"
        broadcastTx(type,hs2.toString("hex")).then(function(data){
            var result = {
                "txhash":txhash,
                "result":data
            };
            resolve(result);  

        });
    }) 
}

obj.layoutPDF = function(type,data){
    if(type=="secp"){
        var docDefinition = { content: [
            { text: 'CHORUS WALLET ACCOUNT BACKUP CARD', style: 'header' },"\n","\n",
            { text: 'CHOE account:', style: 'header' },"\n","\n",
            { text: 'address:', style: 'header' },
            data.address,"\n",
            { text: 'privKey:', style: 'header' },
            data.secp_privKey,"\n",
            { text: 'recoverPhrase:', style: 'header' },
            data.recoverPhrase,"\n"
        ] };
    }else if(type=="ed"){

    }else if(type=="pair"){
        var docDefinition = { content: [
            { text: 'CHORUS WALLET ACCOUNT BACKUP CARD', style: 'header' },"\n","\n",
            { text: 'CHOE account:', style: 'header' },"\n","\n",
            { text: 'address:', style: 'header' },
            data.address,"\n",
            { text: 'privKey:', style: 'header' },
            data.secp_privKey,"\n",
            { text: 'recoverPhrase:', style: 'header' },
            data.recoverPhrase,"\n","\n",
            { text: 'CHOP account:', style: 'header' },"\n","\n",
            { text: 'pubKey:', style: 'header' },
            data.pubKey,"\n",
            { text: 'pubKey:', style: 'header' },
            data.ed_privKey
        ] }; 
    }
    
    return new promise(function(resolve,reject){
        try{
            pdfMake.createPdf(docDefinition).download();
            resolve("success");
        }catch(err){
            reject(err);
        }
    })
}

obj.contractInitArg = function(argArr){
    console.log('in contractInitArg',argArr);
    return new promise(function(resolve,reject){
        var hexResult = "";
        for(var i=0;i<argArr.length;i++){
            console.log(argArr[i]);
        }      
    })
}

obj.getContractAddress = function(addr,nonce){
    console.log('in contractInitArg',addr,nonce);
    return new promise(function(resolve,reject){
        var contractAddr = ethUtil.generateAddress(addr,nonce);
        resolve(contractAddr.toString("hex"));
    })
}

obj.getBlockInfo = function(blockNumber){
    return new promise(function(resolve,reject){
        if(!blockNumber) blockNumber = 0;
        var url =  server + 'block?height='+ blockNumber;
        console.log(url);
        request(url,function(error, response, body){
            if(error){
                console.log("err:",error);
            }
            var JSONbody = JSON.parse(body)
            console.log(JSONbody);
            resolve(JSONbody);
        })
    });
}

obj.getTxInfo = function(txHash){
    return new promise(function(resolve,reject){
        console.log("in----- getTxInfo",txHash);
        var url =  server + 'query_tx?hash='+ txHash;
        console.log(url);
        request(url, function (error, response, body) {
            //console.log('error:', error);
            //console.log('statusCode:', response && response.statusCode);
            console.log('body:', body);
            resolve(JSON.parse(body)); 
        });
    });
}

obj.isNumber = function(value) {
    var patrn = /^(-)?\d+(\.\d+)?$/;
    if (patrn.exec(value) == null || value == "") {
        return false
    } else {
        return true
    }
}

var nonceAddrMap = new Array();//解决短时间连续发送交易堵塞的情况。为nonce强制赋值。

//判断字符串是否是json形式的
obj.isJSON = function(str) {
    if (typeof str == 'string') {
        try {
            // JSON.parse(str);
            eval('('+str+')');
            return true;
        } catch(e) {
            // console.log(e);
            return false;
        }
    }else{
        return false;
    }  
}

obj.toJSON = function(str){
    return  eval('('+str+')');
}

obj.filterGetFun = function(abiArr){
    var result = new Array();
    for(var i=0;i<abiArr.length;i++){
        var item = abiArr[i];
        console.log(item);
        console.log(item.type);
        if(item.type == "function" && item.stateMutability=="view"){
            result.push(item);
        }
    }

    return result;
}

obj.filterSentFun = function(abiArr){
    var result = new Array();
    for(var i = 0;i<abiArr.length;i++){
        var item = abiArr[i];
        if (item.type == "function" && item.stateMutability=="nonpayable"){
            result.push(item);
        }     
    }

    return result;
}

obj.filterDepFun = function(abiArr){
    var result = new Array();
    for(var i = 0;i<abiArr.length;i++){
        var item = abiArr[i];
        if (item.type == "function" && item.outputs && item.outputs.length && item.inputs.length<1 && item.constant==true){
            result.push(item);
        }     
    }

    return result;
}

var myBusiness,instanceMyBusiness;

// obj.initWeb3 = function(abi,addr){
//         myBusiness = web3.eth.contract(abi);
//         instanceMyBusiness = myBusiness.at(addr);
//         instanceMyBusiness.defaultCallObject = {};
//         instanceMyBusiness.defaultTransactionObject = {gas: 4000000, value: 0};
//         web3.eth.getAccounts(function(err, result){
//             if(!err)
//                 instanceMyBusiness.defaultTransactionObject.from = result[0];
//                 instanceMyBusiness.defaultCallObject.from = result[0];
//         });
// }
obj.getValByGetFun = function(name,abi,addr,callback){
    console.log(name);
    console.log(abi);
    myBusiness = web3.eth.contract(abi);
    console.log(myBusiness);
    console.log(addr);
    instanceMyBusiness = myBusiness.at(addr);
    console.log(instanceMyBusiness);
    instanceMyBusiness.defaultCallObject = {};
    instanceMyBusiness.defaultTransactionObject = {gas: 4000000, value: 0};
    instanceMyBusiness.defaultCallObject.from = "0x68bce2c51f551420930a61dd6d2bc3722afc785d";
    instanceMyBusiness[name].call(instanceMyBusiness.defaultCallObject,function(err,result){
        if(err) console.log(err);

        if(result){
            console.log(result);
            console.log(Number(result))
            callback(result);
        }
    });
}

obj.getValByInputs = function(name,abi,addr,inputs,callback){
    myBusiness = web3.eth.contract(abi);
    instanceMyBusiness = myBusiness.at(addr);
    console.log(instanceMyBusiness);
    instanceMyBusiness.defaultCallObject = {};
    instanceMyBusiness.defaultCallObject.from = "0x68bce2c51f551420930a61dd6d2bc3722afc785d";

    var argArr = new Array();
    for(var i=0;i<inputs.length;i++)
        argArr.push(inputs[i]);

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
    console.log(argArr);

    instanceMyBusiness[name].apply(instanceMyBusiness.defaultCallObject,argArr);
}

obj.getVarType = function(val){
    var t = typeof val;
    if(t == "object"){
        if(val instanceof Array){
            t = "Array";
        }
    }
    return t;
}


//获取函数数据
/**
 *
 * @param abi
 * @param funName
 * @param paramArr
 * @returns {*}
 */
obj.getPayLoad = function (abi,funName,paramArr) {
    // var src="contract helloworld{struct user{uint id;}   mapping(uint=>user) public users   ; uint public userCount=0;  function setTableuser(uint id){users[id].id=id; userCount++;  }  function updateuser(uint id){users[id].id=id;}  function queryuser(uint id) public constant returns (uint){  return (users[id].id);}  }";
    // var compileObj = web3.eth.compile.solidity(src);  //编译合约
    // var abi = compileObj["helloworld"].info.abiDefinition;

    // var solidityFunction = new SolidityFunction('', _.find(abi, { name: 'setTableuser' }), '');
    var solidityFunction = new SolidityFunction('', _.find(abi, { name: funName }), '');

    // var payloadData = solidityFunction.toPayload([1]).data;
    var payloadData = solidityFunction.toPayload(paramArr).data;
    console.log("payloadData");
    console.log(payloadData);

    return payloadData;
}

obj.cmdWord = function(){
    var a = "👏欢迎使用chorus wallet控制台。键入‘help’以获取命令帮助，键入‘clear’以清除屏幕。Type ‘help’ for an overview of available commands.";
    return a ;
}

class BlockTxwithoutsig {
  constructor (data) {
    data = data || {}
    // Define Properties
    const fields = [{
      name: 'GasLimit',
      length: 32,
      allowLess: true,
      default: new Buffer([])
    }, {
      name: 'GasPrice',
      length: 32,
      allowLess: true,
      default: new Buffer([])
    }, {
      name: 'Nonce',
      length: 32,
      allowLess: true,
      default: new Buffer([])
    },{
      name: 'Sender',
      length: 20,
      allowZero: true,
      default: new Buffer([])
    },{
      name: 'Payload',
      allowLess: true,
      default: new Buffer([])
    }]


    ethUtil.defineProperties(this, fields, data)
    
  }

  hash () {

    let items
    items = this.raw

    // create hash
    
    return ethUtil.rlphash(items)
  }

}

class BlockTxWithsig {
  constructor (data) {
    data = data || {}
    // Define Properties
    const fields = [{
      name: 'GasLimit',
      length: 32,
      allowLess: true,
      default: new Buffer([])
    }, {
      name: 'GasPrice',
      length: 32,
      allowLess: true,
      default: new Buffer([])
    }, {
      name: 'Nonce',
      length: 32,
      allowLess: true,
      default: new Buffer([])
    },{
      name: 'Sender',
      length: 20,
      allowZero: true,
      default: new Buffer([])
    },{
      name: 'Payload',
      allowLess: true,
      default: new Buffer([])
    },{
      name: 'Signature',
      length: 65,
      allowLess: true,
      allowZero: true,
      default: new Buffer([])
    }]


    ethUtil.defineProperties(this, fields, data)
    
  }

  hash () {

    let items
    items = this.raw

    // create hash
    
    return ethUtil.rlphash(items)
  }

}

class TxEvmCommon {
  constructor (data) {
    data = data || {}
    // Define Properties
    const fields = [{
      name: 'To',
      allowZero: true,
      length: 20,
      default: new Buffer([])
    }, {
      name: 'Amount',
      length: 32,
      allowLess: true,
      default: new Buffer([])
    }, {
      name: 'Load',
      allowZero: true,
      default: new Buffer([])
    }]


    ethUtil.defineProperties(this, fields, data)
    
  }

  hash () {

    let items
    items = this.raw

    // create hash
    
    return ethUtil.rlphash(items)
  }

}

class TxShareEcoWithoutsig {
  constructor (data) {
    data = data || {}
    // Define Properties
    const fields = [{
      name: 'Source',
      length: 32,
      allowZero:true,
      default: new Buffer([])
    }, {
      name: 'Amount',
      length: 32,
      allowLess: true,
      default: new Buffer([])
    }]


    ethUtil.defineProperties(this, fields, data)
    
  }

  hash () {

    let items
    items = this.raw

    // create hash
    
    return ethUtil.rlphash(items)
  }

}

class TxShareEcoWithsig {
  constructor (data) {
    data = data || {}
    // Define Properties
    const fields = [{
      name: 'Source',
      length: 32,
      allowZero:true,
      default: new Buffer([])
    }, {
      name: 'Amount',
      length: 32,
      allowLess: true,
      default: new Buffer([])
    }, {
      name: 'Signature',
      length: 64,
      allowZero:true,
      default: new Buffer([])
    }]


    ethUtil.defineProperties(this, fields, data)
    
  }

  hash () {

    let items
    items = this.raw

    // create hash
    
    return ethUtil.rlphash(items)
  }

}

class TxShareTransferWithoutsig {
  constructor (data) {
    data = data || {}
    // Define Properties
    const fields = [{
      name: 'ShareSrc',
      length: 32,
      allowZero:true,
      default: new Buffer([])
    }, {
      name: 'ShareDst',
      length: 32,
      allowZero:true,
      default: new Buffer([])
    }, {
      name: 'Amount',
      length: 32,
      allowLess: true,
      default: new Buffer([])
    }]


    ethUtil.defineProperties(this, fields, data)
    
  }

  hash () {

    let items
    items = this.raw

    // create hash
    
    return ethUtil.rlphash(items)
  }

}

class TxShareTransferWithsig {
  constructor (data) {
    data = data || {}
    // Define Properties
    const fields = [{
      name: 'ShareSrc',
      length: 32,
      allowZero:true,
      default: new Buffer([])
    }, {
      name: 'ShareDst',
      length: 32,
      allowZero:true,
      default: new Buffer([])
    }, {
      name: 'Amount',
      length: 32,
      allowLess: true,
      default: new Buffer([])
    }, {
      name: 'ShareSig',
      length: 64,
      allowLess: true,
      default: new Buffer([])
    }]


    ethUtil.defineProperties(this, fields, data)
    
  }

  hash () {

    let items
    items = this.raw

    // create hash
    
    return ethUtil.rlphash(items)
  }

}



module.exports = obj;


