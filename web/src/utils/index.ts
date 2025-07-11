import { Toast } from "antd-mobile"

/**
 * 工具类
 */
export class Utils {
    public static formatTime(date: Date) {
        let year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        let hours = date.getHours()
        let minutes = date.getMinutes()
        let seconds = date.getSeconds()

        return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day} ${hours < 10 ? '0' + hours : hours
            }:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
    }

    /**
     * loading异步加载
     * @param exec 
     * @param msg 
     * @returns 
     */
    public static async load<T>(exec: () => Promise<T>, msg?: string): Promise<T> {
        Toast.show({ icon: 'loading', duration: 0, content: msg })
        const rep = await exec()
        Toast.clear();
        return rep;
    }
}