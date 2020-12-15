# blockchain proejct 


1.  Strat the network ( 2Org 2Peer 1channel)

/edublock/network/./generate.sh
this will genearate the starting files 


/edublock/network/./start.sh
this will start the network

/edublock/network/./teardown.sh
turn off /tear down exsiting network


2. instantiate the chaincode

/edublock/contract/edublock/cc_edublock.sh instantiate 1.0.0

this will install and instatiate the chaincode to the peers 
you can check the chaincode  in the 
/edublock/contract/edublock/edublock.go


3. link with the front end 
/edublock/prototype/

-npm install
-node enrollAdmin.js
-node registeruser.js
-node server 

you can access the prototype website via 0.0.0.8080

