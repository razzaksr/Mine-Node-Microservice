require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Consul = require("consul");

const app = express();
app.use(express.json());
const consul = new Consul()

const users = [
  { id: 1, username: "razak", password: bcrypt.hashSync("mohamed@123", 8) },
  { id: 2, username: "rasheedha", password: bcrypt.hashSync("mohamed@123", 8) },
];

// register service in consul
const serviceId = "auth-service";
consul.agent.service.register(
  {
    id: serviceId,
    name: "auth-service",
    address: "localhost",
    port: 8084,
  },
  (err) => {
    if (err) throw err;
    console.log("Authorize service registered with Consul");
  }
);
// Deregister the service on exit
process.on("SIGINT", () => {
consul.agent.service.deregister(serviceId, (err) => {
        if (err) throw err;
        console.log("Authorize service deregistered");
        process.exit();
    });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
});

app.listen(8084, () => {
  console.log("Auth service running on port 8084");
});
