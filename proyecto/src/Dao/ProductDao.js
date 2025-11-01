import ProductModel from './models/ProductModel.js';

class ProductDao {

    async getProducts({ limit = 10, page = 1, sort, query }) {
        try {
            const options = {
                limit: parseInt(limit),
                page: parseInt(page),
                lean: true, 
            };

            const filter = {};
            const sortOptions = {};

            if (query) {
                const [field, value] = query.split(':');
                if (field === 'category') {
                    filter.category = value;
                } else if (field === 'stock' && value === 'available') {
                    filter.stock = { $gt: 0 };
                }
            }

            if (sort) {
                if (sort === 'asc') {
                    sortOptions.price = 1; 
                } else if (sort === 'desc') {
                    sortOptions.price = -1;
                }
                options.sort = sortOptions;
            }
            const result = await ProductModel.paginate(filter, options);
            
            return result; 

        } catch (error) {
            console.error("Error en ProductDao.getProducts:", error.message);
            return {
                docs: [],
                totalPages: 1,
                prevPage: null,
                nextPage: null,
                hasPrevPage: false,
                hasNextPage: false,
                page: 1,
            };
        }
    }
    async getProductByID(id){
        return await ProductModel.findById(id).lean();
    }


    async createProduct(productData){
        return await ProductModel.create(productData);
    }

    async updateProduct(id,updateData){
        return await ProductModel.findByIdAndUpdate(id, updateData, {new:true});
    }
    async deleteProduct(id){
        return await ProductModel.findByIdAndDelete(id);
    }

    async decreaseStock(productId, quantityToDecrease = 1) {
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            productId,
            { $inc: { stock: -quantityToDecrease } }, 
            { new: true } 
        );
        
        if (!updatedProduct) {
             throw new Error(`Producto con ID ${productId} no encontrado para actualizar stock.`);
        }
        
        
        return updatedProduct;
    }

async increaseStock(productId, quantityToIncrease) {
    if (!quantityToIncrease || quantityToIncrease <= 0) {
        return; 
    }
    
    const updatedProduct = await ProductModel.findByIdAndUpdate(
        productId,
        { $inc: { stock: quantityToIncrease } }, 
        { new: true } 
    );
    
    if (!updatedProduct) {
        console.warn(`Advertencia: Producto con ID ${productId} no encontrado al intentar devolver stock.`);
    }
    
    return updatedProduct;
}
}


export default ProductDao;
