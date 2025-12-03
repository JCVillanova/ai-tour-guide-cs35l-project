//require('dotenv').config({ path: require('find-config')('.env') })
require('dotenv').config({path:'../.env'})

console.log(`Hello ${process.env.GEMINI_KEY}`)
