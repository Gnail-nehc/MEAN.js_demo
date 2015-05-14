/**
 * Created by liang.chen on 2015/4/5.
 */
var username='';
angular.module('app',['ngCookies','ngRoute'])
    .config(['$locationProvider', function ($locationProvider) {
        if(window.history && window.history.pushState){
            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });
        }
    }])

    .controller('LoginController', ['$scope','$http', function($scope, $http) {
        $scope.login = function () {
            if(!$scope.username || !$scope.password){
            }else{
                $http.post('/login', {username: $scope.username, password: $scope.password, remember: $scope.remember}).success(function (data) {
                    if (!data.success) {
                        $scope.msg = data.msg;
                    }else{
                        window.location="/workspace";
                    }
                }).error(function (data) {
                    $scope.msg = data;
                    window.location="/";
                });
            }
        }
    }])

    .controller('RegistryController', ['$scope','$http', function($scope, $http) {
        $scope.reg=function(){
            if($("#user").val()!="" && $("#email").val()!="" && $("#pass1").val()!="" && $("#pass2").val()!=""){
                $http.post('/register',{username: $scope.username,email: $scope.email, password: $scope.password}).success(function (data) {
                    if (data.success) {
                        window.location="/workspace";
                    }else{
                        $scope.error=data.msg;
                    }
                }).error(function(data){
                    $scope.msg=data.msg;
                });
            }else{
                $scope.error="请完善信息";
            }
        };

        $scope.checkUser=function(){
            var user=$("#user").val();
            if(user.length<3||user.length>20){
                $("#userTips").text("*用户名长度为"+user.length+",不符合要求");
                $("#reg").attr('disabled',"true");
            }else{
                $http.post('/ifUserExists', {username: $scope.username}).success(function (data) {
                    if (data.success) {
                        $("#userTips").text("");
                        $("#reg").removeAttr("disabled");
                    }else{
                        $("#userTips").text(data.msg);
                        $("#reg").attr('disabled',"true");
                    }
                }).error(function (data) {
                    $("#userTips").text(data);
                    $("#reg").attr('disabled',"true");
                });
            }
        };

        $scope.checkEmail=function(){
            var email=$("#email").val();
            var regex= /^([a-zA-Z0-9_\.\-])+$/;
            if(email.length==0){
                $("#emailTips").text("*请输入邮箱账号");
                $("#reg").attr('disabled',"true");
            }
            else if(!regex.test(email)){
                $("#emailTips").text("*邮箱格式不符合要求");
                $("#reg").attr('disabled',"true");
            }else{
                $http.post('/ifEmailExists', {email: $scope.email}).success(function (data) {
                    if (data.success) {
                        $("#emailTips").text("");
                        $("#reg").removeAttr("disabled");
                    }else{
                        $("#emailTips").text(data.msg);
                        $("#reg").attr('disabled',"true");
                    }
                }).error(function (data) {
                    $("#emailTips").text(data);
                    $("#reg").attr('disabled',"true");
                });
            }
        };

        $scope.checkPass1=function(){
            if($("#pass1").attr("hidden")=="hidden"){
                $("#pass1").val($("#pass1-1").val());
            }
            var pass1=$("#pass1").val();
            if(pass1.length<6||pass1.length>20){
                $("#pass1Tips").text("*密码长度为"+pass1.length+",不符合要求");
                $("#reg").attr('disabled',"true");
            }else{
                $("#pass1Tips").text("");
                $("#reg").removeAttr("disabled");
            }
        };

        $scope.checkPass2=function(){
            if($("#pass1").attr("hidden")=="hidden"){
                $("#pass1").val($("#pass1-1").val());
            }
            if($("#pass2").attr("hidden")=="hidden"){
                $("#pass2").val($("#pass2-1").val());
            }
            var pass1=$("#pass1").val();
            var pass2=$("#pass2").val();
            if(pass1!=pass2){
                $("#pass2Tips").text("*两次输入的密码不相同");
                $("#reg").attr('disabled',"true");
            }else{
                $("#pass2Tips").text("");
                $("#reg").removeAttr("disabled");
            }
        };

        $scope.seePass1Click=function(){
            if($(this).attr("class")=="glyphicon glyphicon-eye-close"){
                $(this).attr("class","glyphicon glyphicon-eye-open");
                $("#pass1-1").val($("#pass1").val());
                $("#pass1").hide();
                $("#pass1-1").show();
            }
            else{
                $(this).attr("class","glyphicon glyphicon-eye-close");
                $("#pass1").val($("#pass1-1").val());
                $("#pass1").show();
                $("#pass1-1").hide();
            }
        };

        $scope.seePass2Click=function(){
            if($(this).attr("class")=="glyphicon glyphicon-eye-close"){
                $(this).attr("class","glyphicon glyphicon-eye-open");
                $("#pass2-1").val($("#pass2").val());
                $("#pass2").hide();
                $("#pass2-1").show();
            }
            else{
                $(this).attr("class","glyphicon glyphicon-eye-close");
                $("#pass2").val($("#pass2-1").val());
                $("#pass2").show();
                $("#pass2-1").hide();
            }
        };
    }])

    .controller('WorkspaceController', ['$scope','$http', function($scope, $http) {
        $http.get('/getLoginUser').success(function(data){
            $scope.username = data.username;
            username=data.username;
        });

        $http.get('/getUserItems').success(function(data){
            if(data.success){
                $scope.reviewingItems=[];
                $scope.developingItems=[];
                $scope.rejectedItems=[];
                $scope.implementedItems=[];
                angular.forEach(data.obj, function(item){
                    switch(item.status){
                        case '待评审':
                            $scope.reviewingItems.push(item);
                            break;
                        case '开发中':
                            $scope.developingItems.push(item);
                            break;
                        case '被拒绝': ;
                            $scope.rejectedItems.push(item);
                            break;
                        default:
                            $scope.implementedItems.push(item);
                            break;
                    }
                });
            }
        });

        $http.get('/getAllImplItems').success(function(data){
            if(data.success){
                $scope.allImplementedItems=data.obj;
            }
        });

        $scope.open=function(item){
            $scope.requestid=item.requestid;
            $scope.title=item.title;
            $scope.content=item.content;
            $scope.comment=item.comment;
            $scope.status=item.status;
            $scope.email=item.email;
            $scope.owner=item.owner;
        };

        $scope.updateRequirement=function(){
            $http.post('/updateRequirement',{requestid: $scope.requestid, comment: $scope.comment, status: $('input[name="action"]:checked').val()}).success(function (data) {
                if (data.success) {
                    window.location="/workspace";
                    $http.post('/sendEmail',{
                        mailto: $scope.email+'@ctrip.com',
                        mailcc: 'liang.chen@ctrip.com',
                        owner: $scope.owner,
                        status: $('input[name="action"]:checked').val(),
                        title: $scope.title,
                        content: $scope.content,
                        comment: $scope.comment
                    }).success(function (data) {
                    }).error(function(err){
                        console.log(err);
                    });
                }else{
                    $scope.error=data.msg;
                }
            }).error(function(data){
                $scope.error=data;
            });
        }
    }])

    .controller('RequirementController', ['$scope','$http', function($scope, $http) {
        $scope.submitRequirement=function(){
            $http.post('/submitRequirement',{title: $scope.title,content: $scope.content }).success(function (data) {
                if (!data.success) {
                    $scope.error=data.msg;
                }else{
                    window.location="/workspace";
                    $http.post('/sendEmail',{
                        mailto: 'liang.chen@ctrip.com',
                        mailcc: username+'@ctrip.com',
                        owner: username,
                        status: '待评审',
                        title: $scope.title,
                        content: $scope.content,
                        comment: ''
                    }).success(function (data) {
                    }).error(function(err){
                        console.log(err);
                    });
                }
            }).error(function(data){
                $scope.error=data.msg;
            });
        }
    }])

;

