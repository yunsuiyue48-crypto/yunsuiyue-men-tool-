# 云岁月对接类目上新指引

直接把本压缩包内文件上传/替换到 GitHub 仓库根目录即可。

## 关键目录
- index.html
- style.css
- app.js
- data/category-data.js
- data/open-direction-data.js
- data/title-data.js
- data/visual-data.js
- assets/styles/padded/（已包含棉羽绒 PPT 导出的 PNG 和 PDF）
- source-files/云岁月对接路径表.xlsx

## 还需要保留你原仓库中的套装/正装素材
如果你希望套装和正装 PDF 正常显示，请确认存在：
assets/styles/sets/开款参考.pdf

如果你有以下图片，也可以继续保留：
assets/styles/sets/肌理短裤短袖.png
assets/styles/sets/图案图形 短袖短裤.png
assets/styles/sets/运动速干.png
assets/styles/sets/战术服套装.png

本版本已修复：
1. open-direction-data.js 中代码块符号导致 JS 无法解析的问题
2. image 字段后缺少逗号导致 JS 整体报错的问题
3. PDF URL 出现双 # 的问题
4. PDF 页码与 toolbar 参数冲突的问题
5. 图片优先、PDF 兜底预览逻辑
6. 棉羽绒(1).pptx 已转换为 GitHub 可直接访问的 PNG + PDF 资产
