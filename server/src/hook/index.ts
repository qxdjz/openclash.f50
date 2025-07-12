import fs from 'fs'
import utils from '../utils'

export default class Hook {
    public static process = (proxy: string, request: any, response: any) => {
        const { url } = request

        if (utils.match(url, '/js/config/ufi/MU5002/menu.js').flag) {
            const file = `${utils.dir('static')}/.menu.js`
            utils.download(`${proxy}/js/config/ufi/MU5002/menu.js`, file).then((success) => {
                if (success) {
                    const content = fs.readFileSync(file).toString()
                    const middle = content.indexOf('[')
                    const insert = '{hash:"#clash",path:"clash",level:"",requireLogin:!0,checkSIMStatus:!1},'

                    response.writeHead(200, { 'Content-Type': 'application/x-javascript' })
                    response.end(
                        `${content.substring(0, middle + 1)}${insert}${content.substring(middle + 1, content.length)}`
                    )
                } else {
                    response.end('hook menu js fail')
                }
            })

            return true
        }
        if (utils.match(url, '/index.html').flag) {
            const file = `${utils.dir('static')}/.index.html`
            utils.download(`${proxy}/index.html`, file).then((success) => {
                if (success) {
                    const content = fs.readFileSync(file).toString()
                    const middle = content.indexOf('</body>')
                    const insert = '<script type="text/javascript" src="hook.js"></script>'
                    response.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' })
                    response.end(`${content.substring(0, middle)}${insert}${content.substring(middle, content.length)}`)
                } else {
                    response.end('hook index html fail')
                }
            })

            return true
        }
        if (utils.match(url, '/js/clash.js').flag) {
            response.writeHead(200, { 'Content-Type': 'application/javascript; charset=UTF-8' })
            response.end(
                `define(["jquery","knockout","service","underscore"],function(o,n,r,e){return{init:function(){$.get("./clash.js",function(data,status){eval(data)})},}});`
            )
            return true
        }
        if (utils.match(url, '/tmpl/clash.html').flag) {
            response.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' })
            response.end('')
            return true
        }

        return false
    }
}
