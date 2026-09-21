import express from "express";
import cors from "cors";

const app = express();

const products = [
  {
    id: 1,
    name: "Premium Rice",
    price: 12.5,
    boughtCount: 142,
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 2,
    name: "Pistachios",
    price: 18,
    boughtCount: 118,
    image:
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 3,
    name: "Extra Virgin Olive Oil",
    price: 24.5,
    boughtCount: 105,
    image:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 4,
    name: "Pure Honey",
    price: 16.75,
    boughtCount: 96,
    image:
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 5,
    name: "Fresh Coffee Beans",
    price: 21,
    boughtCount: 89,
    image:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 6,
    name: "Organic Green Tea",
    price: 14.25,
    boughtCount: 81,
    image:
      "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 7,
    name: "Almonds",
    price: 17.5,
    boughtCount: 74,
    image:
      "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 8,
    name: "Dark Chocolate",
    price: 9.99,
    boughtCount: 68,
    image:
      "https://images.unsplash.com/photo-1548907040-4d42c42e9d5f?auto=format&fit=crop&w=500&q=80",
  },
];
app.use(cors({
  origin: "http://localhost:3000"
}));

app.get("/api/products/most-bought", (req, res) => {
  res.json(products);
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});