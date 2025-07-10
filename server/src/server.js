const express = require('express')
const timeout = require('connect-timeout')
const proxy = require('http-proxy-middleware')
const app = express()
const path = require('path')

const yaml = require('./yaml')
const shell = require('./shell')
const service = require('./service')
const subscribe = require('./subscribe')
const iptables = require('./iptables')
const utils = require('./lib/utils')

function start(host, port) {
    // 超时时间
    const TIME_OUT = 90 * 1e3

    // 设置端口
    app.set('port', port)

    // 设置超时 返回超时响应
    app.use(timeout(TIME_OUT))
    app.use((req, res, next) => {
        if (!req.timedout) next()
    })

    app.use((request, response, next) => {
        //delete require.cache[require.resolve('./hook')]
        if (!require('./hook').hook(host, request, response)) {
            next()
        }
    })

    app.use((request, response, next) => {
        if (!handle(request, response)) {
            next()
        }
    })

    // 资源拦截
    app.use(express.static(path.join(__dirname, 'static')))

    // 反向代理（这里把需要进行反代的路径配置到这里即可）
    // eg:将/api/test 代理到 ${HOST}/api/test
    app.use(proxy('/', { target: host }))

    // 监听端口
    app.listen(app.get('port'), async () => {
        utils.log(`server running @${app.get('port')}`)
        await iptables.node.start()
        await service.process('GET', 'start')
    })
}

function handle(request, response) {
    if (!request.url.startsWith('/node/')) {
        return false
    }
    var params = ''
    request.on('data', (chunk) => {
        params += chunk
    })
    request.on('end', async () => {
        try {
            response.setHeader('Access-Control-Allow-Origin', '*')
            response.setHeader('Access-Control-Allow-Headers', 'X-Rquested-With')
            response.setHeader('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
            response.writeHead(200, { 'Content-Type': 'application/json;charset:utf-8' })

            const { method, url } = request
            utils.log(`${method}[${url}]`)

            if (url.indexOf('?') >= 0) {
                response.end(JSON.stringify({ code: 0, data: url, msg: '不支持请求url携带参数' }))
                return
            }

            {
                const { flag, key } = utils.match(url, '/node/yaml')
                if (flag) {
                    response.end(await yaml.process(method, key, params))
                    return
                }
            }

            {
                const { flag, key } = utils.match(url, '/node/shell')
                if (flag) {
                    response.end(await shell.process(method, key, params))
                    return
                }
            }

            {
                const { flag, key } = utils.match(url, '/node/service')
                if (flag) {
                    response.end(await service.process(method, key, params))
                    return
                }
            }

            {
                const { flag, key } = utils.match(url, '/node/subscribe')
                if (flag) {
                    response.end(await subscribe.process(method, key, params))
                    return
                }
            }

            response.end(JSON.stringify({ code: 0, data: url, msg: '404' }))
        } catch (e) {
            utils.log(e)
            response.end(JSON.stringify({ code: 0, msg: `执行异常：${e}` }))
        }
    })
    return true
}

module.exports = {
    start
}
