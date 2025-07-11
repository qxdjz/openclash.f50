const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const utils = require('./lib/utils')

module.exports = {
    process: async (method, url, params) => {
        if (method === 'POST') {
            if (url === 'update') {
                if (params.length === 0) {
                    return JSON.stringify({ code: 0, msg: '订阅地址不能为空' })
                }

                const { name, url, includes, excludes, invalides } = JSON.parse(params)
                if (!url || url.length === 0) {
                    return JSON.stringify({ code: 0, msg: '订阅地址不能为空' })
                }
                if (!name || name.length === 0) {
                    return JSON.stringify({ code: 0, msg: '订阅名称不能为空' })
                }

                const dir = utils.dir(path.join('download', name))
                const configFile = path.join(dir, 'config.yaml')

                const flag = await utils.download(url, configFile)

                if (!flag) {
                    return `文件下载失败:${url}`
                }

                const content = fs.readFileSync(configFile, 'utf8')

                const obj = yaml.load(content)
                if (!obj || obj === null) {
                    return JSON.stringify({ code: 0, msg: '配置文件下载失败' })
                }

                const rules = obj['rule-providers']
                if (rules) {
                    const keys = Object.keys(rules)
                    for (let i = 0; i < keys.length; i++) {
                        const { path, url } = rules[keys[i]]
                        if (path && url) {
                            const ruleDir = `${dir}/${path.substring(0, path.lastIndexOf('/'))}`
                            fs.mkdirSync(ruleDir, { recursive: true })

                            const flag = await utils.download(url, `${dir}/${path}`)
                            if (!flag) {
                                return `文件下载失败:${url}`
                            }
                        }
                    }
                }

                const nodeOf = (proxy, filter) => {
                    return proxy && proxy.name && proxy.name.indexOf(filter) >= 0
                }

                let allProxy = obj['proxies'] ?? []
                let proxys = allProxy
                if (includes && includes.length > 0) {
                    // 保留节点
                    const nodes = includes.split(',')
                    utils.log(`保留节点：${nodes} 保留前共${proxys.length}个节点`)

                    proxys = proxys.filter((item) => {
                        const l = nodes.filter((f) => {
                            return nodeOf(item, f)
                        })
                        return l.length > 0
                    })

                    utils.log(`保留后共${proxys.length}个节点`)
                }

                // 过滤节点
                let nodes = invalides ?? []
                if (excludes && excludes.length > 0) {
                    nodes = [...nodes, ...(excludes.split(',') ?? [])]
                }
                utils.log(`排除节点：${nodes} 排除前共${proxys.length}个节点`)
                proxys = proxys.filter((item) => {
                    const l = nodes.filter((f) => {
                        return nodeOf(item, f)
                    })
                    return l.length === 0
                })
                utils.log(`排除后共${proxys.length}个节点`)

                obj['proxies'] = proxys

                const excludeProxys = allProxy.filter((p) => {
                    return (
                        proxys.filter((i) => {
                            return i.name === p.name
                        }).length === 0
                    )
                })

                const inExcludeProxy = (p) => {
                    const list = excludeProxys.filter((item) => {
                        return p === item.name
                    })
                    return list.length > 0
                }

                const groups = obj['proxy-groups'] ?? []
                for (let i = 0; i < groups.length; i++) {
                    const { proxies } = groups[i]

                    groups[i].proxies = proxies?.filter((p) => {
                        return !inExcludeProxy(p)
                    })
                }

                fs.writeFileSync(`${dir}/config.yaml`, yaml.dump(obj), { encoding: 'utf-8' })
                utils.copy(utils.dir('db'), dir)
                return await utils.exec(`${utils.cmd.mihomo} -t -d ${dir}`)
            }
        }

        return JSON.stringify({ code: 0, data: url, msg: '404' })
    }
}
