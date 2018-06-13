var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var util = require('../../utils/util.js');
var qqmapsdk;
const app = getApp();
Page({
  data: {
    Time: { time: '', remainD: '', remainH: '', remainM: '' },
    status:[],
    team: {},
    member:[],
    distance: 0,
    userid: 1,
    memberin:0,
    inpunch:0,
    truemember:[],
    toofar:0,
    success:0,
    teamid:100,
  },
  onShareAppMessage: function (res) {
    var m = this.data.team.id_
    console.log(m);
    return {
      title: this.data.team.theme,
      path: 'pages/about/about?id=' + m,
    }
  },
  home:function(e){
    wx.redirectTo({
      url: '../index/index',
    })
  },
  quit: function (event) {
    wx.request({
      url: 'https://gi4gya0w.qcloud.la/activity/cancel/' + this.data.userid,
      method: 'GET',
      data: {
        tid: this.data.team.id_,
      },
      success: function (res) {
        wx.showModal({
          title: '鸽了鸽了！',
          content: '你居然又放鸽子！',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
            wx.redirectTo({
              url: '../index/index',
            })
          }
        })
      }
    })
  },
  punch:function(event){
    console.log("???", this.data.distance);
    if (this.data.distance > 300 || parseInt(this.data.Time.remainH) > 0 || parseInt(this.data.Time.remainD)>0){
      wx.showModal({
        title: '无法操作',
        content: '你还差一些距离/时间呢',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }else{
      wx.showLoading({
        title: '咕咕咕',
        mask: true,
      })
    wx.request({
      url: 'https://gi4gya0w.qcloud.la/activity/status/' + this.data.userid,
      method: 'GET',
      data: {
        tid: this.data.team.id_,
      },
      success: function (res) {
        wx.hideLoading();
        wx.showModal({
          title: '到了诶！',
          content: '终于不再咕咕咕勒',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
            wx.redirectTo({
              url: '../index/index',
            })
          }
        })
      }
    }) 
    }
  },
  cancel: function (event) {
    console.log(this.data.team);
    wx.request({
      url:'https://gi4gya0w.qcloud.la/activity/delete',
      method:'GET',
      data:{
        tid: this.data.team.id_,
      },
      success:function(res){
        wx.showModal({
          title: '你居然删了它！',
          content: '下次注意点儿！',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
            wx.redirectTo({
              url: '../index/index',
            })
          }
        })
      }
    })   
  },
  join:function(e){
    if (this.data.distance > 300 || parseInt(this.data.Time.remainH) > 0 || parseInt(this.data.Time.remainD))    
    {
      wx.showModal({
        title: '不能加入了！',
        content: '这个活动快开始了。',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
          wx.redirectTo({
            url: '../index/index',
          })
        }
      })
    }
    else{
    wx.request({
      url: 'https://gi4gya0w.qcloud.la/activity/add/'+this.data.userid,
      method: 'GET',
      data: {
        tid: this.data.team.id_,
      },
      success: function (res) {
        wx.showModal({
          title: '加入成功！',
          content: '努力做一个不鸽的小朋友！',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
            wx.redirectTo({
              url: '../index/index',
            })
          }
        })
      }
    })
    }
  },
  openlocation: function (event) {
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        //data binding.
        wx.openLocation({
          latitude: that.data.team.latitude,
          longitude: that.data.team.longitude,
          scale: 28
        })
      }
    })
  },
  todosomething:function(){
    if (app.globalData.userInfo.id!=undefined){
    this.setData({
      userid: app.globalData.userInfo.id
    })
    //console.log('options.id' + options.id);
    var that = this;
    //options.id-=1;
    wx.request({
      url: 'https://gi4gya0w.qcloud.la/activity/get/' + this.data.teamid,
      method: 'GET',
      success: function (res) {
        console.log(res);
        var length = 0;
        var data = res.data[0].status.split(',');
        console.log(data);
        for (var i = 0; i < data.length; i++) {
          if (data[i] == '1') length++;
        }
        that.setData({
          team: res.data[0],
          truemember:res.data[0].member.split(','),
          punch: length,
          status: data
        })
        console.log('true :', that.data.truemember);
        console.log(that.data.success);
        console.log(that.data.status)
        wx.request({
          url: 'https://gi4gya0w.qcloud.la/activity/user/' +that.data.teamid,
          success: function (res) {
            console.log(res);
            that.setData({
              member: res.data,
            });
            var member = that.data.member;
            for (var i = 0; i < member.length; i++) {
              if (member[i].id == that.data.userid) {
                that.setData({
                  memberin: 1,
                });
                if (that.data.team.status[i] === "1") {
                  that.setData({
                    inpunch: 1,
                  });
                }
              }
            }
            console.log(that.data.member);
          },
        })
        wx.setNavigationBarTitle({
          title: that.data.team.theme,
        });
        console.log('caclulate.')
        qqmapsdk.calculateDistance({
          mode: 'walking',
          to: [{
            latitude: that.data.team.latitude,
            longitude: that.data.team.longitude
          }],
          
          success: function (res) {
            //  var distance = res.result.elements[0].distance;
            console.log(res);
            that.setData({
              distance: res.result.elements[0].distance
            });
            console.log(that.data.distance);
            var x = that.data.Time;
            var d2 = new Date();
            var d3 = that.data.team.time;
            var d1 = d3.replace(/-/g, "/");
            var result = new Date(d1).getTime() - d2.getTime();

            if (result <= 0) {
              that.setData({
                success: 1,
              });
            }
            else {
              x.remainD = Math.floor(result / (24 * 3600000));
              result = result % (24 * 3600000);
              x.remainH = Math.floor(result / (3600 * 1000));
              console.log(x.remainH);
              result = result % (3600 * 1000);
              x.remainM = Math.floor(result / (60 * 1000));
              console.log('x是' + x);
              that.setData({
                Time: x,
              });
            }
            wx.hideNavigationBarLoading();
          },
          fail: function (res) {
            console.log(res);
            that.setData({
              toofar:1,
              distance:9999,
            });
            var x = that.data.Time;
            var d2 = new Date();
            var d3 = that.data.team.time;
            var d1 = d3.replace(/-/g, "/");
            var result = new Date(d1).getTime() - d2.getTime();

            if (result <= 0) {
              that.setData({
                success: 1,
              });
            }
            else {
              x.remainD = Math.floor(result / (24 * 3600000));
              result = result % (24 * 3600000);
              x.remainH = Math.floor(result / (3600 * 1000));
              console.log(x.remainH);
              result = result % (3600 * 1000);
              x.remainM = Math.floor(result / (60 * 1000));
              console.log('x是' + x);
              that.setData({
                Time: x,
              });
            }
            wx.hideNavigationBarLoading();
          },
          complete: function (res) {

          }
        });

      },
      fail: function (res) {

      }
    })
    qqmapsdk = new QQMapWX({
      key: 'GMEBZ-VYLC3-HKU33-YRP5Q-OH4RF-QLB42'
    });}
    else{
      this.onLoad();
    }
  },
 
  onLoad: function (options) {
    this.setData({
      teamid:options.id,
    })
    // 实例化API核心类
    wx.showLoading({
      title: '咕咕哒',
    })
    if(app.globalData.userInfo.openid==undefined){
    setTimeout(this.todosomething, 1000);
    setTimeout(function () { wx.hideLoading() }, 4000);
    }
    else{
      this.todosomething();
      setTimeout(function () { wx.hideLoading() }, 1000);
    }
  },
})
