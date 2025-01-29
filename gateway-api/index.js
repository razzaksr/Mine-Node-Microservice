const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const Consul = require("consul");

const app = express();
const consul = new Consul();

// Helper function to get service details from Consul
async function getService(serviceName) {
  try {
    const services = await consul.catalog.service.nodes(serviceName);
    if (services.length === 0) throw new Error(`Service ${serviceName} not found`);
    const service = services[0];
    return `http://${service.Address}:${service.ServicePort}`;
  } catch (error) {
    throw new Error(`Error fetching service details for ${serviceName}: ${error.message}`);
  }
}

// API Gateway routes
app.use("/customers", async (req, res, next) => {
  try {
    const customerServiceUrl = await getService("customer-service");
    createProxyMiddleware({ target: customerServiceUrl, changeOrigin: true })(req, res, next);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.use("/accounts", async (req, res, next) => {
  try {
    const accountServiceUrl = await getService("account-service");
    createProxyMiddleware({ target: accountServiceUrl, changeOrigin: true })(req, res, next);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Start the API Gateway
app.listen(8083, () => {
  console.log("API Gateway running on port 8083");
});
