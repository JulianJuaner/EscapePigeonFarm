//app.js
App({
  config: {
    host: 'https://gi4gya0w.qcloud.la'
  },
  onLaunch: function () {
    
    console.log("???")
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    console.log(new Date('2018-05-31 12:00'))
    // 登录
    var openid = '';
    wx.login({
      fail:res=>{conssole.log("fail")},
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res.code);
        wx.request({
          url: 'https://gi4gya0w.qcloud.la/userInfo/openid',
          method: 'GET',
          data: {
            code: res.code,
          },
          fail:(res)=>{
            console.log("ohno")
          },
          success: (res) => {
            console.log(res.data.openid);
            openid = res.data.openid;
            this.globalData.userInfo.openid = openid;
            wx.getUserInfo({
              success: res => {
                console.log(res);
                this.globalData.userInfo.nickname = res.userInfo.nickName;
                this.globalData.userInfo.avatarUrl = res.userInfo.avatarUrl;
                this.globalData.userInfo.openid = openid;
                var that = this;
                wx.request({
                  url: 'https://gi4gya0w.qcloud.la/userInfo/updateuser/' + openid,
                  data: {
                    userInfo: this.globalData.userInfo,
                  },
                  method: 'GET',
                  success: res => {
                    console.log(res);
                    wx.request({
                      url: 'https://gi4gya0w.qcloud.la/userInfo/get/' + openid,
                      method: 'GET',
                      success: res=>{
                        console.log(res);
                        that.globalData.userInfo = res.data[0];
                        console.log(that.globalData.userInfo);
                      }
                    })
                  }
                })
                console.log(this.globalData)
                if (this.userInfoReadyCallback) {
                  this.userInfoReadyCallback(res)
                }
              }
            })
          },
        });
      }
    })
  },

  globalData: {
    userInfo: {},
    latitude: null,
    longitude: null
  }
})