const mongoose = require('mongoose')

const invitationSchema = new mongoose.Schema({
    id : {
        type : Number,

    },
    
    projectId : {
        type : Number
    },

    email : {
        type : String,
        require : [true, 'email is required'],
        trim : true
    },

    status : {
        type : String,
    }
})

module.exports = mongoose.model('Inviation', invitationSchema)