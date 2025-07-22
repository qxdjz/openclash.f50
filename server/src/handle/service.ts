import config, { Method } from './config'
import fs from 'fs'
import yaml from 'js-yaml'
import utils from '../utils'
import iptables from '../iptables'
import { deep } from './deep'

const dir = utils.dir('download')
const runDir = utils.dir('run')

function isNotEmpty(value?: string) {
    return value && value.length > 0
}

async function merge() {
    utils.log(`准备合并配置文件`)
    const name = await config.read('name')
    if (!name || name.length === 0) {
        utils.log(`暂未指定配置名称`)
        return false
    }
    utils.log(`指定配置名称为${name}`)
    var content = fs.readFileSync(`${dir}/${name}/config.yaml`, 'utf-8')

    var obj: any = yaml.load(content)
    if (!obj || obj === null) {
        utils.log(`原始配置文件不存在:${dir}/${name}/config.yaml`)
        return false
    }

    utils.log(`读取配置文件成功:${dir}/${name}`)
    const subs = (await config.read('subs')) ?? []
    for (let i = 0; i < subs.length; i++) {
        if (subs[i].name === name) {
            const js = subs[i].override
            if (js && js.length > 0) {
                utils.log('按照订阅复写配置，准备修改配置文件')
                deep(js, obj)
                utils.log('按照订阅复写配置，修改配置文件成功')
            }

            break
        }
    }

    // 默认设置
    obj['tproxy-port'] = 7893
    obj['external-ui'] = './ui'
    obj['external-controller'] = `0.0.0.0:9091`
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

    utils.log('默认配置注入成功')

    const cc: {
        enable?: boolean
        debug_level?: string[]
        dns_listen_port?: string
        proxy_port?: string
        tproxy_port?: string
        http_port?: string
        socks5_port?: string
        mix_port?: string
        external_port?: string
        external_secret?: string
    } = await config.read('setting/config')

    if (cc) {
        //isNotEmpty(overrite.tproxy) && (obj['tproxy-port'] = Number(overrite.tproxy))
        //isNotEmpty(overrite.dns) && (obj['dns']['listen'] = `0.0.0.0:${overrite.dns}`)
        isNotEmpty(cc.proxy_port) && (obj['redir-port'] = Number(cc.proxy_port))
        isNotEmpty(cc.http_port) && (obj['port'] = Number(cc.http_port))
        isNotEmpty(cc.socks5_port) && (obj['socks-port'] = Number(cc.socks5_port))
        isNotEmpty(cc.mix_port) && (obj['mixed-port'] = Number(cc.mix_port))

        isNotEmpty(cc.external_port) && (obj['external-controller'] = `0.0.0.0:${cc.external_port}`)
        isNotEmpty(cc.external_secret) && (obj['secret'] = cc.external_secret)

        isNotEmpty(cc.debug_level?.[0]) && (obj['log-level'] = cc.debug_level?.[0])

        utils.log(`插件复写配置成功:${JSON.stringify(cc)}`)
    }

    if (fs.existsSync(`${dir}/${name}/cache.db`)) {
        fs.unlinkSync(`${dir}/${name}/cache.db`)
    }
    utils.copy(`${dir}/${name}`, runDir)
    await utils.exec(`${utils.cmd.unzip} -o ${utils.dir('static')}/ui.zip -d ${runDir}`)
    fs.writeFileSync(`${runDir}/config.yaml`, yaml.dump(obj), { encoding: 'utf-8' })

    utils.log('准备测试配置文件是否正确')
    const check = await utils.exec(`${utils.cmd.mihomo} -t -d ${runDir}`)
    utils.log(check)

    return true
}

export default class Service {
    public static process = async (method: Method, url: string, params?: string) => {
        if (method === 'GET') {
            if (url === 'start') {
                await utils.exec(`${utils.cmd.kill} mihomo >> /dev/null 2>&1`, true)
                await utils.sleep(1000)
                await iptables.mihomo.stop()

                if ((await config.read('setting/config/enable')) === false) {
                    utils.log('代理总开关未开启')
                    return JSON.stringify({
                        code: 0,
                        msg: '代理总开关未开启'
                    })
                }

                const success = await merge()
                if (!success) {
                    return JSON.stringify({
                        code: 0,
                        msg: '启动失败,请查看启动日志'
                    })
                }

                utils.log('正在启动代理服务')
                await utils.exec(`${utils.cmd.nohup} ${utils.cmd.mihomo} -d ${runDir} > ${runDir}/mihomo.log 2>&1 &`)
                await utils.sleep(2000)
                await iptables.mihomo.start()
                utils.log('请检查代理服务启动状态')
                return JSON.stringify({
                    code: 1,
                    data: await utils.exec(`${utils.cmd.pidof}  mihomo`),
                    msg: '请检查启动状态'
                })
            }

            if (url === 'stop') {
                utils.log('正在停止代理服务')
                await utils.exec(`${utils.cmd.kill} mihomo >> /dev/null 2>&1`, true)
                await utils.sleep(1000)
                await iptables.mihomo.stop()
                utils.log('请检查代理服务停止状态')
                return JSON.stringify({
                    code: 1,
                    data: await utils.exec(`${utils.cmd.pidof}  mihomo`),
                    msg: '请检查停止状态'
                })
            }

            if (url === 'kill') {
                utils.log('正在卸载插件')
                await iptables.mihomo.stop()
                await iptables.node.stop()
                await utils.exec(`${utils.cmd.kill} mihomo >> /dev/null 2>&1`, true)
                await utils.exec(`${utils.cmd.kill} node >> /dev/null 2>&1`, true)
                utils.log('卸载插件完成')
            }
        }
        return JSON.stringify({ code: 0, data: url, msg: '404' })
    }
}
