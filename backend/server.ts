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
  {
    id: 9,
    name: "Dried Dates",
    price: 11.5,
    boughtCount: 63,
    image:
      "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 10,
    name: "Cashews",
    price: 19.25,
    boughtCount: 59,
    image:
      "https://images.unsplash.com/photo-1536591375667-3d0b5f6e2d7d?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 11,
    name: "Organic Oats",
    price: 8.75,
    boughtCount: 55,
    image:
      "https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 12,
    name: "Maple Syrup",
    price: 15.99,
    boughtCount: 51,
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 13,
    name: "Peanut Butter",
    price: 7.5,
    boughtCount: 47,
    image:
      "https://images.unsplash.com/photo-1599599810694-57a6d0c5f8c4?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 14,
    name: "Strawberry Jam",
    price: 6.99,
    boughtCount: 43,
    image:
      "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 15,
    name: "Sea Salt",
    price: 4.5,
    boughtCount: 39,
    image:
      "https://images.unsplash.com/photo-1518110925495-5fe2c0c4b1e1?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 16,
    name: "Coconut Oil",
    price: 13.25,
    boughtCount: 35,
    image:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 17,
    name: "Granola",
    price: 10.99,
    boughtCount: 31,
    image:
      "https://images.unsplash.com/photo-1517093728432-9e2c5c3c5c4d?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 18,
    name: "Dried Figs",
    price: 12.75,
    boughtCount: 27,
    image:
      "https://images.unsplash.com/photo-1601379760883-1bb497c558d7?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 19,
    name: "Dark Roast Coffee",
    price: 22.5,
    boughtCount: 24,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 20,
    name: "Mixed Nuts",
    price: 20.0,
    boughtCount: 19,
    image:
      "https://images.unsplash.com/photo-1599599810694-57a6d0c5f8c4?auto=format&fit=crop&w=500&q=80",
  },
];


app.use(cors({
  origin: "http://localhost:3000"
}));

app.get("/api/products", (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const startIndex = (page - 1) * limit;

  const paginatedProducts = products.slice(
    startIndex,
    startIndex + limit
  );

  res.json({
    products: paginatedProducts,
    totalProducts: products.length,
    totalPages: Math.ceil(products.length / limit),
    currentPage: page,
  });
});

app.get("/api/products/most-bought", (req, res) => {
  res.json(
    [...products]
      .sort((a, b) => b.boughtCount - a.boughtCount)
      .slice(0, 8)
  );
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});