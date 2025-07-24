import { SideBar } from 'antd-mobile'
import React, { useState } from 'react'
import { PluginPage } from './plugin'

export const Setting = () => {
    const [key, setKey] = useState('plugin')

    return (
        <div className="m_row">
            <div style={{ alignSelf: 'flex-start' }}>
                <SideBar
                    onChange={(key) => {
                        setKey(key)
                    }}>
                    <SideBar.Item
                        key={'plugin'}
                        title={'插件设置'}
                    />
                    <SideBar.Item
                        key={'proxies'}
                        title={'代理节点'}
                    />
                    <SideBar.Item
                        key={'proxies_group'}
                        title={'代理分组'}
                    />
                    <SideBar.Item
                        key={'rules'}
                        title={'分流策略'}
                    />
                    <SideBar.Item
                        key={'dns'}
                        title={'DNS设置'}
                    />
                </SideBar>
            </div>
            <div className="m_column m_equal_full">{key === 'plugin' && <PluginPage />}</div>
        </div>
    )
}
