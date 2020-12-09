// ExpressJS Setup
const express = require('express');
const app = express();
var bodyParser = require('body-parser');

// Hyperledger Bridge
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', 'network' ,'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// use static file
app.use(express.static(path.join(__dirname, 'views')));

// configure app to use body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// main page routing
app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html');
})

async function cc_call(fn_name, args){
    
    // user 1 인증서 가져오기
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);

    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    // 게이트웨이 접속 , connection.json -> ccp, user1 인증서
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    // 채널 접근
    const network = await gateway.getNetwork('mychannel');
    // 체인코드 접근
    const contract = network.getContract('teamate');

    var result;
    
    if(fn_name == 'addUser')
        result = await contract.submitTransaction('addUser', args);
    else if( fn_name == 'addRating')
    {
        e=args[0];
        p=args[1];
        s=args[2];
        result = await contract.submitTransaction('addRating', e, p, s);
    }
    else if(fn_name == 'readRating')
        result = await contract.evaluateTransaction('readRating', args);
    else
        result = 'not supported function'

    return result;
}

// create mate
app.post('/user', async(req, res)=>{
    // 요청문서에서 변수 꺼내기
    const uid = req.body.uid;
    const uname = req.body.uname;

    console.log("add mate email: " + uid);

    // 체인코드 호출 -> 결과받기
        // user 1 인증서 가져오기
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);

    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    // 게이트웨이 접속 , connection.json -> ccp, user1 인증서
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    // 채널 접근
    const network = await gateway.getNetwork('mychannel');
    // 체인코드 접근
    const contract = network.getContract('edublock');
    
    var result;
    result = await contract.submitTransaction('addUser', uid, uname);

    // 클라이언트에 응답
    const myobj = {result: "success"};

    res.status(200).json(myobj) 
})

// add score
app.post('/score', async(req, res)=>{
    const email = req.body.email;
    const prj = req.body.project;
    const sc = req.body.score;
    console.log("add project email: " + email);
    console.log("add project name: " + prj);
    console.log("add project score: " + sc);

    var args=[email, prj, sc];
    result = cc_call('addRating', args)

    const myobj = {result: "success"}
    res.status(200).json(myobj) 
})

// find mate
// app.get('/mate', async (req,res)=>{
// const email = req.query.email;

app.post('/mate/:email', async (req,res)=>{
    // 변수 가져오는 부분
    const email = req.body.email;
    console.log("email: " + req.body.email);

    // 인증서 user1 가져오는부분
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    // 게이트웨이 연결 - 채널 - 체인코드 - 체인코드 호출 - 결과값 받기
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('teamate');
    const result = await contract.evaluateTransaction('readRating', email);

    // 클라이언트에게 전송
    const myobj = JSON.parse(result)
    res.status(200).json(myobj)
    // res.status(200).json(result)

});

// server start
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);