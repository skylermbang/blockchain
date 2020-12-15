#!/bin/bash

if [ $# -ne 2 ]; then
   echo "Arguments are missing. ex) ./cc_jjincerti.sh instantiate 1.0.0"
   exit 1
fi

instruction=$1
version=$2

set -ev

#chaincode install
docker exec cli peer chaincode install -n jjincerti -v $version -p github.com/jjincerti
#chaincode instatiate
docker exec cli peer chaincode $instruction -n jjincerti -v $version -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
sleep 3
#chaincode invoke user1
docker exec cli peer chaincode invoke -n jjincerti -C mychannel -c '{"Args":["addUser","K001", "Skyler Minsu Bang ", "Studying"]}'
sleep 3
#chaincode query user1
docker exec cli peer chaincode invoke -n jjincerti -C mychannel -c '{"Args":["addCerti","K001","owner", "Graduate certificate","JULY 2019","University of Liverpool"]}'

sleep 3

#chaincode invoke add rating
docker exec cli peer chaincode query -n jjincerti -C mychannel -c '{"Args":["readCerti","K001"]}'
sleep 3

#chaincode query user1
docker exec cli peer chaincode query -n jjincerti -C mychannel -c '{"Args":["readTxHistory","K001"]}'

echo '-------------------------------------END-------------------------------------'
