const express = require('express')
const bodyParser = require('body-parser')
const Consul = require("consul");

const app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
const consul = new Consul();

let myAccounts = [
    {
        "accountNumber":2345434567654,
        "accountBalance":566.7,
        "customer":"razak"
    },
    {
        "accountNumber":6545678765678,
        "accountBalance":911.667,
        "customer":"rasheedha"
    },
    {
        "accountNumber":98765434567654,
        "accountBalance":1345.7,
        "customer":"razak"
    }
]

// read
app.get('/',async(req,res)=>{
    return res.json(myAccounts)
})

app.post('/',async(req,res)=>{
    const{accountNumber,accountBalance,customer}=req.body
    var account = {
        "accountNumber":accountNumber,
        "accountBalance":accountBalance,
        "customer":customer
    };
    myAccounts.push(account)
    return res.json({"message":"Account added"})
})

app.put('/',async(req,res)=>{
    const{accountNumber,accountBalance,customer}=req.body
    var account = {
        "accountNumber":accountNumber,
        "accountBalance":accountBalance,
        "customer":customer
    };
    //myAccounts.push(account)
    //return res.json({"message":"Account added"})
    myAccounts = myAccounts.map((each,index)=>{
        if(each.accountNumber==account.accountNumber){
            myAccounts[index]=account
        }
    })
    return res.json({"message":"Account updated"})
})

app.delete('/:number',async(req,res)=>{
    myAccounts = myAccounts.filter((each,index)=>{
        return each.accountNumber!=req.params
    })
    return res.json({"message":"Account deleted"})
})

app.get('/customer/:user',async(req,res)=>{
    res.json(myAccounts.filter((obj)=>{
        return obj.customer==req.params.user
    }))
})


// service registry process's
// register service in consul
const serviceId = "account-service";
consul.agent.service.register(
  {
    id: serviceId,
    name: "account-service",
    address: "localhost",
    port: 8082,
  },
  (err) => {
    if (err) throw err;
    console.log("Account service registered with Consul");
  }
);
// Deregister the service on exit
process.on("SIGINT", () => {
consul.agent.service.deregister(serviceId, (err) => {
        if (err) throw err;
        console.log("Customer service deregistered");
        process.exit();
    });
});

app.listen(8082,async(err)=>{
    console.log("account service running @ 8082!!!!!!!!!")
})