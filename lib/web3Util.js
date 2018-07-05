/**
 * Created by stig on 2017/3/13.
 */
var ethUtil = require("ethereumjs-util");
var web3 = require('./web3Module.js');
var promise = require('bluebird');
var Tx = require('ethereumjs-tx');
var SolidityFunction = require('web3/lib/web3/function');
var _ = require('lodash');

var obj = {};

//获取函数数据
/**
 *
 * @param abi
 * @param funName
 * @param paramArr
 * @returns {*}
 */
obj.getPlayLoad = function (abi,funName,paramArr) {
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

obj.rechargeAccount = function (pri) {
    return new promise(function (resolve,reject) {
        var addr = "0x"+ethUtil.privateToAddress(pri).toString('hex');
        web3.eth.sendTransaction({from:web3.eth.accounts[0],to:addr,value:web3.toWei(100,'ether')},function(err,data) {
            if(!err){
                resolve(data);
            }else{
                reject(err);
            }
            // body...
        })
    });

}

obj.checkTx = function (hash) {
    return new promise(function (resolve,reject) {
        var getTransactionReceipt_UntilNotNull = function(txHash){
            web3.eth.getTransactionReceipt(hash,function(err,receipt){
                if(err){
                    reject(err);
                }
                if(receipt == null){
                    setTimeout(function(){getTransactionReceipt_UntilNotNull(hash);},500)
                }else{
                    console.log(receipt);
                    resolve(receipt)
                }
            })
        }
        getTransactionReceipt_UntilNotNull(hash)
    });
}


obj.sendTxUsePrivateKey = function (funData,pri,addr,contractAddr) {

    return new promise(function (resolve,reject) {
        console.log(pri);
        var privateKey = new Buffer(pri, 'hex');
        var address = "0x"+addr;

        //定义合约的tx数据
        const gasPrice = Number(web3.eth.gasPrice);
        const nonce = Number(web3.eth.getTransactionCount(address));

        const rawTx = {
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: "0x2000000",
            to:contractAddr,
            data:funData
        };

        /* 私钥签名 ---------start--------------*/
        const tx = new Tx(rawTx);
        tx.sign(privateKey);
        const serializedTx = tx.serialize();

        /* 发送交易 ---------start--------------*/
        web3.eth.sendRawTransaction(serializedTx.toString('hex'), function (err,data) {
            if(!err){
                console.log(data);
                resolve(data);
            }else{
                reject(err);
            }
        });
    });


}



module.exports = obj;