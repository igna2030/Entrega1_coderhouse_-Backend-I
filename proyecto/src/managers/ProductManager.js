import fs from "fs/promises";

export default class ProductManager {
    constructor(path) {
        this.path = path;
    }

    async #readProducts() {
        try {
            const data = await fs.readFile(this.path, "utf-8");
            return JSON.parse(data);
        } catch (error) {
            console.error("Error leyendo el archivo o encontrandolo", error);
            return [];
        }
    }

    async #writeProducts(products) {
        try {
            await fs.writeFile(this.path, JSON.stringify(products, null, 2), "utf-8");
        } catch (error) {
            console.error("Error escribiendo en en el archivo:", error);
        }
    }

    async addProduct({ title, description, price, thumbnail, code, stock }) {
        
        const products = await this.#readProducts();
        const existingProduct = products.find((p) => p.code === code);
        if (existingProduct) {
            throw new Error(`Ya existe un producto con este código '${code}'`);
        }

        const id =
            products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
        
        const newProduct = {
            id,
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
        };

        products.push(newProduct);
        await this.#writeProducts(products);
        
        
        return newProduct;
    }

    async getProducts() {
        return await this.#readProducts();
    }

    async getProductById(id) {
        const products = await this.#readProducts();
        const product = products.find((p) => p.id === id);

        if (!product) {
            throw new Error(`No existe un producto con ese id: ${id}`);
        }
        return product;
    }

    async delete_product(id) {
        let products = await this.#readProducts();
        const length = products.length;
        products = products.filter((p) => p.id !== parseInt(id));
        if (length === products.length) {
            throw new Error(`No existe un producto con ese id: ${id}`);
        }
        await this.#writeProducts(products);
        
        
        return products; 
    }
    
    async update_product({id,title,description,price,thumbnail,code,stock}) 
    {
        const products = await this.#readProducts();
        const productIndex = products.findIndex((p) => p.id === id);

        if (productIndex === -1) {
            throw new Error(`No existe un producto con ese id: ${id}`);
        }
        
        if (code !== undefined && code !== products[productIndex].code) {
             const existingProductWithCode = products.find((p, index) => p.code === code && index !== productIndex);
             if (existingProductWithCode) {
                 throw new Error(`Ya existe un producto con el código '${code}'`);
             }
         }

        const updatedProduct = {
            ...products[productIndex],
            title: title ?? products[productIndex].title,
            description: description ?? products[productIndex].description,
            price: price ?? products[productIndex].price,
            thumbnail: thumbnail ?? products[productIndex].thumbnail,
            code: code ?? products[productIndex].code,
            stock: stock ?? products[productIndex].stock,
        };
        products[productIndex] = updatedProduct;
        await this.#writeProducts(products);
        return updatedProduct;
    }
}
