var express = require('express');
var router = express.Router();
var config = require('../config')
var bodyParser = require('body-parser');
var querystring = require('querystring');
var url = require('url');
var Promise = require('promise');
var mysql = require('mysql');
var jsonParser = bodyParser.json();


var connection = mysql.createConnection({
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.pass,
  database: config.mysql.db,
  insecureAuth: true
});

connection.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("SUCCESS!");
});

router.get('/', function (req, res) {
  var sql = `SELECT * FROM activity`;
  var query = connection.query(sql, (err, results) => {
    //if (err) throw err;
    console.log(results);
    res.send(results);
  });
});

router.get('/cancel/:uid', async function (req, res) {
  var activityId = req.query.tid;
  var userId = req.params.uid; 
  //delete this activity from this user's history
  var queusersql = `SELECT * FROM user WHERE id = (${userId})`;
  var activityStr;
  var actStr = await dbConnection(queusersql);
  activityStr = actStr[0].userteam;
  var activityArr = [];
  activityArr = activityStr.split(',');
  console.log(activityArr);
  var numOfActivity = activityArr.length;
  for (var m = 0; m < numOfActivity; m++) {
    if (activityArr[m] === activityId) {
      activityArr.splice(m, 1);
      break;
    }
  }
  activityStr = activityArr.toString();
  console.log(activityStr);
  var updateusersql = `UPDATE user SET userteam = ? WHERE id = ${userId}`;
  var userfinal = await dbConnection(updateusersql, activityStr);

  //delete this user from this activity's user list
  var queactsql = `SELECT * FROM activity WHERE id_ = (${activityId})`;
  var userStr;
  var uStr = await dbConnection(queactsql);
  userStr = uStr[0].member;
  var userArr = [];
  userArr = userStr.split(',');
  console.log(userArr);
  var numOfUser = userArr.length;
  for (var n = 0; n < numOfUser; n++) {
    if (userArr[n] === userId) {
      userArr.splice(n, 1);
      break;
    }
  }
  userStr = userArr.toString();
  console.log(userStr);
  var updateactsql = `UPDATE activity SET member = ? WHERE id_ = ${activityId}`;
  var final = await dbConnection(updateactsql, userStr);
  res.send('OKAY.');
});


router.get('/get/:id', function (req, res) {
  var sql = `SELECT * FROM activity WHERE id_ = ${req.params.id}`;
  var query = connection.query(sql, (err, result) => {
    //if (err) throw err;
    console.log(result);
    res.send(result);
  });
});

//add a member of user by id.

router.get('/add/:uid', function (req, res) {
  var teamid = req.query.tid;
  var uid = req.params.uid;
  var sql = `SELECT * FROM activity WHERE id_ = ${teamid}`;
  var newquery = connection.query(sql, (err, result) => {
    //if (err) throw err;
    var memberstr;
    var statusstr;
    console.log(result);
    if (result[0].member.split(',')[0] == uid.toString()) {
      console.log('leader.');
      memberstr = result[0].member;
      statusstr = result[0].status;
    }
    else { memberstr = result[0].member.concat(',', uid.toString()); 
  statusstr = result[0].status.concat(',', '0');}
    var sqll = `UPDATE activity SET member = ? , status = ? WHERE id_ = ?`;
    console.log(sqll);
    var queryy = connection.query(sqll, [memberstr, statusstr, teamid], (err, nresult) => {
      //if (err) throw err;
      var secsql = `SELECT * FROM user WHERE id = ${uid}`;
      var query = connection.query(secsql, (err, results) => {
        //if (err) throw err;
        var s;
        if (results[0].userteam.length == 0) {
          s = results[0].userteam.concat(teamid.toString());
        }
        else {
          s = results[0].userteam.concat(",", teamid.toString());
        }
        var newsql = `UPDATE user SET userteam = ? WHERE id = ?`;
        console.log(newsql);
        var qquery = connection.query(newsql, [s, uid], (errors, eresult) => {
          //if (errors) throw errors;
          res.send("add " + uid + " to team " + teamid);
        });
      });
    });
  });
});

//a group member sign for one group.

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


router.get('/status/:uid', async function (req, res) {
  var teamid = req.query.tid;
  var uid = req.params.uid;
  var sql = `SELECT * FROM activity WHERE id_ = ${teamid}`;
  var resultgot = await dbConnection(sql);
  console.log(teamid);
  var memberArr = resultgot[0].member.split(',');
  var statusArr = resultgot[0].status.split(',');
  var newStr = '';
  for (let i = 0; i < memberArr.length; i++) {
    if (memberArr[i] == uid) statusArr[i] = 1;
    if (i != 0) newStr = newStr.concat(',', statusArr[i]);
    else newStr = newStr.concat(statusArr[i]);
  }
  console.log(newStr);
  var newsql = `UPDATE activity SET status = ? WHERE id_ = ${teamid}`;
  var query = connection.query(newsql, [newStr], (err, result) => {
    //console.log('errorhappened');
    //if (err) throw err;
    res.send('you have signed into this activity.');
  });
})

//post a new activity.

router.post('/post', jsonParser, function (req, res, next) {
  var post = req.body;
  //if (!req.body) return res.sendStatus(403);
  //res.json(post);
  var sql = 'INSERT INTO activity SET ?';
  var query = connection.query(sql, post, (err, result) => {
    //if (err) throw err;
    console.log(result);
    res.json(result);
  });
});

//get a list of user info in one activity by teamId.

router.get('/user/:id', function (req, res) {
  var sql = `SELECT * FROM activity WHERE id_ = ${req.params.id}`;
  var query = connection.query(sql, (err, result) => {
    //if (err) throw err;
    console.log(result[0].member);
    var memberstr = result[0].member;
    var newsql = `SELECT * FROM user WHERE id IN (${memberstr})`
    var query = connection.query(newsql, (error, results) => {
      //if (error) throw error;
      res.json(results);
    });
  });
});

//delete an activity.

async function getUsers(activityId) {
  var quesql = `SELECT * FROM activity WHERE id_ = (${activityId})`;
  var userStr;
  var result = await dbConnection(quesql);
  console.log(result);
  userStr = result[0].member;
  var userArr = [];
  //userStr = userStr.slice(1, userStr.length - 1);
  userArr = userStr.split(',');
  console.log(userStr);
  return userArr;
};

router.get('/delete', async function (req, res) {
  var activityId = req.query.tid;
  var users = await getUsers(activityId);
  var delsql = `DELETE FROM activity WHERE id_ = (${activityId})`;
  connection.query(delsql, function (err, result) {
    //if (err) throw err;
    console.log(result);
  });

  var numOfUser = users.length;

  for (var i = 0; i < numOfUser; i++) {
    var userId = users[i];
    var quesql = `SELECT * FROM user WHERE id = (${userId})`;
    var activityStr;
    var actStr = await dbConnection(quesql);
    activityStr = actStr[0].userteam;
    var activityArr = [];
    activityArr = activityStr.split(',');
    console.log(activityArr);
    var numOfActivity = activityArr.length;
    for (var m = 0; m < numOfActivity; m++) {
      if (activityArr[m] === activityId) {
        activityArr.splice(m, 1);
        break;
      }
    }
    activityStr = activityArr.toString();
    console.log(activityStr);
    var updatesql = `UPDATE user SET userteam = ? WHERE id = ${userId}`;
    var final = await dbConnection(updatesql, activityStr);
  }
  res.send('OKAY');
});


module.exports = router;
