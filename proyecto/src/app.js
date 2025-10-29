import express from 'express';
import { engine } from 'express-handlebars';
import { Server as IOServer } from 'socket.io'; 
import http from 'http';
import path from 'path';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import ProductManager from './managers/ProductManager.js';
import viewsRouter from './routes/views.router.js';

const app = express();
const port = 8080;

const httpServer = http.createServer(app);
const io = new IOServer(httpServer);
const product_manager = new ProductManager('src/json/productos.json');

app.use((req,res,next)=>{
    req.socket = io; 
    req.productManager = product_manager;
    next()
});

app.engine('handlebars', engine({
    layout: false,
    defaultLayout: false 
}));


app.set('view engine','handlebars');
app.set('views',path.resolve('./src/views'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve('./src/public')));

app.use('/api/productos', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);


io.on('connection', async (socket)=>{
    console.log('Cliente conectado');
    const initialProducts = await product_manager.getProducts();
    socket.emit('productos', initialProducts);
    
})
httpServer.listen(port, () => {
    console.log(` Servidor Express y Socket.io escuchando en el puerto ${port}`);
});
