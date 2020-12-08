package main

import (
	"bytes"
	"time"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)
 
 
type SmartContract struct {
}

type UserCerti struct {
	 Id   string `json:"id"`
	 Name string `json:"name"`
	 Status string `json:"status"`  // studying // graduated // failed
	 CertiName string `json:"certiname"`
	 School string `json:"school"`
	 Date string `json:"date"`

	
}



func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {
	// Extract the function and args from the transaction proposal
	function, args := APIstub.GetFunctionAndParameters()


	if function == "addUser" {
		return s.addUser(APIstub, args)
	}  else if function == "addCerti" {
		return s.addCerti(APIstub, args)
	} else if function == "readCerti" {
		return s.readCerti(APIstub, args)
	} else if function == "readTxHistory" {
		return s.readTxHistory(APIstub, args)
	} 
	return shim.Error("Not supported chaincode function.")
	

}

func (s *SmartContract) addUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 3 {
		return shim.Error("fail!")
	}
	var user = UserCerti{Id: args[0], Name: args[1], Status: "studying"}
	userAsBytes, _ := json.Marshal(user)
	APIstub.PutState(args[0], userAsBytes)

	return shim.Success(nil)
}



func (s *SmartContract) addCerti(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 5 {
	   return shim.Error("Incorrect number of arguments. Expecting 4")
	}
	// getState User
	userAsBytes, err := APIstub.GetState(args[0])
	if err != nil {
	   jsonResp := "\"Error\":\"Failed to get state for " + args[0] + "\"}"
	   return shim.Error(jsonResp)
	} else if userAsBytes == nil { // no State! error
	   jsonResp := "\"Error\":\"Pet does not exist: " + args[0] + "\"}"
	   return shim.Error(jsonResp)
	}
	// state ok
	user := UserCerti{}
	err = json.Unmarshal(userAsBytes, &user)
	if err != nil {
	   return shim.Error(err.Error())
	}
	// update  pet info structure
	//var certi = Certi{CertiName: args[2], Date: args[3], School : args[4]  }
	if args[1] == "owner" {
	   user.CertiName = args[2]
	   user.Date = args[3]
	   user.School = args[4]
	   user.Status = "graduated"
	
	} else {
	   shim.Error("not supported update type")
	}
 
	userAsBytes, err = json.Marshal(user)
 
	APIstub.PutState(args[0], userAsBytes)
 
	return shim.Success([]byte(""))
 }


func (s *SmartContract) readCerti(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	UserAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(UserAsBytes)
}	

func (s *SmartContract) readTxHistory(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) < 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	keyName := args[0]
	// 로그 남기기
	fmt.Println("readTxHistory:" + keyName)

	resultsIterator, err := APIstub.GetHistoryForKey(keyName)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing historic values for the marble
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")
		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}

		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		buffer.WriteString("\"")

		buffer.WriteString(", \"IsDelete\":")
		buffer.WriteString("\"")
		buffer.WriteString(strconv.FormatBool(response.IsDelete))
		buffer.WriteString("\"")

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	// 로그 남기기
	fmt.Println("readTxHistory returning:\n" + buffer.String() + "\n")

	return shim.Success(buffer.Bytes())
}
	

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
