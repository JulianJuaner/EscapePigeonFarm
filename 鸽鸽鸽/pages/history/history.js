const app = getApp();
Page({

  data: {
    userhistory: [],
    userid: 1,
    userTolMoney: 0,
  },

  onLoad: function (options) {
    var that = this;
    wx.request({
      url: 'https://gi4gya0w.qcloud.la/userInfo/gethistory/' + app.globalData.userInfo.id,
      method: 'GET',
      success: function (res) {
      console.log(res);
      if (res.data != "no activity"){
        that.setData({
            userhistory: res.data,
            userid: app.globalData.userInfo.id,
          });
        }
      else {
        that.setData({
          userid: app.globalData.userInfo.id,
        });
      }
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  gotoActivityPage: function (e) {
    console.log(e)
    wx.navigateTo({
      url: '../logs/logs',
    })
  },
  getBack: function (e) {
    console.log("go Back to Home...");
    wx.navigateBack({
    })
  },
  goTospcTeam: function (e) {
    var id = e.currentTarget.dataset.toId
    console.log(id)
    wx.redirectTo({
      url: '../about/about?id=' + id,
    })
  },
})