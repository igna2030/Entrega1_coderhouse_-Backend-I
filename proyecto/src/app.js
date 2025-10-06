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

app.use((req,res,next)=>{
    req.io = io
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

// Asignación de routers
app.use('/api/productos', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

const productManager = new ProductManager('./src/json/productos.json')

io.on('connection', async (socket)=>{
    console.log('Cliente conectado');
    const initialProducts =  await productManager.getProducts();
    socket.emit('productos', initialProducts);
    
    socket.on('new-product', async (productData) => { 
        try {
            await productManager.addProduct(productData);
            const updatedProducts = await productManager.getProducts();
            io.emit('productsUpdate', updatedProducts); 
        } catch (error) {
            console.log("Error con el producto",error.message);
            socket.emit('product-error', {message: error.message}); 
        }
    });

    socket.on('deleteProduct', async (id) => { 
        try {
            await productManager.delete_product(id);
            const updatedProducts = await productManager.getProducts();
            io.emit('productsUpdate', updatedProducts); 
        } catch (error) {
            console.log("Error al eliminar el producto",error.message);
            socket.emit('product-error', {message: error.message}); 
        }
    });
})
httpServer.listen(port, () => {
    console.log(` Servidor Express y Socket.io escuchando en el puerto ${port}`);
});