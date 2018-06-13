module.exports = {
  port: 5757,
  expireTime: 24 * 3600,
  appid: 'wx1cabad2089c42c6b',
  secret: '3a205c0dde12d029985fafbd2a1a3052',
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    db: 'activity',
    pass: '123456',
    char: 'utf8mb4'
  },
  cos: {
    region: 'ap-guangzhou',
    fileBucket: 'todo'
  }
};
