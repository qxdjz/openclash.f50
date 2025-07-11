import { Button, SideBar, Space, Toast } from 'antd-mobile'
import React, { useEffect, useRef, useState } from 'react'
import { ApiStore } from '../../utils/api'

export const Log = () => {
    const ref = useRef('')
    const stopRef = useRef(false)
    const [stop, setStop] = useState(false)
    const [filter, setFilter] = useState(true)
    const refF = useRef(filter)
    const log = useRef<HTMLDivElement>(null)

    const read = async (key?: string) => {
        if (stopRef.current) {
            return
        }

        key && (ref.current = key)
        if (!ref.current) {
            return
        }

        const api = { '1': ApiStore.getNodeLog, '2': ApiStore.getMihomoLog, '3': ApiStore.getCrondLog }[ref.current]
        if (!api) {
            return
        }

        const { code, data, msg } = await api()
        if (code !== 1) {
            Toast.show({ content: msg })
            return
        }

        if (log.current) {
            log.current.innerHTML = ''
            const arrs = data?.split('\n')?.reverse()
            for (let i = 0; i < (arrs?.length ?? 0); i++) {
                const text = arrs?.[i] ?? ''
                if (refF.current && text.includes('[/node/')) {
                    continue
                }
                const span = document.createElement('span')
                span.innerHTML = `<pre style="color: white; border: none; background-color: black;"}>${text}</pre>`
                log.current.appendChild(span)
            }
        }
    }

    useEffect(() => {
        refF.current = filter
        read()
    }, [filter])

    useEffect(() => {
        read('1')

        const id = setInterval(read, 1000)

        return () => {
            clearInterval(id)
        }
    }, [])

    return (
        <div className="m_row">
            <div style={{ alignSelf: 'flex-start' }}>
                <SideBar
                    onChange={(key) => {
                        read(key)
                    }}>
                    <SideBar.Item
                        key={'1'}
                        title={'服务日志'}
                    />
                    <SideBar.Item
                        key={'2'}
                        title={'核心日志'}
                    />
                    <SideBar.Item
                        key={'3'}
                        title={'定时日志'}
                    />
                </SideBar>
            </div>
            <div className="m_column m_equal_full">
                <div
                    className="m_equal_full"
                    style={{
                        overflow: 'auto',
                        width: '100%',
                        backgroundColor: 'black',
                        color: 'white'
                    }}>
                    <div
                        ref={log}
                        style={{ height: '400px', width: '100%' }}
                        className="m_items"
                    />
                </div>
                <div style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                    <Space>
                        <Button
                            onClick={() => {
                                setStop((f) => {
                                    stopRef.current = !f
                                    return !f
                                })
                            }}>
                            {!stop ? '停止刷新' : '恢复刷新'}
                        </Button>

                        <Button
                            onClick={() => {
                                setFilter((f) => {
                                    return !f
                                })
                            }}>
                            {!filter ? '过滤接口日志' : '显示全部日志'}
                        </Button>
                    </Space>
                </div>
            </div>
        </div>
    )
}
