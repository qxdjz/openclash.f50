import { Utils } from "."
import { Http } from "./http"

export type Status = { node?: string, mihomo?: string }
export type SubItem = { name: string, url: string, time?: string, excludes?: string, includes?: string, invalides?: string[] }
export type Setting_Plugin = { switch?: boolean, level?: string[], git_url?: string[] }
export type Setting_OverWrite = { dns?: string, proxy?: string, tproxy?: string, http?: string, socks5?: string, mix?: string, "nameserver-policy": string }
export type Setting_External = { port?: string, secret?: string }

export class ApiStore {
    /** 读取运行状态 */
    public static async getStatus() {
        return await Http.get<Status>('/shell/status')
    }

    /** 重启服务 */
    public static async restart(name?: string) {
        if (name && name.length > 0) {
            const { code, msg } = await Http.put<unknown>('/yaml/name', name)
            if (code !== 1) {
                return { code, msg }
            }
        }

        const restart = await Http.get('/service/start')
        if (restart.code !== 1) {
            return { code: restart.code, msg: restart.msg }
        }

        return { code: 1, data: { name, msg: restart.data } }
    }

    /** 读取配置 */
    public static async getConfig<T>(name: string) {
        return await Http.get<T>(`/yaml/${name}`)
    }

    /** 更新配置 */
    public static async updateConfig<T>(name: string, value: T) {
        return await Http.put<unknown>(`/yaml/${name}`, value)
    }

    /** 读取订阅列表 */
    public static async getSubs() {
        const subs = await Http.get<SubItem[]>('/yaml/subs')
        if (subs.code !== 1) {
            return { code: subs.code, msg: subs.msg }
        }
        const name = await Http.get<string>('/yaml/name')
        if (name.code !== 1) {
            return { code: name.code, msg: name.msg }
        }

        return { code: 1, data: { subs: subs.data, name: name.data } }
    }

    /** 添加订阅 */
    public static async addSub(item: SubItem) {
        const subs = await Http.get<SubItem[]>('/yaml/subs')
        if (subs.code !== 1) {
            return { code: subs.code, msg: subs.msg }
        }

        if (subs.data?.filter(i => {
            return i.name === item.name
        })?.length ?? 0 > 0) {
            return { code: 0, msg: "配置名称重复" }
        }

        const list = [...subs.data ?? [], item];
        const rep = await Http.put<unknown>('/yaml/subs', list)
        if (rep.code !== 1) {
            return { code: rep.code, msg: rep.msg }
        }

        return { code: 1, data: list }
    }

    /** 删除订阅 */
    public static async deleteSub(item: SubItem) {
        const subs = await Http.get<SubItem[]>('/yaml/subs')
        if (subs.code !== 1) {
            return { code: subs.code, msg: subs.msg }
        }
        const list = subs.data?.filter(i => {
            return i.name !== item.name
        }) ?? [];
        const rep = await Http.put<unknown>('/yaml/subs', list)
        if (rep.code !== 1) {
            return { code: rep.code, msg: rep.msg }
        }

        return { code: 1, data: list }
    }

    /** 修改订阅 */
    public static async modifySub(item: SubItem) {
        const subs = await Http.get<SubItem[]>('/yaml/subs')
        if (subs.code !== 1) {
            return { code: subs.code, msg: subs.msg }
        }
        const list = subs.data ?? [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].name === item.name) {
                list[i] = { ...list[i], ...item }
            }
        }
        const rep = await Http.put<unknown>('/yaml/subs', list)
        if (rep.code !== 1) {
            return { code: rep.code, msg: rep.msg }
        }

        return { code: 1, data: list }
    }

    /** 更新订阅内容 */
    public static async updateSub(item: SubItem) {
        const update = await Http.post('/subscribe/update', item)
        // if (update.code !== 1) {
        //     return { code: update.code, msg: update.msg }
        // }
        const modify = await ApiStore.modifySub({ ...item, time: Utils.formatTime(new Date()) })
        if (modify.code !== 1) {
            return { code: modify.code, msg: modify.msg }
        }

        return { code: 1, data: modify.data, msg: update.msg }
    }

    /** 获取订阅内容 */
    public static async getSubYaml(name: string) {
        return await Http.get<string>(
            `/shell/download/${name}/config.yaml`
        )
    }

    /** 当前使用的订阅配置文件 */
    public static async currentSubYaml() {
        return await Http.get<string>(
            `/shell/run/config.yaml`
        )
    }

    /** 获取NodeLog日志 */
    public static async getNodeLog() {
        return await Http.get<string>(
            `/shell/run/node.log`
        )
    }

    /** 获取MihomoLog日志 */
    public static async getMihomoLog() {
        return await Http.get<string>(
            `/shell/run/mihomo.log`
        )
    }

    /** 获取CrondLog日志 */
    public static async getCrondLog() {
        return await Http.get<string>(
            `/shell/run/crond.log`
        )
    }

    /** 外部控制链接 */
    public static async getExternalUrl() {
        const { code, data, msg } = await Http.get<string>('/yaml/setting/external/port')
        if (code !== 1) {
            return { code, msg }
        }

        const { protocol, hostname } = new URL(window.location.href)
        if (data && data.length > 0) {
            return { code: 1, data: `${protocol}//${hostname}:${data}/ui/` }
        } else {
            return { code: 1, data: `${protocol}//${hostname}:9091/ui/` }
        }
    }
}

