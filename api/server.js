const path = require('path')
const express = require('express')
const session=require('express-session')
const Store=require('connect-session-knex')(session)
const authRouter=require('./auth/auth-router')
const usersRouter = require('./users/users-router.js')


const server = express()

server.use(express.static(path.join(__dirname, '../client')))

server.use(express.json())
const sessionConfig={
  name:'monkey',
  secret:'keep it secret',
  cookie:{
    maxAge:1000*60*60,
    secure:false,//we are in 'development' phase,so use 'http:' not 'https:'
    httpOnly:false//means javascript can read or modify this cookie
  },
  resave:false,
  rolling:true,//we can get a fresh cookie with every login
  saveUninitialized:false,
  store:new Store({
    knex: require('../database/db-config'),// 数据库连接配置
    tablename: 'sessions',// 数据库表的名称
    sidfieldname: 'sid',// 会话ID字段的名称
    createtable: true,// 是否创建会话表（如果不存在）
    clearInterval: 1000 * 60 * 60 // 清除会话的时间间隔（以毫秒为单位）
  })
}

server.use(session(sessionConfig))
server.use('/api/auth',authRouter)
server.use('/api/users', usersRouter)

server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'index.html'))
})

server.use('*', (req, res, next) => {
  next({ status: 404, message: 'not found!' })
})

server.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  })
})

module.exports = server
