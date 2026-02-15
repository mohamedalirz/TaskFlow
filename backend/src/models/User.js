const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    id : {
        type : Number,

    },
    
    name : {
        type : String, 
        require : [true, 'Project name is required'],
        trim : true
    },

    email : {
        type : String,
        require : [true, 'email is required'],
        trim : true
    },

    password : {
        type : String,
        require : [true, 'password is required'],
    }
})

module.exports = mongoose.model('User', userSchema)