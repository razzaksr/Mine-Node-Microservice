const express = require('express')
const bodyParser = require('body-parser')
const Consul = require("consul");
const axios = require("axios");

const app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
const consul = new Consul();

let myCustomers = [
    {
        "customerName":"Razak Mohamed S",
        "username":"razak",
        "contact":765456765674,
        "password":"mohamed"
    },
    {
        "customerName":"Rasheedha R",
        "username":"rasheedha",
        "contact":987678676445,
        "password":"mohamed"
    }
]

app.get('/',async(req,res)=>{
    try {
        // Get Account service address from Consul
        const services = await consul.catalog.service.nodes("account-service");
        if (services.length === 0) throw new Error("Account service not available");

        const accountService = services[0];

        // way to add accounts with each customer>> its working well
        myCustomers.map(async(each)=>{
            const accountUrl = `http://${accountService.Address}:${accountService.ServicePort}/customer/${each.username}`;
            const response = await axios.get(accountUrl);
            each.accounts = response.data
        })

        // another way to add accounts with each customer>> its working well
        // const accountUrl = `http://${accountService.Address}:${accountService.ServicePort}/`;
        // const response = await axios.get(accountUrl);
        // myCustomers.map((each)=>{
        //     each['accounts']=new Array()
        //     response.data.map((acc)=>{
        //         if(acc.customer==each.username){
        //             each.accounts.push(acc)
        //         }
        //     })
        // })



    } catch (error) {
        return res.status(500).send({ message: "Error fetching accounts" });
    }    
    res.json(myCustomers)
})

app.get('/:user',async(req,res)=>{
    res.json(myCustomers.filter((obj)=>{
        return obj.username==req.params.user
    }))
})

// service registry process's
// register service in consul
const serviceId = "customer-service";
consul.agent.service.register(
  {
    id: serviceId,
    name: "customer-service",
    address: "localhost",
    port: 8081,
  },
  (err) => {
    if (err) throw err;
    console.log("Customer service registered with Consul");
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

app.listen(8081,async(err)=>{
    console.log("customer service running @ 8081!!!!!!!!!")
})