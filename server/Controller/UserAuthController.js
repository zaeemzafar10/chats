const User = require("../Model/User");
//register
exports.register = async (req, res) => {
    const { firstName, lastName, email, password  } = req.body;
   
   

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res
                .status(400)
                .json(ApiResponse({}, "User with this Email Already Exist", false));
        }

        user = new User({
            firstName,
            lastName,
            email,
            password,
            role: "USER",
            status: "INACTIVE"
        });

        await user.save();


        res.status(201).json({ data : user})
        
    } catch (error) {
      console.log(error)
        return res.status(500).json(ApiResponse({}, error.message, false));
    }
};


//signin
exports.signin = async (req, res) => {
    const { email, password } = req.body;
 
    try {
        User.findOne({ email, role: "USER" }).populate('subscribitionId').then((user) => {
          
            if (!user) {
                return res.json(ApiResponse({}, "USER with this email not found", false));
            }
            if (!user.authenticate(password)) {
                return res.json(ApiResponse({}, "Invalid password!", false));
            }
            if(user.status != "ACTIVE"){
              return res.json(ApiResponse({}, "USER is not Active", false));
            }
            const token = generateToken(user);

            return res.json(ApiResponse({ user: sanitizeUser(user), token }, "User Logged In Successfully", true));
        })
            .catch((err) => {
                return res.json(ApiResponse({}, err.message, false));
            });
    } catch (error) {
        return res.status(500).json(ApiResponse({}, error.message, false));
    }
};

// //email verification code
// exports.emailVerificationCode = async (req, res) => {
//     try {
//       let { email } = req.body;
//       let verificationCode = generateString(4, false, true);
//       console.log("verificationCode", verificationCode);
//       await createResetToken(email, verificationCode);
//       const encoded = Buffer.from(
//         JSON.stringify({ email, code: verificationCode }),
//         "ascii"
//       ).toString("base64");
//       const html = `
//                   <div>
//                     <p>
//                       You are receiving this because you (or someone else) have requested the reset of the
//                       password for your account.
//                     </p>
//                     <p>Your verification status is ${verificationCode}</p>
//                     <p>
//                       <strong>
//                         If you did not request this, please ignore this email and your password will remain
//                         unchanged.
//                       </strong>
//                     </p>
//                   </div>
//       `;
//       await generateEmail(email, "WrightCo Academy LMS - Password Reset", html);
//       return res.status(201).json({
//         message:
//           "Recovery status Has Been Emailed To Your Registered Email Address",
//         encodedEmail: encoded,
//       });
//     } catch (err) {
//       res.status(500).json({
//         message: err.toString(),
//       });
//     }
//   };
  
  //email verification code
exports.emailVerificationCode = async (req, res) => {
  try {
    let { email } = req.body;
    const checkedUser = await User.findOne({ email : email })
    if(!checkedUser){
      return res
        .status(400)
        .json(ApiResponse({}, "This User Does not exist", false));
    }
    let verificationCode = generateString(4, false, true);
    console.log("verificationCode", verificationCode);
    await createResetToken(email, verificationCode);
    const encoded = Buffer.from(
      JSON.stringify({ email, code: verificationCode }),
      "ascii"
    ).toString("base64");
    const html = `
                <div>
                  <p>
                    You are receiving this because you (or someone else) have requested the reset of the
                    password for your account.
                  </p>
                  <p>Your verification status is ${verificationCode}</p>
                  <p>
                    <strong>
                      If you did not request this, please ignore this email and your password will remain
                      unchanged.
                    </strong>
                  </p>
                </div>
    `;
    await generateEmail(email, "Parven App - Password Reset", html);
    return res.status(201).json({
      message:
        "Recovery status Has Been Emailed To Your Registered Email Address",
      encodedEmail: encoded,
    });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

  //verify recover code
  exports.verifyRecoverCode = async (req, res) => {
    try {
      const { code, email } = req.body;
      const isValidCode = await validateResetToken(code, email);
      let user = await User.findOne({ email : email})
      await User.updateOne({_id : user._id.toString()},{$set : {status : "ACTIVE"}},{new :true})
      if (isValidCode) {
        return res
          .status(200)
          .json(ApiResponse({user}, "Verification Code Verified", true));
      } else
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid Verification Code", false));
    } catch (err) {
      res.status(500).json({
        message: err.toString(),
      });
    }
  };
  
  //reset password
  exports.resetPassword = async (req, res) => {
    try {
      const { password, code, email } = req.body;
  
      const reset_status = await validateResetToken(code, email);
  
      if (!reset_status) {
        return res
          .status(400)
          .json(ApiResponse({}, "Verification Code dosent Match Email", false));
      }
  
      let user = await User.findOne({ email });
  
      await Reset.deleteOne({ code: code, email: email });
  
      user.password = password;
      await user.save();



  
      await res
        .status(201)
        .json(ApiResponse({}, "Password Updated Successfully", true));
    } catch (err) {
      res.status(500).json(ApiResponse({}, err.toString(), false));
    }
  };


  // exports.dogRegister = async (req,res) => {
  //   const { name ,gender , DOB , userid , petType } = req.body
  //   try{
       
  //       const data = {
  //           gender , 
  //           name ,
  //           DOB , 
  //           petType ,
  //           petImage : req.file.path.replace(/\\/g, "/")
  //       }

  //     const PetProfile =  await Pet.create(data)

  //     await User.updateOne(
  //       {_id : userid},
  //       {$push: { petid : PetProfile._id.toString()  }},
  //       {new : true})
        
  //     return res
  //     .status(200)
  //     .json(
  //         ApiResponse(
  //             { PetProfile },
  //             true,
  //             `${PetProfile.petType} Profile Created Successfully`
  //         )
  //     );

  //   }catch(error){
  //       return res.status(500).json(ApiResponse({}, error.message, false));
  //   }
  // }
  

  exports.userProfile = async (req,res) => {
    const { _id } = req.user
    try{
      const userProfile = await User.findById(_id)
      return res
      .status(200)
      .json(
          ApiResponse(
              { userProfile },
              true,
              "User Profile Fetched Successfully"
          )
      );

    }catch(error){
      return res.status(500).json(ApiResponse({}, error.message, false));
    }
  }

  exports.editProfile = async (req, res) => {
    const { id } = req.params;
    try {
      const {
        firstName, lastName, DOB, location,
        gender, attributes, interests, questions ,desc
      } = req.body;
  
     //  console.log("body" , req.body)
      const updateObj = {};
  
      if (firstName) updateObj.firstName = firstName;
      if (lastName) updateObj.lastName = lastName;
      if (desc) updateObj.desc = desc;
      if (DOB) updateObj.DOB = DOB;
      if (location) updateObj.location = JSON.parse(location);
      if (gender) updateObj.gender = gender;
      if (attributes) updateObj.attributes = JSON.parse(attributes)?.map(data => data);
      if (interests) updateObj.interests = JSON.parse(interests)?.map(data => data);
      if (questions) updateObj.questions = JSON.parse(questions)?.map(data => ({questionId : data.questionId ,answer: data.answer }) );
  
      
      if (req.files && req.files.image) {
       
        const imagePaths = req.files.image.map(file => file.path.replace(/\\/g, "/"));
        const newProfileImage = imagePaths.pop();
        updateObj.image = newProfileImage;
  
        // const existingUser = await User.findById(id); 

        // if (existingUser.gallery) {
        //   updateObj.gallery = [...new Set([...existingUser.gallery, newProfileImage])];
        // } else {
        //   updateObj.gallery = [newProfileImage];
        // }
      }

      if (req.files && req.files.gallery) {
       
        const galleryPaths = req.files.gallery.map(file => file.path.replace(/\\/g, "/")); 

        const existingUser = await User.findById(id); 

        if(existingUser.gallery){
          updateObj.gallery = [...existingUser.gallery , ...galleryPaths];
        }else{
          updateObj.gallery = [galleryPaths];
        }
        

        


      }
  
      const updatedProfile = await User.findByIdAndUpdate(
        id,
        { $set: updateObj },
        { new: true }
      );
  
      return res
        .status(200)
        .json(
          ApiResponse(
            { updatedProfile },
            true,
            "Profile Updated Successfully"
          )
        );
    } catch (error) {
      console.log("----------->" ,error)
      return res.status(500).json(ApiResponse({}, error.message, false));
    }
  };
  
  exports.updateDeviceForPushNotification = async (req,res) => {
    const { deviceToken , deviceType } = req.body
    const { id } = req.params
    try{
      if(deviceType !== "android" && deviceType !== "ios" && deviceType !== "web"){
        return res.status(400).json(ApiResponse({}, "This Device Type is not exist in System" , false));
      }

      const data = {
        deviceToken,
        deviceType,
        user : id
      }

      let newDevice = await Device.create(data)

      let updateDevice = await User.findOneAndUpdate(
        {_id : id},
        {$push: { devices : newDevice?._id?.toString() }},
        {new  : true})

      let ui =  await User.updateOne({_id : id}, {$set: { notificationOn : true }},{new : true})

      const [ dev , upda , uis] = await Promise.all([newDevice , updateDevice , ui])


      return res
      .status(200)
      .json(
        ApiResponse(
          { dev },
          true,
          "Device Updated Successfully"
        )
      );
    }catch(error){
      return res.status(500).json(ApiResponse({}, error.message, false));
    }
  }
  

  exports.changePassword = async (req,res) => {
  const { _id } = req.user
  const { password } = req.body
try{
  let user = await User.findOne({ _id })

 
  user.password = password
  await user.save();


   res
  .status(201)
  .json(ApiResponse({}, "Password Updated Successfully", true));
}catch(error){
  return res.status(500).json(ApiResponse({}, error.message, false));
}
}

exports.changeUserStatusBySocket = async (object, callback) => {
  const { id , online } = object
try{

 let user = await User.findOneAndUpdate({_id : id},{$set : { online : online}},{new : true})
 callback(user)

}catch(error){
  callback(error)
}
}