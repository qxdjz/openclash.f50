import $ from 'jquery'

const base = '/node'
// const base = 'http://127.0.0.1:3300/node'

function ajax<T>(options: {
    method: 'get' | 'post' | 'put' | 'delete' | 'patch'
    url: string
    data?: any
}): Promise<{ code: number; msg?: string; data?: T }> {
    return new Promise((resolve) => {
        $.ajax({
            data: options.data ? JSON.stringify(options.data) : '',
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
        })
    })
}

export class Http {
    public static get<T>(url: string): Promise<{ code: number; msg?: string; data?: T }> {
        return ajax<T>({ method: 'get', url })
    }

    public static post<T>(url: string, data?: any): Promise<{ code: number; msg?: string; data?: T }> {
        return ajax<T>({ method: 'post', url, data })
    }

    public static put<T>(url: string, data?: any): Promise<{ code: number; msg?: string; data?: T }> {
        return ajax<T>({ method: 'put', url, data })
    }

    public static patch<T>(url: string, data?: any): Promise<{ code: number; msg?: string; data?: T }> {
        return ajax<T>({ method: 'patch', url, data })
    }

    public static del<T>(url: string, data?: any): Promise<{ code: number; msg?: string; data?: T }> {
        return ajax<T>({ method: 'delete', url, data })
    }
}
