const express = require("express");


// controllers start here 
const {updateDeviceForPushNotification , changePassword ,editProfile , userProfile , register,dogRegister, emailVerificationCode, verifyRecoverCode, resetPassword, signin } = require("../../Controller/UserAuthController");
// controllers end here 



const router = express.Router()

// user auth api start here
    router.post("/register" , register);
    // router.post("/signin", signinValidator, signin);
    // router.post("/emailVerificationCode", emailCodeValidator, emailVerificationCode);
    // router.post("/verifyRecoverCode", verifyCodeValidator, verifyRecoverCode);
    // router.post("/resetPassword", resetPasswordValidator, resetPassword);
// user auth api end here



module.exports = router
