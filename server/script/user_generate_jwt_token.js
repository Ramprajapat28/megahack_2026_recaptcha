require('dotenv').config();
const {generateToken} = require("../utils/token")

let secret = process.env.JWT_SECRET_KEY;
const data = {
      "id" :1,
      "email" : "admin@gmail.com",
      "name" : "hsrah",
      "role" :"admin"
    }

     


console.log(generateToken(data))