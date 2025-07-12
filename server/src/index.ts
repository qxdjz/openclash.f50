import path from 'path'
import express from 'express'
import timeout from 'connect-timeout'
import proxy from 'http-proxy-middleware'

import hook from './hook'
import Handle from './handle'
import iptables from './iptables'
import service from './handle/service'
import config from './handle/config'
import utils from './utils'

const app = express()

async function start() {
    const host = (await config.read('gateway')) ?? '192.168.0.1'
    const port = '3300'

    // 设置端口
    app.set('port', port)

    // 设置超时 返回超时响应
    app.use(timeout(90 * 1e3))
    app.use((req, res, next) => {
        if (!req.timedout) next()
    })

    // 静态资源拦截
    app.use(express.static(path.join(__dirname, 'static')))

    // Hook官方请求并修改
    app.use((request, response, next) => {
        if (!hook.process(host, request, response)) {
            next()
        }
    })

    // openclash服务
    app.use((request, response, next) => {
        if (!Handle.process(request, response)) {
            next()
        }
    })

    // 反向代理（其他请求交给官方服务处理）
    // eg:将/api/test 代理到 ${HOST}/api/test
    app.use(proxy('/', { target: host }))

    // 监听端口
    app.listen(app.get('port'), async () => {
        utils.log(`server running @${app.get('port')}`)
        await iptables.node.start()
        await service.process('GET', 'start')
    })
}

// 获取命令行参数数组
const [type, cmd] = process.argv.slice(2)
switch (type) {
    case 'start':
        start()
        break
    case 'stop':
        service.process('GET', 'kill')
        break
    default:
        console.log('请指定正确的参数:start/stop')
}
