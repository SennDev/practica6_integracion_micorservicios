const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3003;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/contacto_db';

app.use(cors());
app.use(express.json());

const messageSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    correo: { type: String, required: true, trim: true, lowercase: true },
    mensaje: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

app.get('/health', (_req, res) => {
  res.json({ service: 'contacto-service', status: 'ok' });
});

app.get('/contacto', async (_req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

app.post('/contacto', async (req, res) => {
  const { nombre, correo, email, mensaje } = req.body;

  if (!nombre || !(correo || email) || !mensaje) {
    return res.status(400).json({ message: 'Nombre, correo y mensaje son obligatorios' });
  }

  const savedMessage = await Message.create({
    nombre,
    correo: correo || email,
    mensaje
  });

  res.status(201).json(savedMessage);
});

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => console.log(`contacto-service en puerto ${port}`));
  })
  .catch((error) => {
    console.error('Error conectando contacto-service a MongoDB', error);
    process.exit(1);
  });
