# OpenClashMagisk

## 安装方法

-   下载 openclash.zip 文件，通过 magisk 加载安装
-   重启设备
-   浏览器访问 192.168.0.1，首次访问需清理浏览器缓存，可看到 openclash 菜单入口即安装成功
    ![主菜单图片](https://qiniu.bieshuwang.com/clash_f50.png)

## 编译方法

-   安装 node 开发环境，版本大于等于 16.0.0
-   进入 server 目录，修改完代码，执行 npm run build，重新编译打包，脚本会自动将编译好的文件复制到 openclash/service 目录下
-   进入 web 目录，修改完代码，执行 npm run build，重新编译打包，脚本会自动将编译好的文件复制到 openclash/service/static 目录下
-   将本工程除了 server 和 web 目录外的所有其他文件打包成 zip 格式，复制到手机上进行安装即可

## 常用问题

-   中兴 F50 设备需要 root 后安装面具，才能使用本插件
-   lan 口须保持网关是：192.168.0.1，代码里写死了，暂时不支持修改 lan 口网段，后续版本支持
-   访问 192.168.0.1 如果未看到 openclash 入口，可通过访问http://192.168.0.1:3300/clash.html，查看服务是否运行
-   其他问题，可通过手机查看/data/adb/openclash/service/run/node.log 日志定位原因

## 郑重声明

-   本代码仓库允许大家自行修改，转载、复制、二次开发均须指明出处并备注该 GitHub 地址
-   严禁用于任何商业，谋取私利，保留一切追究权利

## 打赏

-   大家如果觉得不错，可以支持一下作者
-   如果有个性化的需求，欢迎讨论
-   项目刚刚启动，不够完善或存在问题，大家多多包涵
    ![主菜单图片](https://qiniu.bieshuwang.com/weixin_me.png)
