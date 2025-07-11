import { Button, Form, Selector, Switch } from 'antd-mobile'
import React from 'react'
import { Setting_Plugin } from '../../utils/api'
import { usePluginConfig } from '../../utils/config'

export const PlugingSetting = () => {
    const { data, save } = usePluginConfig('setting/plugin', {} as Setting_Plugin)

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
                        name="switch"
                        label="代理开关"
                        help="开关打开后，自动代理连接到Wifi上所有设备的流量"
                        valuePropName="checked"
                        initialValue={data.switch ?? true}
                        childElementPosition="right">
                        <Switch />
                    </Form.Item>
                    <Form.Item
                        name="level"
                        label="日志等级"
                        help="日志等级"
                        initialValue={data.level ?? ['debug']}
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
                    {/* <Form.Item
                        name="git_url"
                        label="Git地址修改"
                        initialValue={data.git_url ?? ['']}
                        help="使用指定代理（CDN）反代插件和配置文件中的 Github 地址，以防止文件下载失败，格式参考： https://ghproxy.com/"
                        rules={[{ required: true }]}>
                        <Selector
                            options={[
                                { label: '停用', value: '' },
                                { label: '加速一', value: 'https://fastly.jsdelivr.net/' },
                                { label: '加速二', value: 'https://testingcf.jsdelivr.net/' },
                                { label: '加速三', value: 'https://raw.fastgit.org/' },
                                { label: '加速四', value: 'https://cdn.jsdelivr.net/' }
                            ]}
                        />
                    </Form.Item> */}
                </Form>
            )}
        </>
    )
}
