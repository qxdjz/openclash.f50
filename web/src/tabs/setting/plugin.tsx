import { Button, Form, Input, Selector, Switch } from 'antd-mobile'
import React from 'react'
import { Setting_Config } from '../../utils/api'
import { usePluginConfig } from '../../utils/config'

export const PluginPage = () => {
    const { data, save } = usePluginConfig('setting/config', {} as Setting_Config)

    console.log('config', data)

    if (!data) {
        return <></>
    }

    return (
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
                name="enable"
                label="代理开关"
                help="开关打开后，自动代理连接到Wifi上所有设备的流量"
                valuePropName="checked"
                initialValue={data.enable ?? true}
                childElementPosition="right">
                <Switch />
            </Form.Item>
            <Form.Item
                name="debug_level"
                label="日志等级"
                help="日志等级"
                initialValue={data.debug_level ?? ['debug']}
                rules={[{ required: true }]}>
                <Selector
                    options={[
                        { label: '关闭', value: 'silent' },
                        { label: '调试', value: 'debug' },
                        { label: '信息', value: 'info' },
                        { label: '警告', value: 'warning' },
                        { label: '错误', value: 'error' }
                    ]}
                />
            </Form.Item>

            <Form.Item
                name="dns_listen_port"
                label="DNS监听端口"
                help="DNS监听端口"
                initialValue={data.dns_listen_port ?? '7893'}
                disabled={true}
                rules={[{ required: true, pattern: new RegExp(/^[1-9][0-9]{3}$/) }]}>
                <Input placeholder="请输入DNS监听端口" />
            </Form.Item>
            <Form.Item
                name="tproxy_port"
                label="流量转发端口"
                help="流量转发端口"
                disabled={true}
                initialValue={data.tproxy_port ?? '1053'}
                rules={[{ required: true, pattern: new RegExp(/^[1-9][0-9]{3}$/) }]}>
                <Input placeholder="请输入流量转发端口" />
            </Form.Item>
            <Form.Item
                name="http_port"
                label="HTTP(S)端口"
                help="HTTP(S)端口"
                initialValue={data.http_port}
                rules={[{ pattern: new RegExp(/0|^[1-9][0-9]{3}$/) }]}>
                <Input placeholder="请输入HTTP(S) 代理端口" />
            </Form.Item>
            <Form.Item
                name="socks5_port"
                label="SOCKS5端口"
                help="SOCKS5端口"
                initialValue={data.socks5_port}
                rules={[{ pattern: new RegExp(/0|^[1-9][0-9]{3}$/) }]}>
                <Input placeholder="请输入SOCKS5 代理端口" />
            </Form.Item>
            <Form.Item
                name="mix_port"
                label="混合代理端口"
                help="混合代理端口"
                initialValue={data.mix_port}
                rules={[{ pattern: new RegExp(/0|^[1-9][0-9]{3}$/) }]}>
                <Input placeholder="请输入HTTP(S)&SOCKS5 混合代理端" />
            </Form.Item>

            <Form.Item
                name="external_port"
                label="管理端口"
                initialValue={data.external_port}
                help="管理页面地址示例: :9090/ui/yacd、:9090/ui/dashboard"
                rules={[{ pattern: new RegExp(/^[1-9][0-9]{3}$/) }]}>
                <Input placeholder="请输入管理端口" />
            </Form.Item>
            <Form.Item
                name="external_secret"
                label="登录密钥"
                initialValue={data.external_secret}
                help="设置您的管理页面登录密钥"
                rules={[{ pattern: new RegExp(/^[0-9a-zA-Z]{1,10}$/) }]}>
                <Input placeholder="请输入登录密钥" />
            </Form.Item>
        </Form>
    )
}
