/**
 * Created by liang.chen on 2015/4/6.
 */
var crypto=require('crypto'),
    config=require('./config').initConfig,
    mongoose = require('mongoose');
    nodemailer = require("nodemailer");
mongoose.connect('mongodb://127.0.0.1/portal');

var express = require('express'),
    router = express.Router();
//db = mongoose.connect('mongodb://'+config.host+':'+config.port+'/portal');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    var userschema = require('./models/User').userSchema,
        requirementschema = require('./models/Requirement').requirementSchema,
        user = mongoose.model('user', userschema),
        requirement = mongoose.model('requirement', requirementschema);

    router.get('/', function(req, res, next) {
        if(!req.cookies.username && !req.session.username){
            return res.render('index');
        }
        return res.render('workspace');
    });

    router.post('/login', function(req, res) {
        user.findOne({username: req.body.username}).exec(function(err, user) {
            if(!user){
                err='查无此人';
            }else if(user.password===req.body.password){
                if(req.body.remember) {
                    res.cookie('username',req.body.username, { maxAge: 1*24 * 3600 * 1000, httpOnly: true });
                }
                req.session.username=user.username;
                res.json({success:true,msg:'用户'+user.username+'已登录'});
            }else{
                err='用户鉴权失败';
            }
            if(err){
                res.json({success:false,msg:err});
            }
            //db.close();
        });
    });

    router.get('/index', function(req, res, next) {
        res.render('index');
        //db.close();
    });

    router.get('/workspace', function(req, res, next) {
        if(!req.cookies.username && !req.session.username)
            res.render('index');
        else
            res.render('workspace');
        //db.close();
    });

    router.post('/ifUserExists', function(req, res) {
        user.count({username:req.body.username},function (err, count) {
            if(err){
                console.log('User not added, username already exists');
                res.json({success: false, msg: err.message});
            }else{
                if(parseInt(count)>0){
                    res.json({success: false, msg: "用户名已存在"});
                }else{
                    res.json({success: true, msg: ""});
                }
            }
            //db.close();
        });
    });

    router.post('/ifEmailExists', function(req, res) {
        user.count({email:req.body.email},function (err, count) {
            if(err){
                console.log('User not added, email already exists');
                res.json({success: false, msg: err.message});
            }else{
                if(parseInt(count)>0){
                    res.json({success: false, msg: "邮箱已存在"});
                }else{
                    res.json({success: true, msg: ""});
                }
            }
            //db.close();
        });
    });

    router.post('/register', function(req, res) {
        var newUser = new user({ username: req.body.username, password: req.body.password, email: req.body.email, role: 1 });
        newUser.save(function (err) {
            if (err) {
                res.json({success: false, msg: err.message});
                console.error(err.message);
            }
            else {
                console.log('User Added');
                res.json({success: true, msg: "success"});
            }
            //db.close();
        });
    });

    router.get('/getLoginUser', function(req, res) {
        res.json({username: req.session.username ? req.session.username : req.cookies.username});
        //db.close();
    });

    router.post('/submitRequirement',function(req,res){
        var username=req.cookies.username ? req.cookies.username : req.session.username;
        user.findOne({username: username}).exec(function(err, user) {
            if(user){
                var newRequirement = new requirement({
                    requestid: Date.now().toString(),
                    title: req.body.title,
                    content: req.body.content,
                    owner: username,
                    email: user.email,
                    comment: '',
                    status:'待评审'
                });
                newRequirement.save(function (err) {
                    if (err) {
                        res.json({success: false, msg: err.message});
                        console.error(err.message);
                    }
                    else {
                        console.log('Requirement Added');
                        res.json({success: true, msg: "success"});
                    }
                });
            }
            //db.close();
        });
    });

    router.get('/getUserItems',function(req,res){
        var username=req.cookies.username ? req.cookies.username : req.session.username;
        var query=username!='admin' ? {owner:username} : {};
        requirement.find(query,'requestid title content comment status owner email', function (err, items) {
            if(err) {
                res.json({success: false, obj: err.message});
            } else {
                res.json({success: true, obj: items});
            }
            //db.close();
        });
    });

    router.get('/getAllImplItems',function(req,res){
        requirement.find({status:'已实现'},'requestid title', function (err, item) {
            if(err) {
                res.json({success: false, obj: err.message});
            } else {
                res.json({success: true, obj: item});
            }
            //db.close();
        });
    });

    router.post('/updateRequirement',function(req,res){
        var conditions = {requestid : req.body.requestid};
        var update     = {$set : {comment : req.body.comment, status : req.body.status}};
        var options    = {};
        requirement.update(conditions, update, options, function(err){
            if(err) {
                res.json({success: false, msg: err.message});
            }else{
                res.json({success: true, msg: "success"});
            }
            //db.close();
        });
    });

    router.post('/sendEmail',function(req,res){
        var smtpTransport = nodemailer.createTransport('SMTP',{
            host: 'smtp.126.com',
            maxConnections:50,
            secureConnection: true, // 使用 SSL
            port: 465, // SMTP 端口
            auth: {
                user: 'node_mailer@126.com',
                pass: 'jbbdlqlsaecpdaca'
            }
        });

        var mailOptions = {
            from: 'node_mailer@126.com',
            to: req.body.mailto,
            cc: req.body.mailcc,
            subject: '数据中心需求通知邮件 - '+req.body.status,
            html: '<h3>'+req.body.title+'</h3><h4>需求人：'+req.body.owner+'</h4><br>正文：'+req.body.content+'<br>评论：'+req.body.comment+''
        };
        smtpTransport.sendMail(mailOptions, function(err, info){
            if(err){
                console.error(err);
            }else{
                console.info("sent.");
            }
            //smtpTransport.close();
        });
    });
});

module.exports = router;
