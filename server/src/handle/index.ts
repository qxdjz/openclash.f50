import service from './service'
import shell from './shell'
import subscribe from './subscribe'
import config from './config'
import utils from '../utils'

export default class Handle {
    public static process = (request: any, response: any) => {
        if (!request.url.startsWith('/node/')) {
            return false
        }
        var params = ''
        request.on('data', (chunk: any) => {
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
                        response.end(await config.process(method, key, params))
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
}
