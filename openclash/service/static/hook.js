setInterval(() => {
    if (window.location.href.indexOf('/index.html#home') >= 0) {
        console.log('url', window.location.href)
        // 不同的固件版本，Hook点可能需要调整，按需修改即可
        const mark = document.getElementsByClassName('row margin-top-42')
        if (mark && mark.length === 1) {
            if (mark[0].className.indexOf('hook') === -1) {
                mark[0].className += ' hook'
                const parent = mark[0].parentElement
                const div = document.createElement('div')
                div.className = 'row'
                div.innerHTML = `<div class="col-xs-4"><a href="#clash"><div class="text-center"><img src="img/ic_openclash.png"/><span class="center-block margin-top-5">OpenClash</span></div></a></div>`
                parent.appendChild(div)
            }
        }
    }
}, 1000)
