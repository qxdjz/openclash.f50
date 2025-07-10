import { Button, Dialog, Toast } from 'antd-mobile'
import React from 'react'
import { get } from '../../utils/api'

export const CrondSetting = () => {
    const restart = async () => {
        Toast.show({ icon: 'loading', duration: 0 })

        const { code, msg } = await get('/service/start')

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
                onClick={async () => {
                    if (
                        await Dialog.confirm({
                            content: '确认重启？'
                        })
                    ) {
                        restart()
                    }
                }}>
                即刻重启
            </Button>
        </>
    )
}
