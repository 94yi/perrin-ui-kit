# Perrin UI Kit

独立的控制台前端工具包：**可运行的页面模板 + 可复用样式变量与组件 + 间距控制脚本**。

无需原 Companion/Perrin 工作区，不调用其后端。无需构建框架或运行时第三方依赖，使用系统字体，可复制到自己的项目中使用。

## 运行与构建

需要 Node.js 22 或更新版本：

```bash
git clone https://github.com/94yi/perrin-ui-kit.git
cd perrin-ui-kit
npm ci
npm run dev
```

打开 **http://127.0.0.1:5174/**。`PORT=5175 npm run dev` 可更换端口。

```bash
npm test           # 资源引用、独立脚本和预览服务器检查
npm run build      # 生成 dist/，并同步 browser/ 中的独立脚本
npm run preview    # 在本机预览 dist/
```

部署时上传 `dist/` **全部内容**到静态站点目录即可。默认只监听本机，未提供线上认证或业务服务。所有资源使用相对路径，支持部署在子目录。不要直接双击 HTML，ES 模块需要 HTTP(S) 服务。

## 包含什么

| 目录 | 用途 |
| --- | --- |
| `index.html`、`src/demo.js` | 总览、对话、记忆、设置四页模板；导航、筛选、深浅色、本机设置保存与取消 |
| `src/tokens.css` | 颜色、字体、圆角、间距等 CSS 变量 |
| `src/styles.css` | 侧栏、顶栏、统计、卡片网格、表单、按钮、消息列表、响应式布局 |
| `src/spacing-control.js` | ES 模块间距控制器，支持按页面根元素隔离 |
| `browser/perrin-spacing.user.js` | 无需模块环境的独立脚本，含脚本管理器元信息 |
| `examples/minimal.html` | 新页面最小接入示例，可直接复制 |
| `scripts/` | Node 原生构建与静态预览工具 |
| `tests/` | 构建、服务边界与可选浏览器交互检查 |

示例消息、资料均为虚构演示内容；设置只保存在浏览器。消息输入按纯文本渲染，不执行输入的 HTML。

## 用它构建新页面

复制 `examples/minimal.html` 与 `examples/minimal.js`，保留 `src/`，按实际目录修改路径：

```html
<link rel="stylesheet" href="./src/styles.css">
<div class="ui-app shell" id="my-page">
  <section class="section">
    <div class="card-grid">
      <article class="panel"><h2>内容标题</h2><p>正文</p></article>
      <article class="panel"><h2>另一项内容</h2><p>正文</p></article>
    </div>
  </section>
</div>
<script type="module" src="./page.js"></script>
```

`page.js`：

```js
import {mountSpacingControl} from './src/spacing-control.js';
const spacing = mountSpacingControl({
  root: document.querySelector('#my-page'),
  storageKey: 'my-project-spacing-v1',
});
spacing.set({section: 24, card: 20, grid: 16, controls: 8, form: 16});
// spacing.save(); // 用户明确保存时再写入本机设置
```

可选组件类：`page-head`、`sidebar`、`stats`、`panel`、`card-grid`、`control-grid`、`config-form`、`toolbar`、`actions`、`pager`、`message-workspace`。大于 768 px 使用桌面布局，较窄屏幕自动纵向排列。间距调节覆盖只在桌面宽度生效，保留手机默认布局。

修改 `src/tokens.css`，或在自己的样式中覆盖变量：

```css
:root {
  --primary: #536f81;
  --bg: #f2f5f7;
  --radius-card: 12px;
  --section-gap: 24px;
  --card-padding: 20px;
}
```

### 已有项目 / Vue / React

引入 CSS 后使用相应组件类；在组件挂载后调用 `mountSpacingControl({root, storageKey})`，卸载时调用返回对象的 `destroy()`。不要求 Vue 或 React，不会注册全局路由，也不接管业务数据。

这个工具不是通用 HTML 页面生成器：现有页面要使用这些变量或组件类才能应用对应规则。对任意陌生网站不会自动判断所有布局。

## 独立间距脚本

下载仓库 `browser/perrin-spacing.user.js`，通过脚本管理器安装，或在页面末尾加载它：

```html
<script src="./browser/perrin-spacing.user.js"></script>
```

脚本管理器默认匹配 perrin.love 与本机 5174 端口；用于其他域名时自行修改头部 `@match`。普通 `<script>` 引入不受 `@match` 限制。**模块版本和独立版本二选一，避免重复挂载。**

右下角「间距」可调基础间距、区块间距、卡片内边距、网格间隔、按钮间隔及表单行间隔。修改即时预览；保存后刷新保留；取消返回上次保存值；恢复默认会移除覆盖及本机保存。

独立脚本控制台 API：

```js
PerrinSpacing.open();
PerrinSpacing.set({unit: 4, section: 24, card: 20, grid: 16, controls: 8, form: 16});
PerrinSpacing.get();
PerrinSpacing.save();
PerrinSpacing.reset();   // 清除保存，恢复网站自身样式
PerrinSpacing.destroy(); // 移除面板和覆盖，保留已保存值
```

ES 模块返回对象提供同样的方法。参数只接受有限数值并限制范围；编辑器使用 Shadow DOM 隔离界面，页面覆盖限定在传入根元素。不给服务器发送配置。站点 CSP 需允许同源 JS、CSS 及工具生成的内联样式。脚本执行前需有 `document.body`，适合放在页面末尾或组件挂载后运行。

## 可选浏览器验证

普通构建和 `npm test` 无需 Playwright。若要自行运行完整交互验证，临时安装浏览器测试工具：

```bash
npm install --no-save --package-lock=false playwright
npx playwright install chromium
npm run dev
# 另开终端
npm run test:browser
```

覆盖 1440 / 820 / 390 px 下的页面切换、筛选、主题、设置保存/取消、间距预览/持久化/重置、纯文本消息输入和最小页面接入；阻止外部请求及非 GET 请求。GitHub CI 运行无依赖的测试与构建，浏览器检查在本地单独运行。

## 边界与许可

这是页面模板和外观工具，不包含 QQ、模型、记忆数据库、账号权限或外卖接口。接入真实功能时需自行实现后端鉴权、接口和保存确认。未附带原项目商业字体、私有资源或真实用户数据。

MIT 许可，见 [LICENSE](LICENSE)。
