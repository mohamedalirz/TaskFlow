const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
    id : {
        type : Number,

    },
    
    name : {
        type : String, 
        require : [true, 'Project name is required'],
        trim : true
    },

    description : {
        type : String,
        trim : true
    },

    ownerId : {
        type : Number,
    },

    membersListId : {
        type : [Number],
        default : []
    },

    color : {
        type : String,
        default : "red",
    }
})

module.exports = mongoose.model('Project', projectSchema)