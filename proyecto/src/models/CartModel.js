import moongose from 'mongoose';
import moongosePaginate from 'mongoose-paginate-v2';
import product from './ProductModel';

const cartSchema = new moongose.Schema(
    {
        products: {
            type: [
                {
                    productId: {
                        type: moongose.Schema.Types.ObjectId,
                        ref: product,
                        required:true
                    },
                    quantity: {type:Number,required:true,default:1}
                }
            ],
            default:[]
        }

    }
);

cartSchema.pre('findOne', function(){
    this.populate('products.productId');
})

cartSchema.pre('findById',function(){
    this.populate('products.productId');
})

const cart = moongose.model('carts',cartSchema);