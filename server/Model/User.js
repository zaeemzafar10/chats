const { Schema, default: mongoose } = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const mongoosePaginate = require('mongoose-paginate');
const crypto = require("crypto");
const { v4: uuidv4 } = require('uuid');


const userSchema = new Schema(
  {
    firstName: {
      type: String,
      // minlength: 3,
      default : "",
      required: true,
    },
    lastName: {
      type: String,
      // minlength: 3,
      default : "",
      required: true,
    },
    email: {
      type: String,
      minlength: 3,
      required: true,
      unique: true,
      dropDups: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      required: true,
    },
    online:{
      type : Boolean,
      default : false
    },
   
    phoneNumber: {
      type: String,
    },
    DOB: {
      type: String,
    },
    desc: {
      type: String,
    },
    subscribitionId:{
      type: mongoose.Schema.Types.ObjectId,
      ref : 'subscribtion'
      },
    address: {
      type: String,
    },
    Reg_Date:{
      type : Date,
      default : Date.now()
    },
    image: {
      type: String,
      default : ""
    },
    gallery: {
      type:  [],
      default : []
    },
    gender:{
      type : String,
      enum: ['man', 'women','other'],
    },
    notificationOn:{
      type : Boolean,
      default : false
    },
    devices:[
      {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'device'
      }
    ],
    attributes:[
      {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'attributes'
    }],
    interests:[
      {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'interests'
    }],
    questions:[
      {
        questionId:{type: mongoose.Schema.Types.ObjectId, ref : 'questions'},
        answer : { type : String}
      }
    ],
    location: {
        type:{
            type: String,
            enum: ['Point', 'Polygon'],
            // default : 'Point',
        },
        coordinates: [Number] 
      },
    like:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'user'
      }
    ],
    visitedLocation:[
      {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'visitedlocation'
    }],
    hashed_password: {
      type: String,
    },
    salt: String,

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      required: true,
      default: "INACTIVE"
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);


userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv4();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  encryptPassword: function (password) {
    if (!password) return "";

    try {

      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      console.log(err.message);
      return "";
    }
  },
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },
};

userSchema.plugin(mongoosePaginate);
userSchema.plugin(aggregatePaginate);

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model("user", userSchema);
