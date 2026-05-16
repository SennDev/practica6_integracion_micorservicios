const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3002;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/carrito_db';
const defaultCartId = process.env.DEFAULT_CART_ID || 'principal';

app.use(cors());
app.use(express.json());

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    cartId: { type: String, required: true, unique: true },
    products: { type: [cartItemSchema], default: [] }
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);

function mapCart(cart) {
  const products = cart.products.map((item) => ({
    id: item.productId,
    productId: item.productId,
    name: item.name,
    price: item.price,
    image: item.image,
    quantity: item.quantity
  }));
  const subtotal = products.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    idCarrito: cart.cartId,
    products,
    productos: products,
    cantidades: products.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    subtotal
  };
}

async function getOrCreateCart(cartId = defaultCartId) {
  let cart = await Cart.findOne({ cartId });
  if (!cart) {
    cart = await Cart.create({ cartId, products: [] });
  }
  return cart;
}

app.get('/health', (_req, res) => {
  res.json({ service: 'carrito-service', status: 'ok' });
});

app.get('/carrito', async (req, res) => {
  const cart = await getOrCreateCart(req.query.cartId || defaultCartId);
  res.json(mapCart(cart));
});

app.get('/carrito/subtotal', async (req, res) => {
  const cart = await getOrCreateCart(req.query.cartId || defaultCartId);
  res.json({ subtotal: mapCart(cart).subtotal });
});

app.post('/carrito/productos', async (req, res) => {
  const { cartId = defaultCartId, productId, id, name, nombre, price, precio, image, imagen, quantity = 1 } = req.body;
  const normalizedProductId = String(productId || id || '');

  if (!normalizedProductId || !(name || nombre) || !(image || imagen) || Number(price ?? precio) < 0) {
    return res.status(400).json({ message: 'Producto invalido para agregar al carrito' });
  }

  const cart = await getOrCreateCart(cartId);
  const existingProduct = cart.products.find((item) => item.productId === normalizedProductId);

  if (existingProduct) {
    existingProduct.quantity += Number(quantity) || 1;
  } else {
    cart.products.push({
      productId: normalizedProductId,
      name: name || nombre,
      price: Number(price ?? precio),
      image: image || imagen,
      quantity: Number(quantity) || 1
    });
  }

  await cart.save();
  res.status(201).json(mapCart(cart));
});

app.delete('/carrito/productos/:productId', async (req, res) => {
  const cart = await getOrCreateCart(req.query.cartId || defaultCartId);
  cart.products = cart.products.filter((item) => item.productId !== req.params.productId);
  await cart.save();
  res.json(mapCart(cart));
});

app.delete('/carrito', async (req, res) => {
  const cart = await getOrCreateCart(req.query.cartId || defaultCartId);
  cart.products = [];
  await cart.save();
  res.json(mapCart(cart));
});

mongoose
  .connect(mongoUri)
  .then(async () => {
    await getOrCreateCart();
    app.listen(port, () => console.log(`carrito-service en puerto ${port}`));
  })
  .catch((error) => {
    console.error('Error conectando carrito-service a MongoDB', error);
    process.exit(1);
  });
