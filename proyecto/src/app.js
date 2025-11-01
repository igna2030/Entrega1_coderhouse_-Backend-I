import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import handlebars from 'express-handlebars';
import viewsRouter from './routes/views.router.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import environment from '../src/Connection/mongoDBConnection.js';

const app = express();
const PORT = 8080;

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(process.cwd() + '/src/public'));
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self' http://localhost:8080;" +
        "connect-src 'self' http://localhost:8080 ws://localhost:8080;" +
        "script-src 'self' 'unsafe-inline';" +
        "style-src 'self' 'unsafe-inline'"
    );
    next();
});

app.engine('handlebars', handlebars.engine({
    defaultLayout: false
}));
app.set('views', process.cwd() + '/src/views');
app.set('view engine', 'handlebars');

app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


io.on('connection', socket => {
    console.log('Nuevo cliente conectado:', socket.id);
    
   
});


environment();
httpServer.listen(PORT, ()=> {
    console.log('servidor escuchando en el puerto: ', PORT);
})

httpServer.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`El puerto ${PORT} ya está en uso.`);
    } else {
        console.error('Error no manejado en el servidor HTTP:', error.message);
    }
});
