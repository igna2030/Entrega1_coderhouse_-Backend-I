import ProductModel from '../models/ProductModel.js';

class ProductDao {

        async getProducts({ limit = 10, page = 1, sort, query }) {
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

        const result = await Product.paginate(filter, options);
        return result;
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
}


export default ProductDao;
