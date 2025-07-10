const https = require('https')
https.globalAgent.options.timeout = 10 * 1000

module.exports = {
    get: async (url) => {
        return new Promise((resolve, reject) => {
            https
                .get(url, (response) => {
                    let todo = ''

                    // called when a data chunk is received.
                    response.on('data', (chunk) => {
                        todo += chunk
                    })

                    // called when the complete response is received.
                    response.on('end', () => {
                        resolve(todo)
                    })
                })
                .on('error', (error) => {
                    reject(error)
                })
        })
    }
}
