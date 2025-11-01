import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import ProductModel from '../proyecto/src/Dao/models/ProductModel.js'; 
import CartModel from '../proyecto/src/Dao/models/CartModel.js';
import enviorement from '../proyecto/src/Connection/mongoDBConnection.js'
dotenv.config();

const Mongo_url = process.env.MONGO_URI;
const numeroProductos = 50;
const numeroCarritos = 20;

enviorement();

const createFakeProduct = () => {
    const categories = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Libros'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    return {
        title: faker.commerce.productName(),
        description: faker.lorem.sentences(3),
        price: faker.commerce.price({ min: 10, max: 500, dec: 2 }),
        thumbnail: faker.image.url({ category: 'product', width: 200, height: 200 }),
        code: faker.string.alphanumeric(10).toUpperCase(), 
        stock: faker.number.int({ min: 0, max: 100 }),
        category: randomCategory,
        status: faker.datatype.boolean() 
    };
};

const createFakeCart = (productIds) => {
    const numItems = faker.number.int({ min: 1, max: 10 });
    const cartProducts = new Map(); 

    for (let i = 0; i < numItems; i++) {
        const randomProductId = productIds[faker.number.int({ min: 0, max: productIds.length - 1 })];
        
        const quantity = faker.number.int({ min: 1, max: 5 });
        
        cartProducts.set(randomProductId.toString(), {
            productId: randomProductId,
            quantity: quantity
        });
    }

    return {
        products: Array.from(cartProducts.values())
    };
};

const importData = async () => {
    await enviorement();

    try {
        console.log(' Borrando datos existentes...');
        await ProductModel.deleteMany(); 
        await CartModel.deleteMany(); 

        console.log(` Generando ${numeroProductos} productos...`);
        const productsToInsert = Array.from({ length: numeroProductos }, createFakeProduct);
        const insertedProducts = await ProductModel.insertMany(productsToInsert);
        
        const productIds = insertedProducts.map(p => p._id);
        console.log(` ${numeroProductos} Productos generados con éxito.`);


        console.log(` Generando ${numeroCarritos} carritos con productos referenciados...`);
        const cartsToInsert = Array.from({ length: numeroCarritos }, () => createFakeCart(productIds));
        await CartModel.insertMany(cartsToInsert);
        
        console.log(` ¡${numeroCarritos} Carritos generados con éxito!`);
        process.exit();

    } catch (error) {
        console.error(' Error al importar datos masivos:', error);
        process.exit(1);
    }
};

const destroyData = async () => {
    await enviorement();
    try {
        await ProductModel.deleteMany();
        await CartModel.deleteMany();
        console.log(' Productos y Carritos destruidos con éxito.');
        process.exit();
    } catch (error) {
        console.error(' Error al destruir datos:', error.message);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}