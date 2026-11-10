# 爪迹 · 养宠成长记录与社区

一个可直接部署到 GitHub Pages 的中文宠物成长记录产品原型。

固定线上入口：https://zzzzzmaglic.github.io/pet-growth/

## 本地预览

需要 Node.js 18 或以上版本，无需安装依赖。

```powershell
cd 'C:\Users\钟志轩\Desktop\pet-growth'
node preview.mjs
```

打开终端显示的 http://127.0.0.1:4173/pet-growth/ 。按 Ctrl+C 停止服务。

也可以直接双击 index.html 预览；推荐 HTTP 方式，以获得稳定的浏览器存储行为。

## 功能结构

- 今日陪伴：当前宠物、相伴天数、健康指标、体重曲线、健康待办、最近成长与社区动态。
- 健康档案：体重、疫苗、驱虫记录的新增/编辑/删除，下次计划与完成确认，记录自动进入时间线。
- 成长时间线：按月回顾、健康/日记/里程碑筛选、照片日记、主动分享到社区。
- 同城社区：城市/区域/宠物筛选、宠友兴趣筛选、关注、图文发布、点赞、评论、收藏。
- 我的：多宠物档案、个人地区资料、我的发布、JSON 数据导出、恢复示例。

## 数据说明

首次访问自动初始化两只宠物、数月体重、照护计划和跨城市社区示例。

所有修改仅保存在当前浏览器的 localStorage（键：pawprints-v1），没有后端、账号、云同步、真实用户通信或后台推送。健康档案和日记不会自动进入社区。照片上传在浏览器内缩放、压缩和保存，不发送到服务器。社区里的宠友和动态是示例，并在界面上说明。

不同设备、浏览器、域名以及本地和线上环境的数据相互独立。清理浏览器数据会丢失记录，请用“我的 → 导出 JSON”备份。导出目前用于留档，不含导入功能。

健康计划由用户依据兽医建议填写，不提供自动诊断和用药推荐。

## 发布更新（保持网址不变）

仓库已配置 GitHub Pages 从 main 分支根目录发布，不需要改动 Pages 设置或域名。

在本项目目录中执行：

```powershell
git add index.html styles.css app.js assets README.md .gitignore preview.mjs tests
git commit -m "Build Pawprints pet growth and community prototype"
git push origin main
```

等待 GitHub 仓库 Actions 中的 Pages 部署成功，再打开上面的固定线上入口。首次推送如 Git 要求登录或配置作者信息，使用自己的 GitHub 账号及提交身份完成。

所有静态资源均使用相对路径；页面使用 hash 路由，兼容 /pet-growth/ 子路径与页面刷新。

## 检查

```powershell
node --check app.js
node tests/smoke.mjs
```

19 项无依赖自动检查覆盖：五页渲染、多宠隔离、健康记录与时间线关联、负体重/未来日期/错误计划拦截、编辑不重复、计划完成幂等、私密日记不自动发布、主动分享、点赞切换、组合筛选、评论、HTML 转义、宠物日期、刷新恢复、存储失败回滚、损坏数据回退和记录删除关联。

浏览器实测：新增体重与刷新保留、多宠切换、日记新增与分享、地域筛选、关注、评论；桌面和 390px 手机布局检查。

## 文件

- index.html：页面容器、导航、弹窗和基本 metadata。
- styles.css：视觉样式、移动端适配和可访问性状态。
- app.js：示例数据、五个模块、交互及本地存储。
- assets/：随项目部署的照片和图标，无运行时第三方资源依赖。
- preview.mjs：仅监听本机的静态预览服务。
- tests/smoke.mjs：独立 Node.js 检查，不会修改真实浏览器数据。

## 图片来源

示例宠物照片来自 Unsplash，已保存为本地资源；并不表示示例宠友的真实身份。

- dog.jpg：https://images.unsplash.com/photo-1552053831-71594a27632d
- cat.jpg：https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba
- walk.jpg：https://images.unsplash.com/photo-1548199973-03cce0bbc87b
