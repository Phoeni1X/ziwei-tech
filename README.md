# 紫微泰克官网

南京紫微泰克技术有限公司（Purple Microwave Technology）展示网站，介绍毫米波通信、卫星通信相控阵天线、产品配置、研发测试与联系方式。

公开网址：https://phoeni1x.github.io/ziwei-tech/

## 文件

- `index.html`：页面内容与结构。
- `styles.css`：原始布局、首屏与响应式样式。
- `sections.css`：内容区基础样式、业务卡片和愿景区样式。
- `products.css`：产品目录、参数表、研发与联系区的响应式样式。
- `atmosphere.css`：暗室、阵面与空天照片背景，蓝紫色遮罩、半透明卡片及手机适配。
- `main.js`：手机导航和页脚年份。
- `hero.png`：生成的卫星与地球概念背景，非公司实物照片。
- `assets/`：从用户提供的产品手册提取的 Logo、产品和测试照片、二维码，以及原始手册 PDF。
- `SOURCES.md`：公开文案、产品参数与图片的来源对应。
- `.nojekyll`：让 GitHub Pages 直接提供静态文件。

## 本地查看

在本目录运行 `python -m http.server 4173`，访问 `http://localhost:4173`。

## 发布

GitHub 仓库的 Settings → Pages 中，选择 Deploy from a branch、`main` 分支及 `/ (root)` 目录。之后推送到 `main` 的修改会自动发布。

网站没有收集数据的表单、第三方字体、外部脚本或统计追踪。图片和所有页面资源随仓库一同托管。

公司名称、产品参数和联系方式以提供的产品手册为依据。媒体专访标明 2025 年报道时点；“国内头部相控阵企业”保留为发展目标。
