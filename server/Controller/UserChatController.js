const messageModel = require("../Model/Message")
const chatModel = require("../Model/Chat")
const mongoose = require('mongoose')

exports.Sending_Messages = async (object, callback) => {
    try {
     
      const existingConversation = await chatModel.findOne({
        $or: [
          { sender_Id: object.sender_Id, reciever_Id: object.reciever_Id },
          { sender_Id: object.reciever_Id, reciever_Id: object.sender_Id },
        ],
      });
  
      if (existingConversation) {
        const message = {
          message: object.message,
          sender_Id: object.sender_Id,
          reciever_Id: object.reciever_Id,
          conversation: existingConversation._id,
        };
        const newMessage = await messageModel.create(message);
        return callback(newMessage);
      } else {
        const conversationData = {
          sender_Id: object.sender_Id,
          reciever_Id: object.reciever_Id,
        };
        const newConversation = await chatModel.create(conversationData);
  
        const message = {
          message: object.message,
          sender_Id: object.sender_Id,
          reciever_Id: object.reciever_Id,
          conversation: newConversation._id,
        };
        const newMessage = await messageModel.create(message);
        console.log("newMessage ===> ",newMessage);
        
        return callback(newMessage);
      }
    } catch (err) {
      callback(err);
    }
  };



  exports.Getting_Messages = async (object , callback) => {
    const sender = object.sender_Id;
    const reciever = object.reciever_Id;
try{

  console.log("uix1",sender,reciever);

let senderData = [
  {
    '$match': {
      '$or': [
        { sender_Id: new mongoose.Types.ObjectId(sender), reciever_Id: new mongoose.Types.ObjectId(reciever) },
        { sender_Id: new mongoose.Types.ObjectId(reciever), reciever_Id: new mongoose.Types.ObjectId(sender) }
      ]
    }
  }, {
    '$group': {
      '_id': '$conversation', 
      'messages': {
        '$push': {
          '_id': '$_id', 
          'message': '$message', 
          'sender_Id': '$sender_Id', 
          'reciever_Id': '$reciever_Id', 
          'createdAt': '$createdAt', 
          'updatedAt': '$updatedAt', 
          'seen': '$seen', 
          'deliever': '$deliever'
        }
      }
    }
  }, {
    '$unwind': {
      'path': '$messages', 
      'preserveNullAndEmptyArrays': true
    }
  }, {
    '$lookup': {
      'from': 'users', 
      'localField': 'messages.sender_Id', 
      'foreignField': '_id', 
      'as': 'messages.sender_Id'
    }
  }, {
    '$unwind': {
      'path': '$messages.sender_Id', 
      'preserveNullAndEmptyArrays': true
    }
  }, {
    '$lookup': {
      'from': 'users', 
      'localField': 'messages.reciever_Id', 
      'foreignField': '_id', 
      'as': 'messages.reciever_Id'
    }
  }, {
    '$unwind': {
      'path': '$messages.reciever_Id', 
      'preserveNullAndEmptyArrays': true
    }
  }, {
    '$group': {
      '_id': '$_id', 
      'messages': {
        '$push': {
          'message': '$messages'
        }
      }
    }
  }, {
    '$unset': [
      'messages.message.sender_Id.role', 'messages.message.sender_Id.Reg_Date', 'messages.message.sender_Id.gallery', 'messages.message.sender_Id.devices', 'messages.message.sender_Id.attributes', 'messages.message.sender_Id.interests', 'messages.message.sender_Id.hashed_password', 'messages.message.sender_Id.salt', 'messages.message.sender_Id.status', 'messages.message.sender_Id.questions', 'messages.message.sender_Id.tokens', 'messages.message.sender_Id.createdAt', 'messages.message.sender_Id.updatedAt', 'messages.message.sender_Id.__v', 'messages.message.sender_Id.subscribitionId', 'messages.message.sender_Id.DOB', 'messages.message.sender_Id.gender', 'messages.message.sender_Id.like', 'messages.message.reciever_Id.role', 'messages.message.reciever_Id.Reg_Date', 'messages.message.reciever_Id.gallery', 'messages.message.reciever_Id.devices', 'messages.message.reciever_Id.attributes', 'messages.message.reciever_Id.interests', 'messages.message.reciever_Id.hashed_password', 'messages.message.reciever_Id.salt', 'messages.message.reciever_Id.status', 'messages.message.reciever_Id.questions', 'messages.message.reciever_Id.tokens', 'messages.message.reciever_Id.createdAt', 'messages.message.reciever_Id.updatedAt', 'messages.message.reciever_Id.__v', 'messages.message.reciever_Id.subscribitionId', 'messages.message.reciever_Id.DOB', 'messages.message.reciever_Id.gender', 'messages.message.reciever_Id.like'
    ]
  }, {
    '$sort': {
      'messages.createdAt': 1
    }
  }
]

  const get_data = await messageModel.aggregate(senderData)

  
  
  let ui = get_data.map(data => data.messages.flat([3]))?.pop()
   
   await Promise.all (
    ui?.map(async(data) => {
      const { _id , sender_Id , reciever_Id  } = data?.message

      if(_id && sender_Id.online && reciever_Id.online){
        await messageModel.updateMany({_id : { $in :  ui?.map(data => data?.message?._id?.toString()) } } ,{$set: { seen : true , deliever : true} })
      }else{
        await messageModel.updateMany({_id : { $in :  ui?.map(data => data?.message?._id?.toString()) } } ,{$set: { seen : true} })
      }
    })
  )

  let updatedData = [
    {
      '$match': {
        '$or': [
          { sender_Id: new mongoose.Types.ObjectId(sender), reciever_Id: new mongoose.Types.ObjectId(reciever) },
          { sender_Id: new mongoose.Types.ObjectId(reciever), reciever_Id: new mongoose.Types.ObjectId(sender) }
        ]
      }
    }
  ]

 let uix = await messageModel.aggregate(updatedData)


 
  if(uix){
      callback(uix)
  }
  
  
 
}catch(error){
  callback(error)
}
}


exports.Deleting_Messages = async (object,callback) => {
  try{
    await messageModel.deleteMany({ _id : { $in : object?._id }});
    // const remainingMessages = await messageModel.find({sender_Id : object.sender_Id});

    callback("Deleted");
  }catch(err){
  callback("message not deleted",err);
  }
  }


exports.Chatlist = async (object,callback) => {
    try{
      const last = await messageModel
      .findOne({'$or' : [{sender_Id : object.sender_Id} , { reciever_Id : object.sender_Id} ]})
      .sort({createdAt : -1})
      .select("message conversation deliever")

      let totalCount = await messageModel.find({ '$and' : [{conversation : last?.conversation?.toString() } , {deliever : false }] })

      
      
       await chatModel.findOneAndUpdate(
        {_id : last.conversation.toString() } , 
        {$set : { lastmessage : last.message ,  totalunread : totalCount?.length}  } , 
        { new :true });

    
    
      const allUsers =  await chatModel
      .find( {'$or' :[{ sender_Id : object.sender_Id } , { reciever_Id : object.sender_Id}]} )
      .populate({path :'sender_Id'})
      .populate({path :'reciever_Id'})
      .sort({ createdAt : -1 })
    
      
     callback(allUsers)
      ///res.status(200).send({ message : "Chatlist Data Fetched" , status : 1 , data : allUsers })
    }catch(err){
      callback(err)
      //res.status(500).send({ message : "No Chatlist Data" , status : 0})
    }
    }


    exports.ChatlistItem = async (object , callback) => {
        try{
          const { id } = object
      
          const checkchat = await chatModel.find({_id : {$in : id } });
          
          if(checkchat.length == 0){
            return callback("already chatlist item deleted")
          }
      
      
          await chatModel.deleteMany({_id : {$in : id}});
          await messageModel.deleteMany({conversation : {$in : id}  })
          //res.status(200).send({ message : "Chat list item deleted successfully" , status : 1})
          callback("Chat list item deleted successfully")
        }catch(err){
          //res.status(500).send({ message : "Chat list item not deleted successfully" , status : 0})
          callback("Chat list item not deleted successfully")
        }
      }