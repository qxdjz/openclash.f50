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

                const json = JSON.parse(params)
                if (!json.url || json.url.length === 0) {
                    return JSON.stringify({ code: 0, msg: '订阅地址不能为空' })
                }
                if (!json.name || json.name.length === 0) {
                    return JSON.stringify({ code: 0, msg: '订阅名称不能为空' })
                }

                const dir = utils.dir(path.join('download', json.name))
                const configFile = path.join(dir, 'config.yaml')

                const flag = await utils.download(json.url, configFile)

                if (!flag) {
                    return `文件下载失败:${json.url}`
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

                utils.copy(utils.dir('db'), dir)
                return await utils.exec(`${utils.cmd.mihomo} -t -d ${dir}`)
            }
        }

        return JSON.stringify({ code: 0, data: url, msg: '404' })
    }
}
