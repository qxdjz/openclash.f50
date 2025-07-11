import { Button, Form, Input } from 'antd-mobile'
import React from 'react'
import { Setting_OverWrite } from '../../utils/api'
import { usePluginConfig } from '../../utils/config'

export const OverWriteSetting = () => {
    const { data, save } = usePluginConfig('setting/overrite', {} as Setting_OverWrite)

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
                        initialValue={data.dns ?? '7893'}
                        disabled={true}
                        rules={[{ required: true, pattern: new RegExp(/^[1-9][0-9]{3}$/) }]}>
                        <Input placeholder="请输入DNS监听端口" />
                    </Form.Item>
                    <Form.Item
                        name="tproxy"
                        label="流量转发端口"
                        help="流量转发端口"
                        disabled={true}
                        initialValue={data.tproxy ?? '1053'}
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
