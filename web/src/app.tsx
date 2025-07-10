import { List, Tabs } from 'antd-mobile'
import React, { useEffect, useState } from 'react'
import { Config } from './tabs/config'
import { Log } from './tabs/log'
import { Setting } from './tabs/setting'
import { Status, get } from './utils/api'

export const App = () => {
    const [key, setKey] = useState('config')
    const [status, setStatus] = useState('')

    const refresh = async () => {
        const { code, data } = await get<Status>('/shell/status')

        if (code !== 1) {
            setStatus('status is not get')
            return
        }

        setStatus(`node: ${data?.node ?? '-'}, mihomo: ${data?.mihomo ?? '-'}`)
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
            <List>
                <List.Item
                    description={status}
                    arrowIcon={false}>
                    运行状态
                </List.Item>
            </List>

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
