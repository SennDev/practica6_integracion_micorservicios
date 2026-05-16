const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3001;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/productos_db';

app.use(cors());
app.use(express.json());

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

const initialProducts = [
  {
    name: 'Laptop Pro 15"',
    price: 1299.99,
    image: 'https://images.unsplash.com/photo-1642943038577-eb4a59549766'
  },
  {
    name: 'Auriculares Wireless',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
  },
  {
    name: 'Smartphone X Pro',
    price: 599.99,
    image: 'https://images.unsplash.com/photo-1741061961703-0739f3454314?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9iaWxlJTIwcGhvbmV8ZW58MXx8fHwxNzcxODY0Mzg0fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: 'Reloj Inteligente',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1719744755507-a4c856c57cf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHdhdGNoJTIwd2VhcmFibGV8ZW58MXx8fHwxNzcxODEwMjM5fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: 'Tablet S10',
    price: 499.99,
    image: 'https://images.unsplash.com/photo-1769603795371-ad63bd85d524?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWJsZXQlMjBkZXZpY2V8ZW58MXx8fHwxNzcxNzgwMTUzfDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: 'Consola Gaming Pro',
    price: 1149.99,
    image: 'https://images.unsplash.com/photo-1604846887565-640d2f52d564?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBjb25zb2xlfGVufDF8fHx8MTc3MTg1NzcwNHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: 'Camara Digital Pro',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1579535984712-92fffbbaa266?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lcmElMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3NzE4MjY1OTR8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: 'Teclado Mecanico RGB',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1705488387173-b3e4890259ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZXlib2FyZCUyMG1lY2hhbmljYWx8ZW58MXx8fHwxNzcxODgyNzU0fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: 'Mouse Gaming Pro',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMG1vdXNlfGVufDF8fHx8MTc3MTg4Mjc1NHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: 'Monitor 4K Ultra HD',
    price: 889.99,
    image: 'https://images.unsplash.com/photo-1647657411140-be890523470a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb25pdG9yJTIwc2NyZWVuJTIwZGlzcGxheXxlbnwxfHx8fDE3NzE4NjUyNDB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  }
];

async function seedProducts() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(initialProducts);
  }
}

app.get('/health', (_req, res) => {
  res.json({ service: 'producto-service', status: 'ok' });
});

app.get('/productos', async (_req, res) => {
  const products = await Product.find().sort({ createdAt: 1 });
  res.json(products);
});

app.get('/productos/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }
  res.json(product);
});

app.post('/productos', async (req, res) => {
  const { name, nombre, price, precio, image, imagen } = req.body;
  const product = await Product.create({
    name: name || nombre,
    price: Number(price ?? precio),
    image: image || imagen
  });
  res.status(201).json(product);
});

mongoose
  .connect(mongoUri)
  .then(async () => {
    await seedProducts();
    app.listen(port, () => console.log(`producto-service en puerto ${port}`));
  })
  .catch((error) => {
    console.error('Error conectando producto-service a MongoDB', error);
    process.exit(1);
  });
