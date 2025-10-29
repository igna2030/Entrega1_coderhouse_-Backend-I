import { Router } from 'express';

const productsRouter = Router();


productsRouter.get("/", async (req, res) => {
    try {
        const manager = req.productManager; 
        let products = await manager.getProducts();
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ error: "Error inesperado al listar productos." });
    }
});

productsRouter.get("/:pid", async (req, res) => {
    try {
        const manager = req.productManager; 
        const productId = parseInt(req.params.pid);
        const product = await manager.getProductById(productId);
        res.status(200).json({ product });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});


productsRouter.post("/", async (req, res) => {
    try {
        const manager = req.productManager;
        const io = req.socket; 
        const productData = req.body;

        if (!productData.title || !productData.description || !productData.price
            || !productData.thumbnail || !productData.code || !productData.stock
        ) {
            return res.status(400).json({ error: "Deben estar todos los campos del producto (title, description, price, thumbnail, code, stock)." });
        }
        
        if (typeof productData.price !== 'number' || typeof productData.stock !== 'number') {
             return res.status(400).json({ error: "Price y Stock deben ser números." });
        }

        const nuevo_producto = await manager.addProduct(productData);
        
        const products = await manager.getProducts(); 
        io.emit('productsUpdate', products);
     
        
        res.status(201).json({ message: "Se agrego el producto exitosamente", product: nuevo_producto, });
    }
    catch (error) {
        console.error("Error al añadir el producto:", error.message);

        if (error.message.includes("Ya existe un producto con este código")) {
            return res.status(409).json({ error: error.message });
        }

        res.status(500).json({ error: "Error inesperado." });
    }
});

productsRouter.delete("/:pid", async (req, res) => {
    try {
        const manager = req.productManager;
        const io = req.socket; 
        const productId = parseInt(req.params.pid);
        
        const updatedProducts = await manager.delete_product(productId); 

        io.emit('productsUpdate', updatedProducts); 
        
        res.status(200).json({ message: `Se eliminó el producto con el ID ${productId}` });
    } catch (error) {
        console.error("Error al eliminar el producto:", error.message);
        if (error.message.includes("No existe un producto")) {
             return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: "Error inesperado al eliminar el producto." });
    }
});

productsRouter.put("/:pid", async (req, res) => {
    try {
        const manager = req.productManager;
        const io = req.socket; 
        const productId = parseInt(req.params.pid);
        const productData = req.body;
        
        if (productData.code && typeof productData.code !== 'string') {
            return res.status(400).json({ error: "El campo 'code' debe ser una cadena de texto." });
        }
        
        const updatedProduct = await manager.update_product({ id: productId, ...productData });

        const products = await manager.getProducts(); 
        io.emit('productsUpdate', products); 
        
        res.status(200).json({
            message: `Se actualizó el producto con el id ${productId} exitosamente`,
            product: updatedProduct,
        });
    } catch (error) {
        console.error("Error al actualizar el producto:", error.message);
        if (error.message.includes("No existe un producto")) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("Ya existe un producto con el código")) {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: "Error inesperado al actualizar el producto." });
    }
});

export default productsRouter;
