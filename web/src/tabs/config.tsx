import { Button, Checkbox, Dialog, ErrorBlock, List, Modal, Space, Toast } from 'antd-mobile'
import React, { useEffect, useState } from 'react'
import { AddConfig } from '../dialog/add-config-item'
import { SubItem, get, post, put } from '../utils/api'

export const Config = () => {
    const [configs, setConfigs] = useState<SubItem[]>([])

    const refresh = () => {
        get<SubItem[]>('/yaml/subs').then(({ code, data, msg }) => {
            if (code === 1) {
                setConfigs(data ?? [])
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

    const update = (item: SubItem) => {
        Toast.show({ icon: 'loading', duration: 0 })

        post('/subscribe/update', item).then(async ({ code, data, msg }) => {
            if (code === 1) {
                refresh()
            }

            Toast.clear()
            if (
                await Dialog.confirm({
                    title: '确认切换吗？',
                    content: msg
                })
            ) {
                switchConfig(item)
            }
        })
    }

    const switchConfig = async (item: SubItem) => {
        Toast.show({ icon: 'loading', duration: 0 })
        {
            const { code, msg } = await put('/yaml/name', item.name);
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
                                    disabled={true}
                                    checked={true}
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
                                        切换
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
