# hexo-theme-mustom
all written by qoder 
脱敏是去掉我blog的信息方便套用
主要参考了 jinyaoMa 的主题 与 https://blog.douchi.space/ 的组件
介于原主题archive好久了而且一个hexo ver一个vue ver而我打算换新的，全交给ai了
已迁移到Astro，这个主题可能不能跑我也懒得管了

## 这一份是改过的 fork（已脱敏）

上游是 `jinyaoMa/hexo-theme-mustom@e729ac5`（远端 `master` 的 HEAD，上游最后一版，此后无维护）。这一份在原站点上跑了一段时间之后抽出来做成了通用模板：个人标识全部换成占位、零引用的文件删掉、看板娘模型不打包、有公开出处的第三方件改指外链。目录形状和上游一致——`README.md`、`_config.yml`、`layout/`、`scripts/`、`source/`，另多一个 hexo 完全不读的 `docs/`（两份说明 + 站点侧样例）；主题本体共 228 个文件（具体字节数写在 `docs/对比原版.md` 第十节，那里才写数——本文件在统计集合里，把数字写在这儿的话，改我这句话就把那个数改旧了）。相对上游少掉的 36 个文件（组成由 `_tmp/theme_diff_tpl.py` 现跑分组，上游侧合计 9,853,303 字节）：改成外链字体链后出库的 `SourceHanSansCN.otf`（8,800,680）、上游自带的 haruto 看板娘模型 14 件（431,306）、零引用的 8 张图（333,733，含上游自己也从没引用过的 `empty.png`/`qf3cu.jpg`/`qf3cu.png`）、网易云 `audioplayer`/`APlayer`/`Meting`/`L2Dwidget`/`md5` 那套插件 10 件（262,344）、第 W 轮出库的 `asset/font/iconfont.{eot,ttf,woff}` 3 件（25,240）。Font Awesome 的 15 个字体文件（`fa-{brands-400,regular-400,solid-900}.{eot,svg,ttf,woff,woff2}`，合计 2,771,050 字节）在第 R 轮出过库、第 W3 轮又按"加一层本地兜底"放回主题，所以它们不在这 36 件里，名字记在这一句。本 fork 新增 17 个文件（`biliplayer`、`heatmap` 两块功能与 `scripts/plugin/heading-numbers.js`、占位壁纸 `img/bg.jpg`、`live2d/umaru/SOURCE.txt`、自托管看板娘运行时 `source/live2d/` 6 件）。

装的时候主题要整目录拷进 `themes/mustom/`，**别用 junction/symlink**——那样 hexo 不加载主题的 `scripts/`，构建照样退 0 但 `/asset/part/*.html` 全 0 字节、`/api/` 整个没有。

## 这 6 处站点侧的东西主题里没有

`layout/`、`source/`、`scripts/`、`_config.yml` 是完整的，但它伸手要站点根目录下的东西：

| 站点根目录下的 | 为什么必需 |
| --- | --- |
| `source/data/bili-playlist.json` | 主题 `_config.yml` 的 `biliplayer.playlist: /data/bili-playlist.json`，`biliplayer.js` 运行时 fetch 它。**它是构建期快照**，收藏夹加了歌不会自动同步 |
| `source/live/index.md` | `menus.main.live.url: /live/` 指向的那一页；front matter 用 `layout: page` + `name: live` + `parts: [page]` |
| `tools/bili_fav_dump.mjs`、`tools/bili_playlist_fix.mjs` | 前一个从 B 站收藏夹导出原始清单（`deno run -A tools/bili_fav_dump.mjs <media_id>`，`media_id` 就是收藏夹地址栏 `?media_id=` 那一串），后一个逐条核验可用性、剔除失效条目；跑过核验再构建，否则失效条目会播成播放器自带的 17 秒 `error.mp4` |
| `tools/search_index.mjs` | 正文是客户端从 `/api/*.json` 渲染的，静态索引器看不见；这个脚本把正文注回构建好的 HTML。必须跑在 `hexo generate` 之后、`pagefind` 之前 |
| `scaffolds/post.md`、`scaffolds/page.md` | 新文章/新页的 front matter 模板，`page.md` 里的 `parts` 字段是这套主题的页面机制要用的 |
| npm 依赖 | `hexo` `^8.1.2`、`hexo-renderer-ejs`、`hexo-renderer-stylus`、`hexo-renderer-markdown-it`、`hexo-generator-archive`/`-category`/`-index`/`-tag`（列表页路由）、`hexo-generator-feed` `^4.0.0`（不装则 RSS 那条是死链）、`hexo-server`（本地预览）、`pagefind` `^1.5.0`（devDependencies，构建期索引、不进产物）；`hexo-abbrlink` 与 `hexo-generator-restful` **主题的 `scripts/plugin/` 已自带源码，别再 npm 装同名包** |

CI 里也要在 `hexo generate` 与部署之间插两步：`node tools/search_index.mjs public`、`npx pagefind --site public`。少了 pagefind 那步，弹窗搜索（`source/asset/js/part/search.js`）取不到索引。

看板娘运行时（`source/live2d/` 6 件、103,890 字节，自托管的 [live2d-widget](https://github.com/stevenjoezhang/live2d-widget)）已经随主题打包，所以不在上面这张表里了——上游原本用的是 `L2Dwidget.min.js`（本 fork 已删）。主题内的三条本地硬引用由这一层自己满足：`layout/_partial/frame.ejs:138` 的 `/live2d/site.css`、`:140` 的 `window.LIVE2D_BASE`、`:142` 的 `/live2d/loader.js`。另外三件（`dist/waifu.css`、`live2d.min.js`、`dist/chunk/index2.js`）与上游发布件逐字节相同，第 R 轮起改指钉死 commit 的 jsdelivr 地址、不再存副本，见下面"外部出处"那张表。代价是主题 `source/` 里的东西进不了 SW 预缓存清单：`scripts/renderer/$template.js` 的 `precacheUrls` 只由站点 `source/` 下的页和资源、文章、`/api/*.json`、`/asset/part/*.html` 拼成（同一份自检站点实测：9 件放站点侧时清单 55 条、放主题侧 47 条，差的正好是 `/live2d/` 那 8 条，`LICENSE-live2d-widget.txt` 两边都不进；55/47 这个口径把首页 `/` 算进去了，验收脚本 `_tmp/roundN_build_verify.py` 的正则不匹配裸 `/`，报的是 54/46）。没进预缓存不影响能用，兜底路由 `fastest` 现取现缓存，只是每次换 SW 版本后第一次开页要重新下这一层。

## 等你填的占位

主题 `_config.yml` 的 `author.large` / `contact.*.url` / `hitokoto.name` / `manifest.name`，`source/asset/lang/{zh-cn,en}.yml` 的 `sitename` / `brand.name` / `brand.slogan`，`source/asset/img/bg.jpg`（正文背景图，`css/_common/dimension.styl` 的 `$picurl` 用它），以及 `source/asset/live2d/umaru/`（这个目录里只留了一张 `SOURCE.txt`，模型不随主题分发，出处 https://mx.paul.ren/model/umaru.html ）。

## 两条会咬人的规则

- 站点 `_config.yml` 的 `CDN_ENABLE` 必须 `false`：开了就把整份 `style.css` / `main.js` 换成上游 CDN 版，本 fork 的定制全被绕掉。
- `source/asset/img/` 里零引用的东西已删干净，判据是对每个二进制资源名在整棵树反向搜引用（含 `layout/`、`source/`、`scripts/`、`_config.yml`），语料排除说明文档自身。

本次提取的逐文件差异记录、脱敏清单和构建自检记录在 `docs/对比原版.md` 与 `docs/站点侧依赖.md`，上面那 6 处站点侧配套的样例副本在 `docs/example-site/`。`docs/` 不是 hexo 认识的目录（它只读主题的 `source/`、`layout/`、`_config.yml`、`scripts/`），所以这一层不进产物、也不影响把这一整个目录当主题上传。

## 外部出处：主题里引的第三方东西都钉在哪

判据只有一条：**CDN 上那份必须与原来存在主题里的那份逐字节相同**（sha256 对拍，脚本与结果 `_tmp/roundR_cdn_cmp.py` / `_tmp/roundR_cdn_cmp.txt`）。逐字节相同才叫"换个地方取同一个文件"，否则就是行为改动，一律留在本地不外链。

| 引什么 | 地址 | 为什么这么定 |
| --- | --- | --- |
| Font Awesome 界面图标字体（15 个文件） | `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.11.2/webfonts/` | 那 15 个字体文件与 npm 包内同路径产物逐个 sha256 相同（5.12.0 的字体全对不上）。本地这份 CSS 的文件头自报 **5.12.0**、类名集合与 5.12.0 的 `all.min.css` 完全一致（1,450 类、缺 0），也就是说"CSS 5.12.0 + 字体 5.11.2"这个错配是原来就带着的，钉 5.11.2 保持的正是浏览器原本取到的那 2,771,050 字节。`@font-face` 的 url 改指 CDN、CSS 本体仍留在主题里编译，所以类名覆盖与层叠顺序都没变，渲染字节不变。**第 W3 轮加了本地兜底**：这 15 件同时放在 `source/asset/font/`（与 CDN 那份逐字节相同），18 条 url 里带 `format()` 的 15 条各在后面追加一条同格式的站内孪生（`eot?#iefix`、`svg#fontawesome` 的查询与片段原样带过去），`src` 列表按顺序试到第一个可用，所以是"CDN 优先、取不到才落站内"；IE8 用的第一条无 `format()` 的 eot 故意不加孪生（它只认第一条 src）。这份 CSS 由 58,294 变 59,161 字节（sha256 `015727665973…`） |
| 看板娘样式 `waifu.css` | `https://cdn.jsdelivr.net/gh/stevenjoezhang/live2d-widget@34b27cc8bcbac20e56344429e890b9bad885d002/dist/waifu.css` | 与主题内原件 sha256 `ee9cec09…` 相同；钉 commit SHA 不钉分支 |
| Cubism 2 运行时 `live2d.min.js` | 同上仓库的 `dist/live2d.min.js` | 与主题内原件 sha256 `c16cb169…` 相同；由 `source/live2d/loader.js` 的 `cubism2Path` 给出 |
| Cubism 5 分块 `dist/chunk/index2.js` | 同上仓库的 `dist/chunk/index2.js` | 与主题内原件 sha256 `d4572b41…` 相同；由 `dist/waifu-tips.js` 里那句 `import` 给出 |
| 社交分享图标字体 `iconfont.{eot,woff,ttf}`（3 个文件） | `https://cdn.jsdelivr.net/npm/social-share.js@1.0.16/dist/fonts/` | 三件与 `social-share.js@1.0.12`–`@1.0.16` 五个版本的 `dist/fonts/` 逐字节相同，钉其中能对上字节的最新一版；`@1.0.17` 那档 404。同目录的 `iconfont.svg` 只差行尾（本地 CRLF、发布 LF），按"逐字节相同"这条判据不换，所以它仍在主题里 |

**这几件查不到逐字节相同的公开产物，所以仍在主题里**：`asset/js/plugin/av-min.js`（142,311）与 `Valine.min.js`（126,335）是上游作者按自己的入口打包过的 ESM 包装件，jsdelivr 上 `leancloud-storage`、`valine` 的官方产物字节都不同（`valine-1.4.4.min.js` 126,449、`valine-1.5.1.min.js` 180,169；`Valine.min.js` 自己 `init()` 里那句 `sdkLoader` 指向的 `leancloud-storage@3/dist/av-min.js` 实测 162,388 字节，也不是本地这份）；`socialShare.min.js` 同理（`social-share.js` 1.0.12/1.0.13 两个发布产物都对不上）；`asset/css/_plugin/github-markdown.min.css` 与 `github-markdown-css` 3.0.1/4.0.0/5.6.1 三个版本都不同；`asset/js/plugin/evanyou.js`（6,366，首页那个连线动画）同样是上游作者自己打包的那份、公开产物对不上；这几件到此收手——查了很久仍找不到逐字节相同的公开产物的就不再查，只把名字记全（连同各自查过哪些版本，列在 `docs/对比原版.md` 第十节末尾那张"留在本地"的表里，这六件一栏不缺）；`asset/font/iconfont.svg` 与发布版只差行尾（本地 CRLF 10,083、发布 LF 9,995，把 CRLF 换成 LF 后两边 sha256 都是 `50f182e2…`），这种只差行尾的情况按判据不算逐字节相同，所以不换。它的三件兄弟 `iconfont.eot/ttf/woff` 已在上面那张表里出库（与 `social-share.js@1.0.12`–`@1.0.16` 五个版本的 `dist/fonts/` 逐字节相同，复验 `_tmp/roundV_iconfont.py`、`_tmp/roundW2_urls.txt`），于是这个字体族的来源是裂开的：三档 CDN、一档本地。`socialShare.min.js` 与 `share.min.css` 两个本体确实是本站改过的（后者 4,265 字节，上游那份 4,371）。出处判据不成立的，宁可带着字节进仓库。

下面是上游原 README。

---

看效果点这里：[blog.ma-jinyao.cn](//blog.ma-jinyao.cn)

想用最新版的主题的话，可以把我的[整个网站](//github.com/jinyaoMa/my-hexo-site)下载下来慢慢改

更详细的使用指南：[Hexo主题Mustom使用指南](//blog.ma-jinyao.cn/posts/49651/)

如果想用 [blog.ma-jinyao.cn](//blog.ma-jinyao.cn) 里 菜单-其他 下 pages 的 parts，可以参考 [我的博客](https://github.com/jinyaoMa/my-hexo-site) 主目录下 source 里的文件、Front-matter 和目录结构。

_Hexo 主目录 \_config.yml 模版在页面底下_

## 关于本主题

- 主题只使用了 valine 评论
- 主题 _config.yml 没有任何的开关，比如开关翻译功能、开关评论功能等等
- 主题 _config.yml 里可以更换图片头像、链接、图标等等

## 添加菜单项目（layout/page only）

在主题 _config.yml 中，按格式修改 menus下的项目

``` yaml
menus:
  main: # 项目组
    home: # 项目
      url: / # 项目链接
      icon: '<i class="fas fa-home fa-fw"></i>' # 项目图标
    archive: # 项目
      url: /archives/ # 项目链接
      icon: '<i class="fas fa-archive fa-fw"></i>' # 项目图标
    about: # 项目
      url: /about/ # 项目链接
      icon: '<i class="fas fa-user fa-fw"></i>' # 项目图标
    links: # 新项目 <----------------------------------------------------
      url: /links/  # 新项目链接 <----------------------------------------
      icon: '<i class="fas fa-link fa-fw"></i>' # 新项目图标 <------------
```

接下来，在主题 source/asset/lang 文件夹中的 .yml 语言文件修改 menus 下的项目

``` yaml
menus:
  main: # 对应_config.yml中的项目组
    caption: 本站 # 项目组名称
    items: # 对应_config.yml中的项目
      home: 首页 # 项目名称
      archive: 归档 # 项目名称
      about: 关于 # 项目名称
      links: 友链 # 新项目名称 <-----------------------------------------
# ...
pather:
  links: 友链 # 新项目名称 <-----------------------------------------
```

使用这个 scaffold 生成新 page

``` yaml
---
title: {{ title }}
layout: page
name: {{ title }} # this name should be the same as folder name
parts: 
  - page
  - # custom parts
---
```

``` bash
hexo new page "新页面名称"
```

如果想自定义新 parts 的话，请根据 source/asset 里的文件目录结构自行摸索

添加新 parts 之后，需要在 layout/_partial/frame.ejs 中插入对应 part 名称的标签

## 更多

修改主题 _config.yml
``` yaml
meting: # 对应meting.js设置
  server: netease
  type: playlist
  id: "970057720"
  theme: "#ff3300"
  list_height: "297px" # 改这个之后还要跑source/asset/css/_common/dimension.styl里改$audioplayer_list_height
  
# 下面这两个可以参考 https://github.com/lavas-project/hexo-pwa
manifest:
serviceWorker:

# 改post中二维码
post:
  qrcode:
    qq: /asset/img/qq.png
    wechat: /asset/img/wechat.png

# 增加皮肤可以自行摸索（css中没有怎么分色，还是黑白好看，夜间模式更好看。。。）
skin:
  default: "#000000"
  colorful: "linear-gradient(to bottom right,#ff3333 ,#66cc66 , #0099cc)"
  newSkin: # 需要对应source/asset/css/_common/color.styl中的class
```

## 主目录 _config.yml 例子

``` yaml
# Site
title: "耀 の 个人网站 | Mark の Personal Website"
description: "耀 の 个人网站 | Mark の Personal Website"
author: jinyaoMa ( 耀 / Mark )
year: 2019

# URL
url: https://blog.ma-jinyao.cn
root: /

# Directory
source_dir: source
public_dir: docs # 方便使用Github Page
tag_dir: tags
archive_dir: archives
category_dir: categories
code_dir: code # markdown使用include_code标签
skip_render:
  - "code/*.*" # 排除code_dir
  - "extension/**/*.html" # 排除extension
  - "*.html" # 如果在在主目录source文件夹里放了搜索引擎验证的.html文件
  - "CNAME" # 如果在在主目录source文件夹里放了CNAME文件

# Writing
new_post_name: :title.md # File name of new posts
default_layout: post
titlecase: false # Transform title into titlecase
external_link:
  enable: true # Open external links in new tab
  field: site # Apply to the whole site
  exclude: ""
filename_case: 0
render_drafts: false
post_asset_folder: false
relative_link: false
future: true
highlight:
  enable: true
  line_number: true
  auto_detect: false
  tab_replace: "  "
  wrap: true
  hljs: false

# Date / Time format
date_format: YYYY-MM-DD
time_format: HH:mm:ss
## Use post's date for updated date unless set in front-matter
use_date_for_updated: false

# Extensions
## Plugins: https://hexo.io/plugins/
## Themes: https://hexo.io/themes/
theme: mustom

# Deployment
## Docs: https://hexo.io/docs/deployment.html
deploy:
  - type: baidu_url_submitter
  - type: git
    repo:

all_minifier: true # 如果装了 hexo-all-minifier
nofollow: # 如果装了 hexo-filter-nofollow
  enable: true
  field: post
sitemap: # 如果装了 hexo-generator-sitemap
  path: sitemap.xml
  rel: true
autoprefixer: # 如果装了 hexo-autoprefixer
  exclude:
    - "*.min.css"
  overrideBrowserslist:
    - "last 2 versions"
babelify: # 如果装了 hexo-renderer-babelify + @babel/preset-env
  presets:
    - "@babel/preset-env"
  sourceMaps: true

ignore:
  #- "**/source/asset/js/common/*.js" # 如果装了 hexo-renderer-babelify
  #- "**/source/asset/js/part/*.js" # 如果装了 hexo-renderer-babelify
  #- "**/source/asset/js/plugin/!(L2Dwidget.0.min.js)" # 如果装了 hexo-renderer-babelify

# 百度主动推送
baidu_url_submit:
  count: 1000 # 提交最新的一个链接
  host: ma-jinyao.cn # 在百度站长平台中注册的域名
  token: "" # 请注意这是您的秘钥， 所以请不要把博客源代码发布在公众仓库里!
  path: baidu_urls.txt # 文本文档的地址， 新链接会保存在此文本文档里

# 百度翻译API
baidu_translate:
  appid: ""
  appkey: ""

# 主题用的Valine评论
valine:
  appid: ""
  appkey: ""

# 搜索引擎验证
google_site_verification: ""
baidu_site_verification: ""

```
