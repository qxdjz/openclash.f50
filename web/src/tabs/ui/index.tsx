import React, { useEffect, useState } from 'react'
import { ApiStore } from '../../utils/api'
import { Toast } from 'antd-mobile'

export const ExternalControl = () => {
    const [url, setUrl] = useState<string | undefined>(undefined)

    useEffect(() => {
        ApiStore.getExternalUrl().then(({ code, data, msg }) => {
            if (code !== 1) {
                Toast.show({ content: msg })
                return
            }
            //data && setUrl('http://192.168.0.1:9091/ui/#/?hostname=192.168.0.1&port=9091&secret=651352553a')
            data && setUrl(data)
        })
    }, [])

    return (
        <div style={{ width: '100%', height: '650px' }}>
            {url && (
                <iframe
                    src={url}
                    style={{ border: 'none' }}
                    width="100%"
                    height="100%"
                />
            )}
        </div>
    )
}
