# 紫微泰克官网

南京紫微泰克技术有限公司（Nanjing Purple Microwave Technology Co., Ltd.）官方网站，介绍毫米波通信、卫星通信相控阵天线、公司信息及招聘岗位。

版本：**v1.0.0** · 整理日期：**2026-10-10**。

## 网站内容

网站由 15 个静态 HTML 页面组成，无需构建工具。

| 栏目 | 页面文件 |
| --- | --- |
| 首页 | `index.html` |
| 关于我们 | `company-profile.html`、`honors.html`、`company-culture.html` |
| 产品中心 | `products-ka.html`、`products-ku.html`、`products-bridge.html`、`products-radar.html`、`products-26ghz.html` |
| 定制相控阵需求 | `custom-array.html` |
| 新闻中心 | `news.html` |
| 加入我们 | `social-recruitment.html`、`campus-recruitment.html` |
| 联系我们 | `contact.html` |
| 下载中心 | `downloads.html` |

支持中文 / English 切换并记住语言选择。顶部包含下拉导航，手机使用折叠菜单；页面内容在向下滚动时轻缓显现。系统开启“减少动态效果”时直接显示内容。产品图片、证书及 PDF 保留原资料语言。

## 定制需求与邮件通知

表单收集工作频段、阵列规模、阵列极化、扫描角度、期望 EIRP、G/T，以及公司、联系方式和联系人。提交前须同意将这些信息通过 FormSubmit 转发给公司。

管理员收件邮箱为 `huyun@pmt-array.com`，已完成 FormSubmit 激活并确认能够接收邮件。网页成功提示表示表单服务已接收请求；网络或服务异常时保留填写内容，提示重试或直接联系。网站没有自建表单数据库或管理员后台。

## 本地预览

安装 Python 后，在网站目录运行：

```powershell
Set-Location -LiteralPath 'D:\PMT_website'
python -m http.server 4173 --bind 127.0.0.1
```

浏览器访问 [本地网站](http://127.0.0.1:4173/)。页面和图片可本地查看；提交表单及访问外部报道需要网络。

## 主要文件

- `main.js`、`navigation.css`：桌面下拉菜单、手机导航及页脚年份。
- `i18n.js`、`i18n-en.js`、`i18n.css`：语言切换、英文词典和排版适配。
- `custom-array.js`、`custom-array.css`：表单校验、提交状态及邮件服务对接。
- `reveal.js`、`reveal.css`：一次性滚动渐显，以及焦点、锚点、打印和减少动态效果的兼容处理。
- `styles.css`、`sections.css`、`products.css`、`atmosphere.css`：基础布局与样式；其他栏目 CSS 管理对应页面。
- `home-refinement.css`、`interior-surfaces.css`、`motion-backgrounds.css`：首页排版、内页蓝灰底色和背景层次。
- `assets/`、`hero.png`：Logo、实景及产品图片、证书、二维码、手册和概念背景。
- `.nojekyll`：供 GitHub Pages 直接托管静态文件。
- [SOURCES.md](SOURCES.md)：内容与图片来源；[CHANGELOG.md](CHANGELOG.md)：版本更新记录。

## 发布与仓库可见性

GitHub Pages 地址为 [紫微泰克网站](https://phoeni1x.github.io/ziwei-tech/)。v1.0.0 使用公开仓库发布，网站及仓库内容均可被公众访问。本地版本归档与线上部署是两个独立步骤，部署是否完成以 Pages 的实际结果为准。

沿用 GitHub Pages 时，在仓库 **Settings → Pages** 核对发布源为 `main` 分支的 `/ (root)` 目录，部署是否完成以 Pages 的实际结果为准。

私有仓库使用 GitHub Pages 需要支持该功能的套餐，例如 GitHub Pro、Team 或 Enterprise；GitHub Free 的 Pages 支持公开仓库。若当前套餐不支持，可使用独立静态托管服务部署这些文件，同时保持源码仓库私密。参见 [GitHub Pages 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)。

## 内容来源与维护

公司简介、荣誉、招聘、联系方式、产品参数及实景照片依据公司提供的资料整理；新闻保留来源、日期和原文入口。`hero.png` 是生成的卫星与地球概念视觉，并非公司实物照片。详细对应关系见 [SOURCES.md](SOURCES.md)。

更新页面中文内容时，同步维护 `i18n-en.js` 中对应英文译文；更换图片或手册时，检查文件路径、产品型号及参数是否一致。
