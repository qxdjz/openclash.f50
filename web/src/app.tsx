import { Button, Dialog, List, Space, Tabs, Toast } from 'antd-mobile'
import React, { useEffect, useState } from 'react'
import { Config } from './tabs/config'
import { Log } from './tabs/log'
import { Setting } from './tabs/setting'
import { ApiStore } from './utils/api'
import { ExternalControl } from './tabs/ui'

export const App = () => {
    const [key, setKey] = useState('config')
    const [status, setStatus] = useState('')

    const refresh = async () => {
        const { code, data } = await ApiStore.getStatus()

        if (code !== 1) {
            setStatus('状态读取失败')
            return
        }

        let msg: string[] = []
        if (data?.node && data.node.length > 0) {
            msg.push(`主服务正在运行[${data.node.replace('\n', '')}]`)
        } else {
            msg.push('主服务已停止')
        }
        if (data?.mihomo && data.mihomo.length > 0) {
            msg.push(`代理服务正在运行[${data.mihomo.replace('\n', '')}]`)
        } else {
            msg.push('代理服务已停止')
        }

        setStatus(msg.join(', '))
    }

    useEffect(() => {
        refresh()

        const id = setInterval(refresh, 2000)

        return () => {
            clearInterval(id)
        }
    }, [])

    return (
        <div className="innerContainer">
            <div className="m_row m_title">
                <img />
                <span>OpenClash</span>
            </div>

            <div className="m_row">
                <div className="m_equal_full">
                    <List>
                        <List.Item
                            description={status}
                            arrowIcon={false}>
                            运行状态
                        </List.Item>
                    </List>
                </div>
                <div style={{ padding: '15px' }}>
                    <Space>
                        <Button
                            size="small"
                            onClick={async () => {
                                const { code, data, msg } = await ApiStore.currentSubYaml()
                                if (code !== 1) {
                                    Toast.show({ content: msg })
                                    return
                                }

                                Dialog.alert({ content: <pre>${data}</pre> })
                            }}>
                            配置文件
                        </Button>
                        <Button
                            size="small"
                            onClick={async () => {
                                const { code, data, msg } = await ApiStore.getExternalUrl()
                                if (code !== 1) {
                                    Toast.show({ content: msg })
                                    return
                                }
                                data && window.open(data)
                            }}>
                            外部控制
                        </Button>
                    </Space>
                </div>
            </div>

            <Tabs
                activeKey={key}
                onChange={(key) => {
                    setKey(key)
                }}>
                <Tabs.Tab
                    title="配置订阅"
                    key="config"
                    destroyOnClose={true}>
                    <Config />
                </Tabs.Tab>
                <Tabs.Tab
                    title="外部控制"
                    key="external"
                    destroyOnClose={true}>
                    <ExternalControl />
                </Tabs.Tab>
                <Tabs.Tab
                    title="运行日志"
                    key="log"
                    destroyOnClose={true}>
                    <Log />
                </Tabs.Tab>
                <Tabs.Tab
                    title="插件设置"
                    key="setting"
                    destroyOnClose={true}>
                    <Setting />
                </Tabs.Tab>
            </Tabs>
        </div>
    )
}
