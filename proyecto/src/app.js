import express from 'express';
import cors from 'cors';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Asignación de routers
app.use('/api/productos', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
