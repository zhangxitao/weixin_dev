/**
 * Created by xitao on 2016/4/13.
 */



var PORT = 9529;
var http = require('http');
var qs = require('qs');
var TOKEN = 'xitao';

function  checkSignature(params, token){
    //1.将token、timestamp、nonce三个参数进行字典序排序
    //2.将三个参数字符串拼接成一个字符串进行sha1加密
    //3.开发者获得加密后的字符串可与signature对比，标识该请求来源于微信

    var key = [token, params.timestamp, params.nonce].sort().join('');
    var sha1 = require('crypto').createHash('sha1');
    sha1.update(key);
    return sha1.digest('hex') == params.signature;

    return sha1.digest('hex') == params.signature;
}

var server = http.createServer(function(request,response){
    //解析URL中的qurey部分，用qs模块（npm install qs）将query解析成json

    var qurey = require('url').parse(request.url).query;
    var params = qs.parse(qurey);

    if (!checkSignature(params, TOKEN)){
        response.end('signature fail');
        return
    }

    if (request.method == "GET"){
        //如果请求是ＧＥＴ，返回echostr用于通过服务器有效校验
        response.end(params.echostr);
    }else {
        //否则是微信给开发者服务器的POST请求
        var postdata = "";

        request.addListener("data",function(postchunk){
            postdata += postchunk;
        });

        //获取到POST数据
        request.addListener("end",function(){
            var parseString = require('xml2js').parseString;

            parseString(postdata, function(err, result){
                if (!err){
                    //我们将XML数据通过xml2js模块（npm install xml2js）解析成json格式
                    console.log(result);
                    //console.log(result.xml.MsgType[0]);
                    var xmlResponse = getResponseXml(result.xml);
                    response.end(xmlResponse);
                }
            });
        });
    }
});

function getResponseXml(xml) {
    var msgType=xml['MsgType'][0];
    var to_username = xml['ToUserName'][0];
    var from_username = xml['FromUserName'][0];
    var responseXml = {xml: {}}
    responseXml['xml']['ToUserName'] = from_username;
    responseXml['xml']['FromUserName'] = to_username;
    if (msgType === "event") {
        var event = xml['Event'][0];
        if (event = "subscribe") {
            responseXml['xml']['CreateTime'] = new Date().getTime();
            responseXml['xml']['MsgType'] = "text";
            responseXml['xml']['Content'] = "你好！欢迎关注GLxita，在本测试号中，你可以问我有关“天文、地理、化学、生物等等一切问题，我都不会回答的。”";
        }
    } else if (msgType === "text") {
        responseXml['xml']['CreateTime'] = new Date().getTime();
        responseXml['xml']['MsgType'] = msgType;
        responseXml['xml']['Content'] = "收到了你的信息，它是一段文本信息，别问我是什么，我并不知道";
    } else if (msgType === "image") {
        responseXml['xml']['CreateTime'] = new Date().getTime();
        responseXml['xml']['MsgType'] = msgType;
        responseXml['xml']['Image']={};
        responseXml['xml']['Image']['MediaId'] = "PqjIyfIFKYr91xbLUTQMQiNOgsAmXSYQExAiem1krw5AkT7a14T8VyHYSlYuWjq_";
    }else if(msgType === "voice"){
        responseXml['xml']['CreateTime'] = new Date().getTime();
        responseXml['xml']['MsgType'] = msgType;
        responseXml['xml']['Voice']={};
        responseXml['xml']['Voice']['MediaId'] = "MHDe4-0yBkfbf7SLQ7RpWdAqmo_9xTmNWxJgl65q63UnGn7lfVV-MCBw5DO0t5Mu";
    }else if(msgType==="video"||msgType==="shortvideo"){
        responseXml['xml']['CreateTime']=new Date().getTime();
        responseXml['xml']['MsgType']="video";
        responseXml['xml']['Video']={};
        responseXml['xml']['Video']['MediaId']="AUfSaQhQ28rBzLGR0ndWNAJTPHoGMsiAGZHu0tEBgQkI3Cd6iuU1NEUuy5-uMsAX";
    }else{
        responseXml['xml']['CreateTime'] = new Date().getTime();
        responseXml['xml']['MsgType'] = "text";
        responseXml['xml']['Content'] = "已收到您的信息！";
    }
    console.log(responseXml);
    var xml2js = require('xml2js');
    var builder = new xml2js.Builder();
    return builder.buildObject(responseXml);
}

server.listen(PORT);

console.log("server runing at port:"+PORT+".");