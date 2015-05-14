/**
 * Created by liang.chen on 2015/4/6.
 */
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username: { type: String, required:true, unique: true },
    password: { type : String, required : true },
    email: { type : String, required : true, unique: true },
    role : { type : Number, required : true }
});

exports.userSchema=userSchema;