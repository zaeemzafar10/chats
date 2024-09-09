const express = require('express')
const router = express.Router() 

// admin
router.use('/user/auth', require('./User/Auth.js'))

module.exports = router;