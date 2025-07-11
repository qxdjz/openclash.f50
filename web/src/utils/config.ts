import { Dialog, Toast } from "antd-mobile"
import { useEffect, useState } from "react"
import { Utils } from "."
import { ApiStore } from "./api"

export function usePluginConfig<T>(name: string, defaultValue: T) {
    const [data, setData] = useState<T | undefined>(undefined)

    useEffect(() => {
        refresh()
    }, [])

    const refresh = async () => {
        const { data, code, msg } = await ApiStore.getConfig<T>(name)
        if (code !== 1) {
            Toast.show({ content: msg })
            return
        }

        setData(data ?? defaultValue)
    }

    const save = async (item: any) => {
        const { data, code, msg } = await ApiStore.updateConfig<T>(name, item)
        if (code !== 1) {
            Toast.show({ content: msg })
            return
        }

        restart()
    }

    const restart = async () => {
        const flag = await Dialog.confirm({
            title: '修改成功',
            content: '应用并重启'
        })
        if (!flag) {
            return
        }

        const { code, msg } = await Utils.load(() => {
            return ApiStore.restart()
        }, '正在重启')

        if (code !== 1) {
            Toast.show({ content: msg })
            return
        }
        Toast.show({ content: '重启成功' })
    }

    return {
        data, save
    }
}