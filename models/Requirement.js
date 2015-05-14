/**
 * Created by liang.chen on 2015/4/28.
 */
var mongoose = require('mongoose');

var requirementSchema = mongoose.Schema({
    requestid: { type: String, required:true, unique: true },
    title: { type : String, required : true },
    content: { type : String, required : true },
    owner: { type : String, required : true},
    email: { type : String, required : true },
    comment: { type : String, required : false},
    status : { type : String, required : true }
});

exports.requirementSchema=requirementSchema;