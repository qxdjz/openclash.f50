import { Button, Form, Input, Toast } from 'antd-mobile'
import React, { useEffect, useState } from 'react'
import { Setting_External, Setting_OverWrite, get, put } from '../../utils/api'

export const OverWriteSetting = () => {
    const [data, setData] = useState<Setting_OverWrite | undefined>(undefined)

    const refresh = () => {
        get<Setting_OverWrite>('/yaml/setting/overrite').then(({ code, data, msg }) => {
            if (code === 1) {
                setData(data ?? {})
            } else {
                Toast.show({ content: msg })
            }
        })
    }

    const save = (item: Setting_External) => {
        put('/yaml/setting/overrite', item).then(({ code, msg }) => {
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
                        name="dns"
                        label="DNS监听端口"
                        help="DNS监听端口"
                        initialValue={data.dns ?? '7874'}
                        rules={[{ required: true, pattern: new RegExp(/^[1-9][0-9]{3}$/) }]}>
                        <Input placeholder="请输入DNS监听端口" />
                    </Form.Item>
                    <Form.Item
                        name="tproxy"
                        label="流量转发端口"
                        help="流量转发端口"
                        initialValue={data.tproxy ?? '7893'}
                        rules={[{ required: true, pattern: new RegExp(/^[1-9][0-9]{3}$/) }]}>
                        <Input placeholder="请输入流量转发端口" />
                    </Form.Item>
                    <Form.Item
                        name="http"
                        label="HTTP(S)端口"
                        help="HTTP(S)端口"
                        initialValue={data.http}
                        rules={[{ pattern: new RegExp(/0|^[1-9][0-9]{3}$/) }]}>
                        <Input placeholder="请输入HTTP(S) 代理端口" />
                    </Form.Item>
                    <Form.Item
                        name="socks5"
                        label="SOCKS5端口"
                        help="SOCKS5端口"
                        initialValue={data.socks5}
                        rules={[{ pattern: new RegExp(/0|^[1-9][0-9]{3}$/) }]}>
                        <Input placeholder="请输入SOCKS5 代理端口" />
                    </Form.Item>
                    <Form.Item
                        name="mix"
                        label="混合代理端口"
                        help="混合代理端口"
                        initialValue={data.mix}
                        rules={[{ pattern: new RegExp(/0|^[1-9][0-9]{3}$/) }]}>
                        <Input placeholder="请输入HTTP(S)&SOCKS5 混合代理端" />
                    </Form.Item>
                </Form>
            )}
        </>
    )
}
