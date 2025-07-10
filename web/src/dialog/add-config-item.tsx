import { Button, Form, Input } from 'antd-mobile'
import React from 'react'
import { SubItem } from '../utils/api'

export const AddConfig = (props: { add: (item: SubItem) => void }) => {
    return (
        <div className="m_add">
            <Form
                name="form"
                onFinish={(data) => {
                    props.add({ name: data.name, url: data.url })
                }}
                footer={
                    <Button
                        block
                        type="submit"
                        color="primary"
                        size="large">
                        提交
                    </Button>
                }>
                <Form.Item
                    name="name"
                    label="配置名称"
                    help="配置名称"
                    rules={[{ required: true, pattern: new RegExp(/^[a-zA-Z]{1,10}$/) }]}>
                    <Input placeholder="请输入配置名称" />
                </Form.Item>
                <Form.Item
                    name="url"
                    label="订阅地址"
                    help="订阅地址"
                    rules={[{ required: true, type: 'url' }]}>
                    <Input placeholder="请输入订阅地址" />
                </Form.Item>
            </Form>
        </div>
    )
}
