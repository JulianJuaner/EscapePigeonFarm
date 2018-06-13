var express = require('express');
var router = express.Router();
var config = require('../config')
var bodyParser = require('body-parser');
var querystring = require('querystring');
var Promise = require('promise');
var request = require('request');
var url = require('url');
//var mysql = require('../util').mysql;
var mysql = require('mysql');
var OAuth = require('wechat-oauth');
var jsonParser = bodyParser.json();


var connection = mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.db,
    insecureAuth: true
});

function connectdB(sql, member) {
    var m;
    return new Promise(async (resolve, reject) => {
        try {
            await connection.query(sql, member, (error, result) => {
                if (error) throw error;
                m = result;
                console.log('sss');
                resolve(result);
            });
        }
        catch (error) {
            reject(error)
        }
    });
}
function connectnewdB(sql, member) {
    var m;
    return new Promise(async (resolve, reject) => {
        try {
            connection.query(sql, member, await function (error, result) {
                if (error) throw error;
                m = result;
                console.log('???')
                resolve(result);
            });
        }
        catch (error) {
            reject(error)
        }
    });
}
async function dosomething(usersql, member, Amember, newreputation) {
    //newreputation -= 10;
    try {
        //console.log("s" + Amember);
        var result = await connectdB(usersql, member);
        newreputation = result[0].reputation + 10;
        console.log('mth = ' + result[0].reputation);
        console.log("get reputation : " + newreputation);
        var newsql = `UPDATE user SET reputation = (${result[0].reputation + 10}) WHERE id = (${Amember})`;
        var trueR = await connectnewdB(newsql, member);
        console.log('todo');
    }
    catch (error) {
        console.log("什么");
    }
}

async function dbConnection(sql, values) {
    return new Promise(async (resolve, reject) => {
        try {
            await connection.query(sql, [values], (error, result) => {
                if (error) throw error;
                //console.log(result);
                resolve(result);
            });
        }
        catch (error) {
            reject(error)
        }
    });
}

router.get('/updateuser/:openid', async function (req, res) {

    var sql = `SELECT * FROM user WHERE openid = ?`;
    var Info = req.query.userInfo;
    var Ujson = JSON.parse(Info);
    var nickName = Ujson.nickname;
    var avatarUrl = Ujson.avatarUrl;
    console.log(avatarUrl);

    var Fresult = await dbConnection(sql, req.params.openid);
    if (Fresult.length > 0) {
        var nsql = `UPDATE user SET nickname = ? , avatarUrl = ? WHERE openid = ?`;
        try {
            var query = connection.query(nsql, [nickName, avatarUrl, req.params.openid], (err, result) => {
                if (err) throw err;
                res.send('UPDATED.');
            })
        }
        catch (e) {
            console.log(e);
        }
    }
    else {
        var setsql = `INSERT INTO user (openid, nickname, avatarUrl, userteam, song, moneyinTotal, reputation) VALUES (?,?,?,?,?,?,?) `;
        var query = connection.query(setsql, [req.params.openid, nickName, avatarUrl, '', 0, 0, 0], (err, result) => {
            //if (err) throw err;
            console.log(result);
            res.send(result);
        })
    }
});

router.get("/openid", (req, res) => {
    var data = {
        'appid': config.appid,
        'secret': config.secret,
        'js_code': req.query.code,
        'grant_type': 'authorization_code'
    };
    var content = querystring.stringify(data);
    var url = ' https://api.weixin.qq.com/sns/jscode2session?' + content;
    request.get({
        'url': url
    }, (error, response, body) => {
        let body1 = JSON.parse(body);
        res.json(body1);
    })
})

router.get("/updatesong/:id", async (req,res)=>{
    var uid = req.params.id;
    var sql = `UPDATE user SET song = 0 WHERE id = ?`
    var ok = await dbConnection(sql, uid)
    res.send('OKAY.');
})

router.post("/cryptdata", async (req, res) => {
    let WXBizDataCrypt = require('../common/WXBizDataCrypt')
    const sha1 = require("sha1");
    try {
        let appId = "wx1cabad2089c42c6b";
        let secret = "2004b3b38d10752916596ec03519af1a";
        let { encryptedData, iv, js_code, rawData, signature } = req.body;
        // 获取session_key  
        let opts = {
            url: `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${js_code}&grant_type=authorization_code`
        };
        let r1 = await Ut.promiseReq(opts);
        let { session_key } = JSON.parse(r1);
        if (!session_key) return res.json('');
        // 数据签名校验  
        let signature2 = sha1(rawData + session_key);
        if (signature != signature2) return res.json("数据签名校验失败");
        // 解密  
        let pc = new WXBizDataCrypt(appId, session_key);
        let result = pc.decryptData(encryptedData, iv);
        var sql = 'INSERT INTO user SET ?';
        var query = connection.query(sql, post, (err, result) => {
            //if (err) throw err;
            console.log(result);
            res.json(result);
        });
    }
    catch (e) {
        console.log(e);
        res.json('');
    }
});

//get history.

router.get('/gethistory/:id', function (req, res) {
    var sql = `SELECT * FROM user WHERE id = ${req.params.id}`;
    var query = connection.query(sql, (err, result) => {
        //if (err) throw err;
        //console.log(result[0].member);
        var memberstr = result[0].userteam;
        if (memberstr === '') {
            res.send('no activity');
        }
        else {
            var newsql = `SELECT * FROM activity WHERE id_ IN (${memberstr}) AND success = 1`
            var query = connection.query(newsql, (error, results) => {
                //if (error) throw error;
                res.json(results);
            });
        }
    });
});

//get current activity list by user id.

router.get('/getactivity/:id', function (req, res) {
    if(req.params.id===undefined){
        res.send('undefined');
    }
    try {
        var sql = `SELECT * FROM user WHERE id = ${req.params.id}`;
        var query = connection.query(sql, (err, result) => {
            //if (err) throw err;
            //console.log(result[0].member);
            var memberstr = result[0].userteam;
            if (memberstr === '') {
                res.send('no activity');
            }
            else {
                var newsql = `SELECT * FROM activity WHERE id_ IN (${memberstr})`
                var query = connection.query(newsql, (error, results) => {
                    //if (error) throw error;
                    res.json(results);
                });
            }
        });
    }
    catch (e) {
        console.log(e);
    }
});

//
router.get('/getcurrent/:id', function (req, res) {
    var sql = `SELECT * FROM user WHERE id = ${req.params.id}`;
    var query = connection.query(sql, (err, result) => {
        //if (err) throw err;
        //console.log(result[0].member);
        var memberstr = result[0].userteam;
        if (memberstr === '') {
            res.send('no activity');
        }
        else {
            var newsql = `SELECT * FROM activity WHERE id_ IN (${memberstr}) AND success = 0`
            var query = connection.query(newsql, (error, results) => {
                //if (error) throw error;
                res.json(results);
            });
        }
    });
});

router.get('/get/:openid', function (req, res) {
    var sql = `SELECT * FROM user WHERE openid = ?`;
    var query = connection.query(sql, [req.params.openid], (err, result) => {
        //if (err) throw err;
        res.json(result);
    })
})
//a router for 
//这是一个巨大的函数，其中包括了punish的处理以及history和current team之间的转换.
router.get('/checkteams/:userid', function (req, res) {
    return new Promise(function (resolve, reject) {
        var sql = `SELECT * FROM user WHERE id = ${req.params.userid}`;
        var query = connection.query(sql, (err, result) => {
            //if (err) throw err;
            var finalresult = result;
            var timestr = req.query.times;
            var timearray = timestr.replace('[', "").replace(']', '').split(",");
            var teamstr = result[0].userteam;
            var teamarray = teamstr.split(",");
            //检查现有teamarray和timearray， 改变完成状态，并设置处罚（信誉值降低。）
            for (let i = 0; i < teamarray.length; i++) {
                (function (i) {
                    if (timearray[i] < 0) {
                        var secsql = `SELECT * FROM activity WHERE id_ = ${teamarray[i]}`;
                        var Ateam = teamarray[i];
                        var teamquery = connection.query(secsql, (err, secresult) => {
                            //console.log('xixi' + secresult[0].success);
                            if (secresult[0].success == 0) {
                                //secresult[0].success = 1;
                                var sqll = `UPDATE activity SET success = 1 WHERE id_ = ${Ateam}`;
                                var successquery = connection.query(sqll, (err, result) => {
                                    //if (err) throw err;
                                    console.log("SET success state.");
                                    //console.log(result[0]);
                                });
                                var memberstr = secresult[0].member;
                                var statusstr = secresult[0].status;
                                var memberarray = memberstr.split(',');
                                var statusarray = statusstr.split(',');
                                var m = 0;
                                (async function (m) {
                                    console.log('meiyou');
                                    for (m = 0; m < memberarray.length; m++) {
                                        if (statusarray[m] == 1) {
                                            console.log('m is ' + memberarray[m]);
                                            var newreputation = 0;
                                            var Amember;
                                            //console.log('member' + memberarray[m]);
                                            var usersql = `SELECT * FROM user WHERE id =(${memberarray[m]})`;
                                            Amember = memberarray[m];
                                            var todo = await dosomething(usersql, memberarray[m], Amember, newreputation);
                                            //console.log("END");
                                        }
                                    }
                                })(m);
                                //a function for punishtype 3.
                                function do2() {
                                    var m = 0;
                                    for (m = 0; m < memberarray.length; m++) {
                                        (function (m) {
                                            if (statusarray[m] == 0) {
                                                var newsong = 0;
                                                var Amember;
                                                //console.log('member' + memberarray[m]);
                                                var usersql = `SELECT * FROM user WHERE id =(${memberarray[m]})`;
                                                Amember = memberarray[m];
                                                //var todo = doit(err,result);
                                                var userquery = connection.query(usersql, (error, result) => {
                                                    //if (error) throw error;
                                                    //newreputation -= 10;
                                                    var newsql = `UPDATE user SET song = 1 WHERE id = (${Amember})`;
                                                    var secquery = connection.query(newsql, async function todo2(error, results) {
                                                        //if (error) throw error;
                                                        //console.log(Amember);
                                                        //console.log(i + " : " + newreputation);
                                                        console.log('OKAY.');
                                                        //res.send(results);
                                                    });
                                                });
                                                console.log("END2");
                                            }
                                        })(m);
                                    }
                                }
                                if (secresult[0].punish == 3) {
                                    do2();
                                }
                            }
                        });
                    }
                })(i);
            }
            res.send('WTF');
        });
    })
});

module.exports = router;