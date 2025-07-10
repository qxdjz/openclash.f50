import { Button, SideBar, Space, Toast } from 'antd-mobile'
import React, { useEffect, useRef } from 'react'
import { get } from '../utils/api'

export const Log = () => {
    const ref = useRef('')
    const log = useRef<HTMLDivElement>(null)

    const read = async (key?: string) => {
        key && (ref.current = key)

        const { code, data, msg } = await get<string>('/shell/log/' + ref.current)
        if (code !== 1) {
            Toast.show({ content: msg })
            return
        }

        log.current && (log.current.innerHTML = `<pre>${data ?? ''}</pre>`)
    }

    useEffect(() => {
        read('node.log')
    }, [])

    return (
        <div className="m_row">
            <div style={{ alignSelf: 'flex-start' }}>
                <SideBar
                    onChange={(key) => {
                        read(key)
                    }}>
                    <SideBar.Item
                        key={'node.log'}
                        title={'服务日志'}
                    />
                    <SideBar.Item
                        key={'mihomo.log'}
                        title={'核心日志'}
                    />
                    <SideBar.Item
                        key={'crond.log'}
                        title={'定时日志'}
                    />
                </SideBar>
            </div>
            <div className="m_column m_equal_full">
                <div
                    className="m_equal_full"
                    style={{ overflow: 'auto', width: '100%' }}>
                    <div
                        ref={log}
                        style={{ height: '400px' }}
                        className="m_items"
                    />
                </div>
                <div style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                    <Space>
                        <Button
                            onClick={() => {
                                read()
                            }}>
                            刷新日志
                        </Button>
                        <Button
                            onClick={() => {
                                log.current && (log.current.innerHTML = ``)
                            }}>
                            清空日志
                        </Button>
                    </Space>
                </div>
            </div>
        </div>
    )
}
