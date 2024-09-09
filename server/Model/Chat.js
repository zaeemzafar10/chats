const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {
    sender_Id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    reciever_Id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    lastmessage:{
        type :String,
        default : ""
    },
    totalunread:{
      type : Number,
      default : 0
    }
   
    
   
  },
  { timestamps: true }
);

module.exports = mongoose.model("chat", chatSchema);