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

// create mate

app.post('/id', async(req, res)=>{
    // 요청문서에서 변수 꺼내기
    const pid = req.body.id;
    const pname = req.body.name;
    console.log("add id: " + pid);
    console.log("add name: " + pname);
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
    result = await contract.submitTransaction('addUser', pid, pname);

    // 클라이언트에 응답
    const myobj = {result: "success"}
    res.status(200).json(myobj) 
})

// add certification

app.post('/certi', async(req, res)=>{
    const pid = req.body.id;
    const certiname = req.body.certiname;
    const school = req.body.school;
    const date = req.body.date;
    const owner = req.body.owner;


    console.log("add menu id: " + pid);
    console.log("add certification type : " + certiname);
    console.log("add school : " + school);
    console.log("add date : " + date);
    console.log("add owner : " + owner);

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
    result = await contract.submitTransaction('addCerti', pid, owner, certiname,date,school);
    


    const myobj = {result: "success"}
    res.status(200).json(myobj) 
})

app.get('/project', async (req,res)=>{
    // 변수 가져오는 부분
    const pid = req.query.projectname;

    console.log("pid: " + pid);

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
    const contract = network.getContract('mybiolab');
    const result = await contract.evaluateTransaction('readProject', pid);

    // 조회 실패 에러처리~ 임선영님이 해보세요~

    // 클라이언트에게 전송
    const myobj = JSON.parse(result)
    res.status(200).json(myobj)


});

// server start
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);