const http = require('./server')
const service = require('./service')
const config = require('./yaml')

const init = async () => {
    // 获取命令行参数数组
    const [type, cmd] = process.argv.slice(2)

    switch (type) {
        case 'listen':
            const gateway = await config.read('gateway')
            http.start(gateway ?? 'http://192.168.0.1:8080', '3300')
            break
        case 'service':
            service.process('GET', cmd)
            break
        default:
            console.log('请指定正确的参数:listen/service')
    }
}
init()
