import { Button, SideBar, Space, Toast } from 'antd-mobile'
import React, { useEffect, useRef, useState } from 'react'
import { get } from '../utils/api'

export const Log = () => {
    const ref = useRef('')
    const [filter, setFilter] = useState(true)
    const refF = useRef(filter)
    const log = useRef<HTMLDivElement>(null)

    const read = async (key?: string) => {
        key && (ref.current = key)

        if (!ref.current) {
            return
        }

        const { code, data, msg } = await get<string>('/shell/run/' + ref.current)
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
                span.innerHTML = `<pre>${text}</pre>`
                log.current.appendChild(span)
            }
        }
    }

    useEffect(() => {
        refF.current = filter
        read()
    }, [filter])

    useEffect(() => {
        read('node.log')

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
