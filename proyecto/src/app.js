import express from 'express';
import { engine } from 'express-handlebars';
import { Server as IOServer } from 'socket.io'; 
import http from 'http';
import path from 'path';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const app = express();
const port = 8080;

const httpServer = http.createServer(app);
const io = new IOServer(httpServer);

app.use((req,res,next)=>{
    req.io = io
    next()
});

app.engine('handlebars',engine());
app.set('view engine','handlebars');
app.set('views',path.resolve('./src/views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Asignación de routers
app.use('/api/productos', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
