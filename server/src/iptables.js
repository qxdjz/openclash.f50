const fs = require('fs')
const config = require('./yaml')
const utils = require('./lib/utils')
const iptables = `${utils.cmd.iptables} -w 100`
const ip = `${utils.cmd.ip}`

const mark_id = '16777216/16777216'
const table_id = '2024'

const node_start = async () => {
    await node_stop()
    await utils.sleep(200)

    const pid = await utils.exec(`${utils.cmd.pidof} node`)
    if (!pid || pid.length === 0) {
        utils.log('服务未启动,跳过设置初始化路由表')
        return
    }

    const gateway = await config.read('gateway')
    await utils.exec(`${iptables} -t nat -N BOX_ND`)
    await utils.exec(`${iptables} -t nat -F BOX_ND`)
    await utils.exec(
        `${iptables} -t nat -A BOX_ND -p tcp -d ${
            gateway ?? '192.168.0.1'
        } --dport 80 -j DNAT --to-destination 192.168.0.1:3300`
    )
    await utils.exec(`${iptables} -t nat -I PREROUTING -i br+ -j BOX_ND`)

    await node_status('初始化路由表设置成功')
}
const node_stop = async () => {
    await utils.exec(`${iptables} -t nat -D PREROUTING -i br+ -j BOX_ND >> /dev/null 2>&1`, true)
    await utils.exec(`${iptables} -t nat -F BOX_ND >> /dev/null 2>&1`, true)
    await utils.exec(`${iptables} -t nat -X BOX_ND >> /dev/null 2>&1`, true)

    await node_status('初始化路由表清理成功')
}

const node_status = async (tag) => {
    const result = await utils.exec(`${iptables} -t nat -nvL BOX_ND`, true)
    tag && utils.log(tag)
    result && utils.log(result)

    return result
}

const mihomo_start = async () => {
    await mihomo_stop()
    await utils.sleep(200)

    const pid = await utils.exec(`${utils.cmd.pidof} mihomo`)
    if (!pid || pid.length === 0) {
        utils.log('Clash服务未启动,跳过设置Lan口代理路由表')
        return
    }

    await utils.exec(`${ip} rule add fwmark ${mark_id} table ${table_id} pref ${table_id}`)
    await utils.exec(`${ip} route add local default dev lo table ${table_id}`)

    const tproxy_port = '7893'
    const skip_ips = ['127.0.0.0/8', '192.168.0.0/16', '224.0.0.0/3', '255.255.255.255/32']
    await utils.exec(`${iptables} -t mangle -N BOX`)
    await utils.exec(`${iptables} -t mangle -F BOX`)
    for (let i = 0; i < skip_ips.length; i++) {
        await utils.exec(`${iptables} -t mangle -A BOX -d ${skip_ips[i]} -j RETURN`)
    }
    await utils.exec(`${iptables} -t mangle -A BOX -p tcp -j TPROXY --on-port ${tproxy_port} --tproxy-mark ${mark_id}`)
    await utils.exec(`${iptables} -t mangle -A BOX -p udp -j TPROXY --on-port ${tproxy_port} --tproxy-mark ${mark_id}`)
    await utils.exec(`${iptables} -t mangle -I PREROUTING -i br+ -j BOX`)

    const clash_dns_port = '1053'
    await utils.exec(`${iptables} -t nat -N BOX_DNS`)
    await utils.exec(`${iptables} -t nat -F BOX_DNS`)
    await utils.exec(`${iptables} -t nat -A BOX_DNS -p udp --dport 53 -j REDIRECT --to-ports ${clash_dns_port}`)
    await utils.exec(`${iptables} -t nat -I PREROUTING -i br+ -j BOX_DNS`)

    fs.writeFileSync('/proc/sys/net/ipv6/conf/br0/disable_ipv6', '1')
    await mihomo_status('Lan口代理路由表设置成功')
}

const mihomo_stop = async () => {
    await utils.exec(`${ip} rule del fwmark ${mark_id} table ${table_id} pref ${table_id} >> /dev/null 2>&1`, true)
    await utils.exec(`${ip} route flush table ${table_id} >> /dev/null 2>&1`, true)

    await utils.exec(`${iptables} -t mangle -D PREROUTING -i br+ -j BOX >> /dev/null 2>&1`, true)
    await utils.exec(`${iptables} -t mangle -F BOX >> /dev/null 2>&1`, true)
    await utils.exec(`${iptables} -t mangle -X BOX >> /dev/null 2>&1`, true)

    await utils.exec(`${iptables} -t nat -D PREROUTING -i br+ -j BOX_DNS >> /dev/null 2>&1`, true)
    await utils.exec(`${iptables} -t nat -F BOX_DNS >> /dev/null 2>&1`, true)
    await utils.exec(`${iptables} -t nat -X BOX_DNS >> /dev/null 2>&1`, true)

    fs.writeFileSync('/proc/sys/net/ipv6/conf/br0/disable_ipv6', '0')
    await mihomo_status('Lan口代理路由表清理成功')
}

const mihomo_status = async (tag) => {
    const proxy = await utils.exec(`${iptables} -t mangle -nvL BOX`, true)
    const dns = await utils.exec(`${iptables} -t nat -nvL BOX_DNS`, true)
    tag && utils.log(tag)
    proxy && utils.log(proxy)
    dns && utils.log(dns)

    return { proxy, dns }
}

module.exports = {
    node: {
        start: node_start,
        stop: node_stop,
        status: node_status
    },
    mihomo: {
        start: mihomo_start,
        stop: mihomo_stop,
        status: mihomo_status
    }
}
