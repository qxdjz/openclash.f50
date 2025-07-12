import fs from 'fs'
import yaml from 'js-yaml'
import utils from '../utils'

const file = utils.dir() + '/.yaml'

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export default class Config {
    /**
     * 读取资源
     * @param {*} obj
     * @param {*} key：非必填，无则全量读取
     * @returns
     */
    public static get = (obj: any, key?: string) => {
        if (!key || key.length === 0) {
            return obj
        }

        const ks = key.split('/')
        let temp = obj
        if (ks) {
            for (var k of ks) {
                temp = temp[k]
                if (!temp) {
                    break
                }
            }
        }
        return temp
    }

    /**
     * 创建新资源
     * @param {*} params: ""
     * @returns
     */
    public static post = (params: string) => {
        if (params.length === 0) {
            fs.writeFileSync(file, '')
            return {}
        }

        const json = JSON.parse(params)

        // 保存文件
        if (typeof json === 'object') {
            if (Object.keys(json).length === 0) {
                fs.writeFileSync(file, '')
                return {}
            }
            fs.writeFileSync(file, yaml.dump(json))
        } else {
            throw '仅支持json数据结构'
        }

        return json
    }

    /**
     * 按key创建（有则更新，无则创建）
     * @param {*} obj
     * @param {*} key：必填
     * @param {*} params: ""
     * @returns
     */
    public static put = (obj: any, key: string, params: string) => {
        if (params.length > 0) {
            try {
                params = JSON.parse(params)
            } catch {
                //
            }
        }

        var ks = key.split('/')
        var temp = obj
        for (var i = 0; i < ks.length - 1; i++) {
            var k = ks[i]
            if (temp[k]) {
                temp = temp[k]
                continue
            }
            // 对象不存在，需创建
            temp[k] = {}
            temp = temp[k]
        }
        temp[ks[ks.length - 1]] = params

        // 保存文件
        fs.writeFileSync(file, yaml.dump(obj))

        return params
    }

    /**
     * 按key更新（有则更新，无则报错）
     * @param {*} obj
     * @param {*} key：必填
     * @param {*} params: ""
     * @returns
     */
    public static patch = (obj: any, key: string, params: string) => {
        if (params.length > 0) {
            try {
                params = JSON.parse(params)
            } catch {
                //
            }
        }

        var ks = key.split('/')
        var temp = obj
        for (var i = 0; i < ks.length - 1; i++) {
            var k = ks[i]

            if (!Object.keys(temp).includes(k)) {
                throw `不存在待更新的${k}`
            }

            if (temp[k]) {
                temp = temp[k]
                continue
            }
            // 对象不存在
            throw `不存在待更新的${ks[i + 1]}`
        }

        if (!Object.keys(temp).includes(ks[ks.length - 1])) {
            throw `不存在待更新的${ks[ks.length - 1]}`
        }

        temp[ks[ks.length - 1]] = params

        // 保存文件
        fs.writeFileSync(file, yaml.dump(obj))

        return params
    }

    /**
     * 按key删除（有则删除，无则报错）
     * @param {*} obj
     * @param {*} key: 非必填，不填写清空所有
     * @returns
     */
    public static del = (obj: any, key?: string) => {
        if (!key) {
            // 清空文件
            fs.writeFileSync(file, '')
            return true
        }

        var ks = key.split('/')
        var temp = obj
        for (var i = 0; i < ks.length - 1; i++) {
            var k = ks[i]

            if (!Object.keys(temp).includes(k)) {
                throw `不存在待删除的${k}`
            }

            if (temp[k]) {
                temp = temp[k]
                continue
            }
            // 对象不存在
            throw `不存在待删除的${ks[i + 1]}`
        }

        if (!Object.keys(temp).includes(ks[ks.length - 1])) {
            throw `不存在待删除的${ks[ks.length - 1]}`
        }

        delete temp[ks[ks.length - 1]]

        // 保存文件
        fs.writeFileSync(file, yaml.dump(obj))

        return true
    }

    /**
     * 处理服务器请求
     * @param {*} method GET：获取一个资源 POST：创建一个资源 PUT：更新全量资源 PATCH：更新部分资源 DELETE：删除资源
     * @param {*} key
     * @param {*} params: string, {}, true, 123
     * @returns
     */
    public static process = async (method: Method, key: string, params: string) => {
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, '')
        }

        var content = fs.readFileSync(file, 'utf-8')
        var obj = yaml.load(content)
        if (!obj || obj === null) {
            obj = {}
        }

        if (method === 'GET') {
            return JSON.stringify({ code: 1, data: Config.get(obj, key) })
        }

        if (method === 'POST') {
            if (key && key.length > 0) {
                return JSON.stringify({ code: 0, msg: `不能指定资源id:${key}` })
            }

            return JSON.stringify({ code: 1, data: Config.post(params) })
        }

        if (method === 'PUT') {
            if (!key || key.length == 0) {
                return JSON.stringify({ code: 0, msg: '资源id不能为空' })
            }

            return JSON.stringify({ code: 1, data: Config.put(obj, key, params) })
        }

        if (method === 'PATCH') {
            if (!key || key.length == 0) {
                return JSON.stringify({ code: 0, msg: '资源id不能为空' })
            }

            return JSON.stringify({ code: 1, data: Config.patch(obj, key, params) })
        }

        if (method === 'DELETE') {
            return JSON.stringify({ code: 1, data: Config.del(obj, key) })
        }

        return JSON.stringify({ code: 0, data: key, msg: '404' })
    }

    public static async read(key: string) {
        const { code, data } = JSON.parse(await Config.process('GET', key, ''))
        if (code === 1) {
            return data
        }
    }
}
