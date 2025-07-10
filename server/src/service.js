const fs = require('fs')
const yaml = require('js-yaml')
const config = require('./yaml')
const iptables = require('./iptables')
const utils = require('./lib/utils')
const dir = utils.dir('download')
const runDir = utils.dir('run')

function isNotEmpty(value) {
    return value && value.length > 0
}

async function _read(key) {
    const { code, data } = JSON.parse(await config.process('GET', key, ''))
    if (code === 1) {
        return data
    }
}

async function merge() {
    const name = await _read('name')
    if (!name || name.length === 0) {
        utils.log(`暂未指定配置名称`)
        return false
    }

    var content = fs.readFileSync(`${dir}/${name}/config.yaml`, 'utf-8')

    var obj = yaml.load(content)
    if (!obj || obj === null) {
        utils.log(`原始配置文件不存在:${dir}/${name}/config.yaml`)
        return false
    }

    obj['tproxy-port'] = 7893
    obj['external-ui'] = './ui'
    obj['allow-lan'] = true
    obj['bind-address'] = '*'
    obj['ipv6'] = false
    if (!obj['dns']) {
        obj['dns'] = {}
    }
    obj['dns']['enable'] = true
    obj['dns']['ipv6'] = false
    obj['dns']['listen'] = '0.0.0.0:1053'
    obj['dns']['enhanced-mode'] = 'redir-host'

    delete obj['routing-mark']

    const setting = await _read('setting')
    if (setting) {
        var { overrite, external } = setting

        if (overrite) {
            //isNotEmpty(overrite.tproxy) && (obj['tproxy-port'] = Number(overrite.tproxy))
            //isNotEmpty(overrite.dns) && (obj['dns']['listen'] = `0.0.0.0:${overrite.dns}`)
            isNotEmpty(overrite.proxy) && (obj['redir-port'] = Number(overrite.proxy))
            isNotEmpty(overrite.http) && (obj['port'] = Number(overrite.http))
            isNotEmpty(overrite.socks5) && (obj['socks-port'] = Number(overrite.socks5))
            isNotEmpty(overrite.mix) && (obj['mixed-port'] = Number(overrite.mix))
        }

        if (external) {
            isNotEmpty(external.port) && (obj['external-controller'] = `0.0.0.0:${external.port}`)
            isNotEmpty(external.secret) && (obj['secret'] = external.secret)
        }
    }

    utils.copy(`${dir}/${name}`, runDir)
    await utils.exec(`${utils.cmd.unzip} -o ${utils.dir('static')}/ui.zip -d ${runDir}`)
    fs.writeFileSync(`${runDir}/config.yaml`, yaml.dump(obj), { encoding: 'utf-8' })

    const check = await utils.exec(`${utils.cmd.mihomo} -t -d ${runDir}`)
    utils.log(check)

    return true
}

module.exports = {
    process: async (method, url, params) => {
        if (method === 'GET') {
            if (url === 'start') {
                const success = await merge()
                if (!success) {
                    return JSON.stringify({
                        code: 0,
                        msg: '启动失败,请查看启动日志'
                    })
                }
                await utils.exec(`${utils.cmd.kill} mihomo >> /dev/null 2>&1`, true)
                await utils.sleep(1000)
                await utils.exec(`${utils.cmd.nohup} ${utils.cmd.mihomo} -d ${runDir} > ${runDir}/mihomo.log 2>&1 &`)
                await utils.sleep(2000)
                await iptables.mihomo.start()
                return JSON.stringify({
                    code: 1,
                    data: await utils.exec(`${utils.cmd.pidof}  mihomo`),
                    msg: '请检查启动状态'
                })
            }

            if (url === 'stop') {
                await utils.exec(`${utils.cmd.kill} mihomo >> /dev/null 2>&1`, true)
                await utils.sleep(1000)
                await iptables.mihomo.stop()
                return JSON.stringify({
                    code: 1,
                    data: await utils.exec(`${utils.cmd.pidof}  mihomo`),
                    msg: '请检查停止状态'
                })
            }

            if (url === 'clear') {
                await iptables.mihomo.stop()
                await iptables.node.stop()
                await utils.exec(`${utils.cmd.kill} mihomo >> /dev/null 2>&1`, true)
                await utils.exec(`${utils.cmd.kill} node >> /dev/null 2>&1`, true)
            }
        }
        return JSON.stringify({ code: 0, data: url, msg: '404' })
    }
}
