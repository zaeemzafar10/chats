const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema  = new Schema(
  {
    message: {
        type: String,
    },
    seen: {
      type: Boolean,
      default : false
    },
    deliever: {
      type: Boolean,
      default : false
    },
    sender_Id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    reciever_Id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    conversation : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'chat'
    }
   
    
   
  },
  { timestamps: true }
);

module.exports = mongoose.model("message", messageSchema );