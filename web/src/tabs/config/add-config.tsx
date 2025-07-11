import { Button, Form, Input, Modal, Selector, Space } from 'antd-mobile'
import React from 'react'
import { SubItem } from '../../utils/api'

export const AddConfig = (props: { item?: SubItem; confirm: (item: SubItem) => void }) => {
    return (
        <div className="m_add">
            <Form
                name="form"
                onFinish={(data) => {
                    props.confirm(data)
                }}
                footer={
                    <Space
                        justify="end"
                        style={{ width: '100%' }}>
                        <Button
                            block
                            color="default"
                            size="small"
                            onClick={() => {
                                Modal.clear()
                            }}>
                            取消
                        </Button>

                        <Button
                            block
                            type="submit"
                            color="primary"
                            size="small">
                            提交
                        </Button>
                    </Space>
                }>
                <Form.Item
                    name="name"
                    label="配置名称"
                    help="配置名称"
                    initialValue={props.item?.name}
                    rules={[{ required: true, pattern: new RegExp(/^[a-zA-Z]{1,10}$/) }]}>
                    <Input placeholder="请输入配置名称" />
                </Form.Item>
                <Form.Item
                    name="url"
                    label="订阅地址"
                    help="订阅地址"
                    initialValue={props.item?.url}
                    rules={[{ required: true, type: 'url' }]}>
                    <Input placeholder="请输入订阅地址" />
                </Form.Item>
                <Form.Item
                    name="includes"
                    label="筛选节点"
                    help="筛选节点：如果有多个,请用英文逗号隔开,示例: 香港,日本"
                    initialValue={props.item?.includes}>
                    <Input placeholder="请输入筛选节点" />
                </Form.Item>
                <Form.Item
                    name="excludes"
                    label="排除节点"
                    help="排除节点：如果有多个,请用英文逗号隔开,示例: 香港,日本"
                    initialValue={props.item?.excludes}>
                    <Input placeholder="请输入排除节点" />
                </Form.Item>
                <Form.Item
                    name="invalides"
                    label="排除无效节点"
                    help="排除无效节点"
                    initialValue={props.item?.invalides}>
                    <Selector
                        multiple={true}
                        options={[
                            { label: '过期时间', value: '过期时间' },
                            { label: '剩余流量', value: '剩余流量' },
                            { label: 'TG群', value: 'TG群' },
                            { label: '官网', value: '官网' }
                        ]}
                    />
                </Form.Item>
            </Form>
        </div>
    )
}
