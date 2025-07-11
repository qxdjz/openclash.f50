import fs from 'fs'
import utils from '../utils'
import { Method } from './config'

export default class Shell {
    public static process = async (method: Method, url: string, params?: string) => {
        if (method === 'GET') {
            {
                const { flag, key } = utils.match(url, 'status')
                if (flag) {
                    // 运行状态
                    const node = await utils.exec(`${utils.cmd.pidof} node`, true)
                    const mihomo = await utils.exec(`${utils.cmd.pidof} mihomo`, true)

                    return JSON.stringify({ code: 1, data: { node, mihomo }, msg: '读取状态成功' })
                }
            }

            {
                const { flag, key } = utils.match(url, 'run')
                if (flag && key && key.length > 0) {
                    if (fs.existsSync(`${utils.dir('run')}/${key}`)) {
                        const content = fs.readFileSync(`${utils.dir('run')}/${key}`).toString()

                        return JSON.stringify({ code: 1, data: content })
                    } else {
                        return JSON.stringify({ code: 0, msg: `文件不存在:${utils.dir('run')}/${key}` })
                    }
                }
            }

            {
                const { flag, key } = utils.match(url, 'download')
                if (flag && key && key.length > 0) {
                    if (fs.existsSync(`${utils.dir('download')}/${key}`)) {
                        const content = fs.readFileSync(`${utils.dir('download')}/${key}`).toString()

                        return JSON.stringify({ code: 1, data: content })
                    } else {
                        return JSON.stringify({ code: 0, msg: `文件不存在:${utils.dir('download')}/${key}` })
                    }
                }
            }
        }

        return JSON.stringify({ code: 0, data: url, msg: '404' })
    }
}
