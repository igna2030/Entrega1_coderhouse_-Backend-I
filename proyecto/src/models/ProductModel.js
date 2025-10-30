import moongose from 'mongoose';
import moongosePaginate from 'mongoose-paginate-v2';
import { type } from 'os';

const productSchema = new moongose.Schema(
    {
        title: {type: String, required:true},
        description:{type: String, required:true},
        price:{type:Number,required:true},
        thumbnail:{type: String, required:true},
        code:{type: String, required:true},
        stock:{type:Number,required:true},
        category:{type:String,required:true},
        status:{type:Boolean,default:true}
    }
);

productSchema.plugin(moongosePaginate);

const product = moongose.model('products',productSchema);
export default product;