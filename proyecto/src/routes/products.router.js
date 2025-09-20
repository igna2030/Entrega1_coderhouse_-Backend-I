import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const productsRouter = Router();
const manager = new ProductManager('src/json/productos.json');


productsRouter.get("/", async (req, res) => {
    try {
        let products = await manager.getProducts();
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ error: "Error inesperado." });
    }
});

productsRouter.get("/:pid", async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const product = await manager.getProductById(productId);
        res.status(200).json({ product });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});


productsRouter.post("/", async (req, res) => {
  try {
    const productData = req.body;

    if (!productData.title || !productData.description || !productData.price
      || !productData.thumbnail || !productData.code || !productData.stock
    ) {
      return res.status(400).json({ error: "Deben estar todos los campos" });
    }

    const nuevo_producto = await manager.addProduct(productData);
    res.status(201).json({ message: "Se agrego el producto exitosamente", product: nuevo_producto, });
  }
  catch (error) {
    console.error("Error al añadir el producto:", error.message);

    if (error.message.includes("Un producto con codigo")) {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: "Error inesperado." });
  }
});

productsRouter.delete("/:pid", async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    await manager.delete_product(productId);
    res.status(200).json("Se elimino el producto");
  } catch (error) {
    res.status(500).json({ error: "Error inesperado." });
  }
});

productsRouter.put("/:pid", async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const productData = req.body;
    const updatedProduct = await manager.update_product({ id: productId, ...productData });
    res.status(200).json({
      message: `Se actualizó el producto con el id ${productId} exitosamente`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error al actualizar el producto:", error.message);
    if (error.message.includes("No existe un producto")) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes("Ya existe un producto con el codigo")) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: "Error inesperado." });
  }
});

 export default productsRouter;