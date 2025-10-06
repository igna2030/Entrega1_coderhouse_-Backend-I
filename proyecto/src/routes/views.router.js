import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const views_router = Router();
const product_manager = new ProductManager('src/json/productos.json');

views_router.get("/home",async (req,res)=>{
    try {
        var productos = await product_manager.getProducts();
        res.render("home",{productos:productos})
        
    } catch (error) {
        res.status(500).json({error:"Error inesperado."});
        
    }
});


views_router.get('/', (req, res) => {
    res.redirect('/home');
});

views_router.get("/realtimeproducts",async (req,res)=>{
    try {
        var productos = await product_manager.getProducts();
        res.render("realTimeProducts",{productos:productos})
        
    } catch (error) {
        res.status(500).json({error:"Error inesperado."});
        
    }
});

export default views_router;