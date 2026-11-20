const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

let products = [];
let nextId = 1;

function isMissingValue(value) {
  return value === undefined || value === null || value === "";
}

function validateProduct(body) {
  if (
    isMissingValue(body.name) ||
    isMissingValue(body.price) ||
    isMissingValue(body.category)
  ) {
    return "name, price and category are required";
  }

  if (typeof body.name !== "string" || typeof body.category !== "string") {
    return "name and category must be text";
  }

  if (typeof body.price !== "number" || Number.isNaN(body.price)) {
    return "price must be a number";
  }

  return null;
}

function findProductIndex(id) {
  return products.findIndex((product) => product.id === id);
}

app.post("/api/products", (req, res) => {
  const validationError = validateProduct(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const duplicate = products.find(
    (product) => product.name.toLowerCase() === req.body.name.toLowerCase()
  );
  if (duplicate) {
    return res.status(409).json({ message: "A product with this name already exists" });
  }

  const product = {
    id: nextId++,
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
  };
  products.push(product);

  return res.status(201).json(product);
});

app.get("/api/products", (req, res) => {
  if (req.query.category !== undefined) {
    const category = req.query.category;
    const filtered = products.filter(
      (product) =>
        product.category.toLowerCase() === category.toString().toLowerCase()
    );
    return res.status(200).json(filtered);
  }

  return res.status(200).json(products);
});

app.get("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ message: "Product not found" });
  }

  const product = products.find((item) => item.id === id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(200).json(product);
});

app.put("/api/products/:id", (req, res) => {
  const validationError = validateProduct(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ message: "Product not found" });
  }

  const index = findProductIndex(id);
  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const duplicate = products.find(
    (product, productIndex) =>
      productIndex !== index &&
      product.name.toLowerCase() === req.body.name.toLowerCase()
  );
  if (duplicate) {
    return res.status(409).json({ message: "A product with this name already exists" });
  }

  const updatedProduct = {
    id,
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
  };
  products[index] = updatedProduct;

  return res.status(200).json(updatedProduct);
});

app.delete("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ message: "Product not found" });
  }

  const index = findProductIndex(id);
  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const deletedProduct = products[index];
  products.splice(index, 1);

  return res.status(200).json(deletedProduct);
});

app.listen(PORT, () => {
  console.log(`Products API running at http://localhost:${PORT}`);
});
