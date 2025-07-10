import $ from 'jquery';

const base = "/node"
// export const base = "http://192.168.0.1/node"

export type SubItem = { name: string, url: string, time?: string }

export type Status = { node?: string, mihomo?: string }

export type Setting_Plugin = { switch?: boolean, level?: string[], git_url?: string[] }

export type Setting_OverWrite = { dns?: string, proxy?: string, tproxy?: string, http?: string, socks5?: string, mix?: string }

export type Setting_External = { port?: string, secret?: string }

export function ajax<T>(options: { method: "get" | "post" | "put" | "delete" | "patch", url: string, data?: any }): Promise<{ code: number, msg?: string, data?: T }> {
    return new Promise((resolve => {
        $.ajax({
            data: options.data ? JSON.stringify(options.data) : "",
            async: true,
            url: base + options.url,
            type: options.method,
            processData: false,
            //contentType: "application/json",
            success: function (data, status) {
                resolve(data)
            },
            error: function (e) {
                resolve({ code: 0, msg: JSON.stringify(e) })
            }
        });
    }));
}

export function get<T>(url: string): Promise<{ code: number, msg?: string, data?: T }> {
    return ajax<T>({ method: "get", url })
}

export function post<T>(url: string, data?: any): Promise<{ code: number, msg?: string, data?: T }> {
    return ajax<T>({ method: "post", url, data })
}

export function put<T>(url: string, data?: any): Promise<{ code: number, msg?: string, data?: T }> {
    return ajax<T>({ method: "put", url, data })
}

export function patch<T>(url: string, data?: any): Promise<{ code: number, msg?: string, data?: T }> {
    return ajax<T>({ method: "patch", url, data })
}

export function del<T>(url: string, data?: any): Promise<{ code: number, msg?: string, data?: T }> {
    return ajax<T>({ method: "delete", url, data })
}

