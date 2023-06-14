const express = require("express");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 8080;

let users = [
  { id: 1, email: "elad", password: "123", role: "admin" },
  { id: 2, email: "anyBody", password: "123", role: "gest" },
];

let products = [
  { id: 1, pName: "iphone", price: 2000 },
  { id: 2, pName: "galaxy", price: 3000 },
];

let id = 3;

app.get("/", (req, res) => {
  res.send("<h1>elad<h1>");
});

//products API`s

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).send("there is no id");
    return;
  }
  const product = products.find((p) => p.id == id);
  if (!product) {
    res.status(404).send("data not found");
    return;
  }
  res.json(product);
});

app.post("/api/products", jsonParser, (req, res) => {
  const { pName, price } = req.body;
  if (!pName || !price) {
    res.status(400).send("there is missing data");
    return;
  }
  let product = { id: id++, pName: pName, price: price };
  products.push(product);
  res.json(product);
});

app.delete("/api/products/:id", (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).send("there is no id");
    return;
  }
  try {
    products = products.filter((p) => p.id != id);
    res.json(products);
  } catch (error) {}
});

app.put("/api/products/:id", jsonParser, (req, res) => {
  const { id, pName, price } = req.body;
  const pId = req.params.id;
  if (!pId) {
    res.status(400).send("there is no id");
    return;
  }
  if (id != pId) {
    res.status(400).send("param id and body id need to be match");
    return;
  }
  if (!price || !pName) {
    res.status(400).send("price or product name is missing from body");
    return;
  }
  let product = products.find((p) => p.id == id);
  if (!product) {
    res.status(404).send(`customer with id:${id} not found`);
    return;
  }
  product.price = price;
  product.pName = pName;
  res.json(product);
});

//users API`s

app.get("/api/users", auth, authRole("admin"), (req, res) => {
  res.json(users);
});

//login and auth API`s

app.post("/api/login/", jsonParser, (req, res) => {
  const { email, password } = req.body;
  let user = users.find((u) => u.email === email);
  if (!user) {
    res.status(400).send("email or password are missing");
    return;
  }

  if (user.password != password) {
    res.status(404).send("Email is incorrect");
    return;
  }

  let token = jwt.sign({ email: user.email, role: user.role }, "tatatatatata");
  res.json({ token });
});

function auth(req, res, next) {
  let authHeader = req.header("authorization");
  if (authHeader && authHeader.replace("Bearer", "")) {
    let token = authHeader.replace("Bearer ", "");
    try {
      let decoded = jwt.verify(token, "tatatatatata");
      req.user = decoded;
      next();
      return;
    } catch (err) {}
  }
  res.status(401).send("you need to login");
}
function authRole(role) {
  return function (req, res, next) {
    if (req.user.role != role) {
      res.status(403).send("excess is denied");
    } else {
      next();
    }
  };
}

app.listen(PORT, () => {
  console.log(`listening to port:  ${PORT}`);
});
