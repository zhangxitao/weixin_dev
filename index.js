/**
 * Created by xitao on 2016/4/16.
 */

var express =require('express');

//创建express实例
var app = express();
//定义EJS模板引擎和模板文件位置
app.set('views',__dirname);
app.set('view engine','html');

//定义静态文件目录
app.use(express.static(__dirname));
//相应首页get请求
app.get('/',function(req,res){
    return res.render('index');
});

//监听3006端口
app.listen(3006,function(req,res){
    console.log('WeChat wall is running at port 3006');
});