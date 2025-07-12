import fs from 'fs'
import path from 'path'
import http from 'http'
import https from 'https'
import child from 'child_process'

export default class Utils {
    // public static cmd = {
    //     mihomo: 'echo',
    //     pidof: 'echo',
    //     kill: 'echo',
    //     nohup: 'echo',
    //     iptables: 'echo',
    //     unzip: 'echo',
    //     ip: 'echo',
    //     dir: '/../node_modules/@abc',
    //     ipv6: '/tmp/disable_ipv6'
    // }

    public static cmd = {
        mihomo: '/data/adb/openclash/bin/mihomo',
        pidof: '/system/bin/pidof',
        kill: '/system/bin/killall',
        nohup: '/system/bin/nohup',
        iptables: '/system/bin/iptables',
        unzip: '/system/bin/unzip',
        ip: '/system/bin/ip',
        dir: '',
        ipv6: '/proc/sys/net/ipv6/conf/br0/disable_ipv6'
    }

    public static formatTime(date: Date) {
        let year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        let hours = date.getHours()
        let minutes = date.getMinutes()
        let seconds = date.getSeconds()

        return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day} ${
            hours < 10 ? '0' + hours : hours
        }:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
    }

    public static log = (...args: any[]) => {
        const time = Utils.formatTime(new Date())
        console.log(time, args)
        fs.appendFileSync(`${Utils.dir('run')}/node.log`, `${time}:${args}\r\n`)
    }

    public static exec = async (cmd: string, ignore?: boolean) => {
        return new Promise<string>((resolve) => {
            child.exec(cmd, (error, stdout, stderr) => {
                if (error && !ignore) {
                    Utils.log(error)
                }
                resolve(stdout)
            })
        })
    }

    public static dir = (sub?: string) => {
        const dir = path.dirname(__filename) + Utils.cmd.dir
        fs.mkdirSync(dir, { recursive: true })

        if (sub) {
            fs.mkdirSync(path.join(dir, sub), { recursive: true })
            return path.join(dir, sub)
        } else {
            return dir
        }
    }

    public static copy = (src: string, dest: string) => {
        fs.mkdirSync(dest, { recursive: true })
        fs.readdirSync(src).forEach((item) => {
            const srcPath = path.join(src, item)
            const destPath = path.join(dest, item)
            if (fs.lstatSync(srcPath).isDirectory()) {
                Utils.copy(srcPath, destPath)
            } else {
                fs.copyFileSync(srcPath, destPath)
            }
        })
    }

    public static match = (url: string, m: string) => {
        if (url.startsWith(m)) {
            var key = url.replace(m, '')
            if (key.startsWith('/')) {
                key = key.substring(1, key.length)
            }
            if (key.endsWith('/')) {
                key = key.substring(0, key.length - 1)
            }
            return { flag: true, key }
        }
        return { flag: false, key: '' }
    }

    public static sleep = async (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    public static download = async (url: string, filePath: string) => {
        return new Promise((resolve) => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
            const { protocol } = new URL(url)
            const d = protocol.includes('https') ? https : http

            d.get(url, (response) => {
                if (response.statusCode === 200) {
                    const fileStream = fs.createWriteStream(filePath)
                    response.pipe(fileStream)

                    fileStream.on('finish', () => {
                        fileStream.close()
                        resolve(true)
                        Utils.log(`文件下载完成[${url}]`)
                    })
                } else {
                    resolve(false)
                    Utils.log(`下载失败[${url}]: ${response.statusCode}`)
                }
            }).on('error', (err) => {
                resolve(false)
                Utils.log(`下载出错[${url}]: ${err?.message}`)
            })
        })
    }
}
