import { Button, Checkbox, Dialog, ErrorBlock, List, Modal, Space, Toast } from 'antd-mobile'
import React, { useEffect, useState } from 'react'
import { AddConfig } from '../dialog/add-config-item'
import { Utils } from '../utils'
import { ApiStore, SubItem } from '../utils/api'

export const Config = () => {
    const [name, setName] = useState('')
    const [configs, setConfigs] = useState<SubItem[]>([])

    const refresh = async () => {
        const { code, data, msg } = await ApiStore.getSubs()
        if (code !== 1) {
            Toast.show({ content: msg })
            return
        }
        setConfigs(data?.subs ?? [])
        setName(data?.name ?? '')
    }

    const add = async (item: SubItem) => {
        const { code, data, msg } = await ApiStore.addSub(item)
        if (code !== 1) {
            Toast.show({ content: msg })
            return
        }
        setConfigs(data ?? [])
        Modal.clear()
    }

    const del = async (item: SubItem) => {
        const flag = await Dialog.confirm({
            content: '确认删除？'
        })
        if (!flag) {
            return
        }
        const { code, data, msg } = await ApiStore.deleteSub(item)
        if (code !== 1) {
            Toast.show({ content: msg })
            return
        }
        setConfigs(data ?? [])
    }

    const update = async (item: SubItem) => {
        const flag = await Dialog.confirm({
            content: '确认更新？'
        })
        if (!flag) {
            return
        }

        const { code, data, msg } = await Utils.load(() => {
            return ApiStore.updateSub(item)
        }, '更新配置')

        if (code !== 1) {
            Toast.show({ content: msg })
            return
        }
        setConfigs(data ?? [])

        switchConfig(item, msg)
    }

    const detail = async (item: SubItem) => {
        const { code, data, msg } = await ApiStore.getSubYaml(item.name)
        if (code !== 1) {
            Toast.show({ content: msg })
            return
        }

        Dialog.alert({ content: <pre>${data}</pre> })
    }

    const switchConfig = async (item: SubItem, loading?: React.ReactNode) => {
        const flag = await Dialog.confirm({
            title: '切换此配置',
            content: loading
        })
        if (!flag) {
            return
        }
        const { code, msg, data } = await Utils.load(() => {
            return ApiStore.restart(item.name)
        }, '正在重启')
        if (code !== 1) {
            Toast.show({ content: msg })
            return
        }
        data?.name && setName(data.name)
        Toast.show({ content: '切换成功' })
    }

    useEffect(() => {
        refresh()
    }, [])

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
                                            switchConfig(
                                                item,
                                                <div style={{ textAlign: 'center' }}>
                                                    请确认配置文件已更新
                                                    <br />
                                                    否则切换将导致服务无法启动
                                                </div>
                                            )
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
                                        onClick={() => {
                                            detail(item)
                                        }}>
                                        查看
                                    </Button>
                                    <Button
                                        size="small"
                                        color="success"
                                        onClick={() => {
                                            update(item)
                                        }}>
                                        更新
                                    </Button>
                                    <Button
                                        size="small"
                                        color="danger"
                                        onClick={() => {
                                            del(item)
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
                        content: (
                            <AddConfig
                                add={(item) => {
                                    add(item)
                                }}
                            />
                        ),
                        closeOnMaskClick: true
                    })
                }}>
                新增配置
            </Button>
        </div>
    )
}
