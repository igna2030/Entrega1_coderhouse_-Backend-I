import mongoose from 'mongoose';
import moongosePaginate from 'mongoose-paginate-v2';
const cartSchema = new mongoose.Schema(
    {
        products: {
            type: [
                {
                    productId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'products',
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

const cart = mongoose.model('carts',cartSchema);
export default cart;