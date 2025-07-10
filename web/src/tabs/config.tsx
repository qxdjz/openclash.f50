import { Button, Checkbox, Dialog, ErrorBlock, List, Modal, Space, Toast } from 'antd-mobile'
import React, { useEffect, useState } from 'react'
import { AddConfig } from '../dialog/add-config-item'
import { SubItem, get, post, put } from '../utils/api'

export const Config = () => {
    const [name, setName] = useState('')
    const [configs, setConfigs] = useState<SubItem[]>([])

    function formatTime(date: Date) {
        let year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        let hours = date.getHours()
        let minutes = date.getMinutes()
        let seconds = date.getSeconds()

        return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day} ${
            hours < 10 ? '0' + hours : hours
        }:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
    }

    const refresh = () => {
        get<SubItem[]>('/yaml/subs').then(({ code, data, msg }) => {
            if (code === 1) {
                setConfigs(data ?? [])
            } else {
                Toast.show({ content: msg })
            }
        })

        get<string>('/yaml/name').then(({ code, data, msg }) => {
            if (code === 1) {
                setName(data ?? '')
            } else {
                Toast.show({ content: msg })
            }
        })
    }

    const add = (item: SubItem) => {
        put('/yaml/subs', [...configs, item]).then(({ code, msg }) => {
            if (code === 1) {
                refresh()
                Modal.clear()
            } else {
                Toast.show({ content: msg })
            }
        })
    }

    const del = (item: SubItem) => {
        const l = configs.filter((f) => {
            return f.name !== item.name
        })
        put('/yaml/subs', [...l]).then(({ code, msg }) => {
            if (code === 1) {
                refresh()
                Modal.clear()
            } else {
                Toast.show({ content: msg })
            }
        })
    }

    const update = async (item: SubItem) => {
        Toast.show({ icon: 'loading', duration: 0, content: '更新配置' })
        const u = await post('/subscribe/update', item)

        item.time = formatTime(new Date())
        await put('/yaml/subs', configs)

        if (u.code === 1) {
            refresh()
        }

        Toast.clear()
        switchConfig(item, u.msg ?? '')
    }

    const switchConfig = async (item: SubItem, msg: string) => {
        if (
            !(await Dialog.confirm({
                title: '确认切换到该配置吗？',
                content: msg
            }))
        ) {
            return
        }

        Toast.show({ icon: 'loading', duration: 0, content: '重启服务' })
        {
            const { code, msg } = await put('/yaml/name', item.name)
            if (code !== 1) {
                Toast.show({ content: msg })
                return
            }
        }
        {
            const { code, msg } = await get('/service/start')

            if (code !== 1) {
                Toast.show({ content: msg })
                return
            }
        }

        refresh()
        Toast.show({ content: '切换成功' })
    }

    useEffect(refresh, [])

    return (
        <div>
            {configs.length === 0 && (
                <ErrorBlock
                    status="empty"
                    description=""
                    title="暂无配置信息,请点击新增"
                />
            )}
            <List>
                {[{ name: '配置名称', url: '订阅地址', time: '更新时间' }, ...configs].map((item, index) => (
                    <List.Item key={item.name}>
                        <div className="m_row">
                            <div style={{ padding: '0 10px 0 0', visibility: index == 0 ? 'hidden' : undefined }}>
                                <Checkbox
                                    checked={item.name === name}
                                    onClick={() => {
                                        if (item.name !== name) {
                                            switchConfig(item, '确认配置文件已更新，否则切换将导致服务无法启动')
                                        }
                                    }}
                                />
                            </div>
                            <div
                                key="name"
                                className="m_equal1">
                                {item.name}
                            </div>
                            <div
                                key="url"
                                className="m_equal2 m_show">
                                {item.url}
                            </div>
                            <div
                                key="time"
                                className="m_equal2 m_show">
                                {item.time}
                            </div>
                            <div style={{ visibility: index == 0 ? 'hidden' : undefined }}>
                                <Space>
                                    <Button
                                        size="small"
                                        color="primary"
                                        onClick={async () => {
                                            const { code, data, msg } = await get<string>(
                                                `/shell/download/${item.name}/config.yaml`
                                            )
                                            if (code !== 1) {
                                                Toast.show({ content: msg })
                                                return
                                            }

                                            Dialog.alert({ content: <pre>${data}</pre> })
                                        }}>
                                        查看
                                    </Button>
                                    <Button
                                        size="small"
                                        color="success"
                                        onClick={async () => {
                                            if (
                                                await Dialog.confirm({
                                                    content: '确认更新？'
                                                })
                                            ) {
                                                update(item)
                                            }
                                        }}>
                                        更新
                                    </Button>
                                    <Button
                                        size="small"
                                        color="danger"
                                        onClick={async () => {
                                            if (
                                                await Dialog.confirm({
                                                    content: '确认删除？'
                                                })
                                            ) {
                                                del(item)
                                            }
                                        }}>
                                        删除
                                    </Button>
                                </Space>
                            </div>
                        </div>
                    </List.Item>
                ))}
            </List>

            <Button
                block
                color="primary"
                size="middle"
                onClick={() => {
                    Modal.show({
                        content: <AddConfig add={add} />,
                        closeOnMaskClick: true
                    })
                }}>
                新增配置
            </Button>
        </div>
    )
}
