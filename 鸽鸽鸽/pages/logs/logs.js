//logs.js
const Util = require('../../utils/util.js')
var bmap = require('../../libs/bmap-wx.js');
var wxMarkerData = [];
const app = getApp();
Page({
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },

  data: {
    userID: 1,
    //for date picker.
    date: '2018-06-01',
    currentdate: '2018-06-07',
    time: '12:01',
    //for theme.
    theme: '不做鸽王',
    //for punishment style.
    punish: 1,
    money: 5.00,
    state: [
      { num: '1', id: 'primary', name: '基础模式' },
      { num: '2', id: 'default', name: '押金平分' },
      { num: '3', id: 'default', name: '来点音乐' }
    ],
    activityId: 0,
    ak: "q03vEyrAv3UzkUmG52btBbIcMd4WKQas",
    markers: [{
      iconPath: "../../images/token.png",
      id: 0,
      width: 50,
      latitude: 0,
      longitude: 0,
      height: 50
    }],
    address: '当前位置',
    detailadd: '',
    member: '1',
    status: '0',
    city: {},

    locationX: '0',
    locationY: '0',
    polyline: [{
      points: [{
        longitude: 123,
        latitude: 0
      }, {
        longitude: 123,
        latitude: 0
      }],
      color: "#FF0000DD",
      width: 2,
      dottedLine: true
    }],

  },
  onLoad: function (options) {
    //get data from bMap.
    var that = this;
    var BMap = new bmap.BMapWX({
      ak: that.data.ak
    });
    var success = function (data) {
      wxMarkerData = data.wxMarkerData;
      wxMarkerData[0].iconPath = '/image/token.png';
      that.setData({
        userID:app.globalData.userInfo.id,
        member:app.globalData.userInfo.id.toString(),
        marker: wxMarkerData[0],
        locationX: wxMarkerData[0].latitude,
        locationY: wxMarkerData[0].longitude,
        detailadd: wxMarkerData[0].address,
        //city: data.originalData.result.addressComponent,
      })
      console.log("Success!" + that.data.userID);
    }
    //需要一个BMAP的回调来记录数据。
    BMap.regeocoding({
      //we also need a fail handler to handle exceptions.
      success: success
    })
    var date = new Date();
    var format = Util.formatTime(date);
    this.setData({
      currentdate: date.getFullYear().toString() + '-'
      + (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + '-'
      + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()),
      date: date.getFullYear().toString() + '-'
      + (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + '-'
      + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()),
      time: date.getHours().toString() + ':'
      + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    })
  },
  replaceInput: function (e) {
    this.setData({
      theme: e.detail.value
    })
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  },
  bindChooseLocation: function (e) {
    var that = this;
    var newmarkers = this.data.markers;
    wx.chooseLocation({
      success: function (res) {
        newmarkers[0].latitude = res.latitude;
        newmarkers[0].longitude = res.longitude;
        var naddress = res.name;
        var ndetail = res.address;
        if (res.name == '') {
          naddress = '当前位置';
          ndetail = '未选择';
        }
        that.setData({
          locationX: res.latitude,
          markers: newmarkers,
          locationY: res.longitude,
          address: naddress,
          detailadd: ndetail,
        })
      },
    })
  },
  handlePunish: function (e) {
    console.log(e)
    var newstate = this.data.state;
    newstate[e.target.id - 1].id = 'primary';
    newstate[e.target.id % 3].id = 'default';
    newstate[(e.target.id + 1) % 3].id = 'default';
    this.setData({
      state: newstate,
      punish: e.target.id
    })
  },
  submitForm: function (e) {
    var d1 = new Date();
    var d3 = this.data.date +' '+this.data.time;
    
    var d2 = d3.replace(/-/g, "/");
    var remain = new Date(d2).getTime() - d1.getTime();
    if (this.data.theme == '') {
      wx.showModal({
        title: '这样是不行的！',
        content: '你需要填写主题',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
    else if (this.data.punish == 2) {
      wx.showModal({
        title: '此功能未实现',
        content: '对不起，暂时不能选择这种方式！',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
    else if (remain < 3600000) {
      wx.showModal({
        title: '这样是不行的！',
        content: '时间太紧了！',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
    else{
    wx.showLoading({
      title: '咕咕咕',
    })
    console.log(this.data.punish);
    var datetime = this.data.date + ' ' + this.data.time + ':00';
    var that = this;
    wx.request({
      url: 'https://gi4gya0w.qcloud.la/activity/post',
      method: 'POST',
      data: {
        latitude: this.data.locationX,
        longitude: this.data.locationY,
        member: app.globalData.userInfo.id.toString(),
        status: this.data.status,
        name: this.data.address,
        address: this.data.detailadd,
        time: datetime,
        punish: this.data.punish,
        money: this.data.money,
        theme: this.data.theme,
        success: 0,
      },
      header: {
        "content-type": "application/json",
      },
      success: function (res) {
        that.setData({
          activityId: res.data.insertId
        })
        console.log(res);
        wx.request({
          url: 'https://gi4gya0w.qcloud.la/activity/add/' + that.data.userID,
          data: { tid: that.data.activityId },
          success: function (res) {
            wx.redirectTo({
              url: '../about/about?id=' + that.data.activityId,
            })
            wx.hideLoading()
          }
        })
      },
      fail: function (res) {
        console.log('fail.');
      }
    })
    }
  },
})
