import { Button, Dialog, Toast } from 'antd-mobile'
import React from 'react'
import { Utils } from '../../utils'
import { ApiStore } from '../../utils/api'

export const CrondSetting = () => {
    const restart = async () => {
        const flag = await Dialog.confirm({
            content: '确认重启？'
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

    return (
        <>
            <Button
                color="primary"
                size="small"
                onClick={restart}>
                重启
            </Button>
        </>
    )
}
