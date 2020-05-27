import React, { useState, useEffect } from 'react';
import logo from './blockchain.svg';
import './App.css';
import { useToasts } from 'react-toast-notifications'

import Web3 from "web3"
import abi from "./abis/contract"

var provider = new Web3.providers.WebsocketProvider("wss://x5engine.blockchain.azure.com:3300/E-FlUTqcGM65Si6SaBQwe6sg");
var web3 = new Web3(provider);

var myContract = new web3.eth.Contract(abi, '0x89da55DFda82E2874E5d7054D772FFFCF488C38B');

function App() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");
  const { addToast } = useToasts()

  useEffect(() => {
    subscribe2Events()
  }, []);

  

  const handleChange =  (e) => {
    setText(e.target.value)
  }

  const timeConverter = (UNIX_timestamp) => {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
  }

  const subscribe2Events =  () => {
    var subscription = web3.eth.subscribe('logs', {
      address: '0x89da55DFda82E2874E5d7054D772FFFCF488C38B',
      // topics: ['0x8fbf346523616c015d34c71713ea41bb98008282341b0f191f578d20d7ed26e2']
    }, function (error, result) {
      // if (!error)
        console.log("subscription",error, result);
        // onSubmit(result)
    });
    console.log("myContract", myContract);
    onSubmit("Connected to Contract 0x89da55DFda82E2874E5d7054D772FFFCF488C38B")
    myContract.events.allEvents({ fromBlock: 'latest' }, function (error, event) { console.log("events logs",error,event); })
      .on("connected", (subscriptionId) => {
        console.log("connected subscriptionId:",subscriptionId);
        
      })
      .on('data', async (event) => {
        console.log("data",event); // same results as the optional callback above
        onSubmit("Event " + event.event + " Received, Data: " + JSON.stringify(event.returnValues), false, false )
      })
      .on('changed', (event) => {
        // remove event from local database
        console.log("changed", event)
        // onSubmit("Connected to Contract " + subscriptionId)
      })
      .on('error', (error, receipt) => { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        console.log(error, receipt)
        // onSubmit("Connected to Contract " + subscriptionId)
      });

  }

  const getLastMessage = async () => {
    const result = await myContract.methods.getLastMsg().call()
    onSubmit("Last message was : "+result)
  }

  const getCount = async value => {
    const result =  await myContract.methods.getCount().call()
    onSubmit("Messages Count = "+result)
  }

  const onSubmit = async (value, error, autoDismiss = true) => {
    if (error) {
      addToast(error, {
        appearance: 'error',
        autoDismiss: true,
      })
    } else {
      addToast(value, {
        appearance: 'success',
        autoDismiss
     })
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h6>
          Show Events from Contract: 0x89da55DFda82E2874E5d7054D772FFFCF488C38B
        </h6>
        <p>
          dApp that showcase reactions to events surfaced by state changes in blockchain by a Smart Contract
        </p>
        <button onClick={() => getLastMessage()} type="button">Get Last Message</button>

        <button onClick={() => getCount()} type="button">Get Messages Count</button>
        <a
          className="App-link"
          onClick={() => onSubmit("Azure Ethereum Blockchain")}
        >
          Azure Ethereum Blockchain
        </a>
      </header>
    </div>
  );
}

export default App;
