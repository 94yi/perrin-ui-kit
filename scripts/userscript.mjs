import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
export async function generateUserscript(){
 const source=(await readFile(new URL('src/spacing-control.js',root),'utf8')).replace('export function mountSpacingControl','function mountSpacingControl');
 const metadata=`// ==UserScript==
// @name         Perrin UI 间距控制
// @namespace    https://github.com/94yi/perrin-ui-kit
// @version      1.0.0
// @description  可复用的桌面页面间距控制，支持本机保存、预览与恢复默认。
// @match        https://perrin.love/*
// @match        http://localhost:5174/*
// @match        http://127.0.0.1:5174/*
// @grant        none
// @run-at       document-end
// ==/UserScript==
`;
 await mkdir(new URL('browser/',root),{recursive:true});
 await writeFile(new URL('browser/perrin-spacing.user.js',root),metadata+`(function(){\n'use strict';\nif(window.PerrinSpacing)window.PerrinSpacing.destroy();\n`+source+`\nwindow.PerrinSpacing=mountSpacingControl();\n})();\n`);
}
if(process.argv[1]===fileURLToPath(import.meta.url))await generateUserscript();
