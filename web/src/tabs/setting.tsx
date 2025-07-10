import { SideBar } from 'antd-mobile'
import React, { useState } from 'react'
import { CrondSetting } from './setting/crond'
import { ExternalSetting } from './setting/external'
import { OverWriteSetting } from './setting/overwrite'
import { PlugingSetting } from './setting/plugin'
import { UpdateSetting } from './setting/update'

export const Setting = () => {
    const [key, setKey] = useState('plugin')

    return (
        <div className="m_row">
            <div style={{ alignSelf: 'flex-start' }}>
                <SideBar
                    activeKey={key}
                    onChange={(key) => {
                        setKey(key)
                    }}>
                    <SideBar.Item
                        key={'plugin'}
                        title={'插件设置'}
                    />
                    <SideBar.Item
                        key={'overwrite'}
                        title={'复写设置'}
                    />
                    <SideBar.Item
                        key={'external'}
                        title={'外部控制'}
                    />
                    <SideBar.Item
                        key={'update'}
                        title={'更新管理'}
                    />
                    <SideBar.Item
                        key={'restart'}
                        title={'重启应用'}
                    />
                </SideBar>
            </div>
            <div
                className="m_column m_equal_full"
                style={{ alignSelf: 'flex-start', overflow: 'auto' }}>
                {key === 'plugin' && <PlugingSetting />}
                {key === 'overwrite' && <OverWriteSetting />}
                {key === 'external' && <ExternalSetting />}
                {key === 'update' && <UpdateSetting />}
                {key === 'restart' && <CrondSetting />}
            </div>
        </div>
    )
}
