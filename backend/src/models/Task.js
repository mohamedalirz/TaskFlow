const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    id : {
        type : String,
    },

    title : {
        type : String,
        required : [true, 'Task title is required'],
        trim : true
    },

    description : {
        type : String,
        trim : true
    },

    colomnId : {
        type : Number,
        default : 1
    },

    projectId : {
        type : Number,
    },

    assignee : {
        type : String,
        default : "none",
        trim : true
    }

})

module.exports = mongoose.model('Task', taskSchema)