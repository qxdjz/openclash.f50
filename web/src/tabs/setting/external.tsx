import { Button, Form, Input, Toast } from 'antd-mobile'
import React, { useEffect, useState } from 'react'
import { Setting_External, get, put } from '../../utils/api'

export const ExternalSetting = () => {
    const [data, setData] = useState<Setting_External | undefined>(undefined)

    const refresh = () => {
        get<Setting_External>('/yaml/setting/external').then(({ code, data, msg }) => {
            if (code === 1) {
                setData(data ?? {})
            } else {
                Toast.show({ content: msg })
            }
        })
    }

    const save = (item: Setting_External) => {
        put('/yaml/setting/external', item).then(({ code, msg }) => {
            if (code === 1) {
                Toast.show({ content: '应用成功，请至插件设置->重启应用，方能生效' })
            } else {
                Toast.show({ content: msg })
            }
        })
    }

    useEffect(refresh, [])

    return (
        <>
            {data && (
                <Form
                    name="form"
                    layout="horizontal"
                    style={{ '--prefix-width': '139px' }}
                    onFinish={(data) => {
                        console.log(data)
                        save(data)
                    }}
                    footer={
                        <div className="m_row">
                            <div className="m_equal_full" />
                            <Button
                                block
                                style={{ width: '100px' }}
                                type="submit"
                                color="primary"
                                size="small">
                                应用修改
                            </Button>
                        </div>
                    }>
                    <Form.Item
                        name="port"
                        label="管理端口"
                        initialValue={data.port}
                        help="管理页面地址示例: :9090/ui/yacd、:9090/ui/dashboard"
                        rules={[{ pattern: new RegExp(/^[1-9][0-9]{3}$/) }]}>
                        <Input placeholder="请输入管理端口" />
                    </Form.Item>
                    <Form.Item
                        name="secret"
                        label="登录密钥"
                        initialValue={data.secret}
                        help="设置您的管理页面登录密钥"
                        rules={[{ pattern: new RegExp(/^[0-9a-zA-Z]{1,10}$/) }]}>
                        <Input placeholder="请输入登录密钥" />
                    </Form.Item>
                </Form>
            )}
        </>
    )
}
