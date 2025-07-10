const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')
const child = require('child_process')

// const cmd = {
//     mihomo: path.dirname(__filename) + '/../../test/bin/mihomo',
//     pidof: 'ps -e | grep',
//     kill: '/usr/bin/killall',
//     nohup: '/usr/bin/nohup'
// }

const cmd = {
    mihomo: '/data/adb/openclash/bin/mihomo',
    pidof: '/system/bin/pidof',
    kill: '/system/bin/killall',
    nohup: '/system/bin/nohup',
    iptables: '/system/bin/iptables',
    unzip: '/system/bin/unzip',
    ip: '/system/bin/ip'
}

function formatTime(date) {
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    let hours = date.getHours()
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()

    month = month < 10 ? '0' + month : month
    day = day < 10 ? '0' + day : day
    hours = hours < 10 ? '0' + hours : hours
    minutes = minutes < 10 ? '0' + minutes : minutes
    seconds = seconds < 10 ? '0' + seconds : seconds

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const log = (args) => {
    const time = formatTime(new Date())
    console.log(time, args)
    fs.appendFileSync(`${dir('run')}/node.log`, `${time}:${args}\r\n`)
}

const exec = async (cmd, ignore) => {
    return new Promise((resolve) => {
        child.exec(cmd, (error, stdout, stderr) => {
            if (error && !ignore) {
                log(error)
            }
            resolve(stdout)
        })
    })
}

const dir = (sub) => {
    const dir = path.dirname(__filename)
    fs.mkdirSync(dir, { recursive: true })

    if (sub) {
        fs.mkdirSync(path.join(dir, sub), { recursive: true })
        return path.join(dir, sub)
    } else {
        return dir
    }
}

const copy = (src, dest) => {
    fs.mkdirSync(dest, { recursive: true })
    fs.readdirSync(src).forEach((item) => {
        const srcPath = path.join(src, item)
        const destPath = path.join(dest, item)
        if (fs.lstatSync(srcPath).isDirectory()) {
            copy(srcPath, destPath)
        } else {
            fs.copyFileSync(srcPath, destPath)
        }
    })
}

module.exports = {
    log,
    exec,
    dir,
    copy,
    cmd,
    match: (url, m) => {
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
        return { flag: false }
    },
    sleep: async (ms) => {
        return new Promise((resolve) => setTimeout(resolve, ms))
    },
    download: async (url, filePath) => {
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
                        log(`文件下载完成[${url}]`)
                    })
                } else {
                    resolve(false)
                    log(`下载失败[${url}]: ${response.statusCode}`)
                }
            }).on('error', (err) => {
                resolve(false)
                log(`下载出错[${url}]: ${err?.message}`)
            })
        })
    }
}
