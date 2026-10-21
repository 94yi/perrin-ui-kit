import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
export async function checkBrowser(browser,origin='http://127.0.0.1:5174'){
 const report=[];
 for(const width of [1440,820,390]){
  const context=await browser.newContext({viewport:{width,height:1000}});
  let blocked=0;const errors=[];
  await context.route('**/*',route=>{const req=route.request();if(new URL(req.url()).origin!==origin||req.method()!=='GET'){blocked++;return route.abort();}return route.continue();});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin);await page.getByRole('button',{name:'记忆',exact:true}).click();await page.getByRole('heading',{name:'记忆卡片',exact:true}).waitFor();
  await page.locator('#search').fill('不存在的关键词');await page.locator('#empty').waitFor({state:'visible'});
  await page.locator('#search').fill('');await page.locator('#filter').selectOption('approved');assert.equal(await page.locator('#memory-list .panel:visible').count(),2);
  await page.getByRole('button',{name:'深色外观',exact:true}).click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await page.getByRole('button',{name:'调整间距',exact:true}).click();await page.getByRole('slider',{name:'卡片内边距'}).fill('30');
  assert.equal(await page.locator('#memory-list .panel').first().evaluate(el=>getComputedStyle(el).paddingTop),width>768?'30px':'16px');
  await page.getByRole('button',{name:'保存',exact:true}).last().click();await page.reload();
  if(width>768)assert.equal(await page.locator('#memory-list .panel').first().evaluate(el=>getComputedStyle(el).paddingTop),'30px');
  await page.getByRole('button',{name:'调整间距',exact:true}).click();await page.getByRole('button',{name:'恢复默认',exact:true}).click();assert.equal(await page.locator('#memory-list .panel').first().evaluate(el=>getComputedStyle(el).paddingTop),width>768?'18px':'16px');
  await page.getByRole('button',{name:'关闭间距设置'}).click();
  await page.getByRole('button',{name:'设置',exact:true}).click();await page.getByRole('heading',{name:'模块设置',exact:true}).waitFor();
  await page.getByRole('textbox',{name:'项目名称'}).fill('测试项目');await page.locator('#settings-form').getByRole('button',{name:'保存',exact:true}).click();await page.reload();assert.equal(await page.getByRole('textbox',{name:'项目名称'}).inputValue(),'测试项目');
  await page.getByRole('textbox',{name:'项目名称'}).fill('未保存修改');await page.getByRole('button',{name:'取消修改',exact:true}).click();assert.equal(await page.getByRole('textbox',{name:'项目名称'}).inputValue(),'测试项目');
  await page.getByRole('button',{name:'对话',exact:true}).click();await page.locator('#message-input').fill('<img src=x onerror=alert(1)>');await page.getByRole('button',{name:'添加到示例'}).click();assert.equal(await page.locator('#message-list img').count(),0);assert.equal(await page.locator('#message-list li').last().textContent(),'<img src=x onerror=alert(1)>');
  await page.goto(origin+'/examples/minimal.html');await page.getByRole('heading',{name:'我的新页面'}).waitFor();await page.getByRole('button',{name:'间距',exact:true}).click();await page.getByRole('slider',{name:'卡片内边距'}).fill('26');assert.equal(await page.locator('.card-grid .panel').first().evaluate(el=>getComputedStyle(el).paddingTop),width>768?'26px':'16px');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);assert.equal(blocked,0);
  if(process.env.SCREENSHOT_DIR)await page.screenshot({path:process.env.SCREENSHOT_DIR+'/perrin-ui-kit-'+width+'.png'});
  report.push({width,navigation:true,filter:true,settings:true,spacing:true,minimal_page:true,no_external_requests:true});await context.close();
 }
 // A blank existing page receives only the standalone script, without demo code.
 const standalone=await browser.newContext({viewport:{width:1200,height:800}});
 const p=await standalone.newPage();
 await p.route('**/standalone-check.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><link rel="stylesheet" href="/src/styles.css"><div class="shell"><article class="panel">独立脚本测试</article></div>'}));
 await p.goto(origin+'/standalone-check.html');
 await p.addScriptTag({url:origin+'/browser/perrin-spacing.user.js'});
 await p.evaluate(()=>{PerrinSpacing.set({card:31});});
 assert.equal(await p.locator('.panel').evaluate(el=>getComputedStyle(el).paddingTop),'31px');
 await p.addScriptTag({url:origin+'/browser/perrin-spacing.user.js'});
 assert.equal(await p.locator('div[data-spacing-control]').count(),1);
 await p.evaluate(()=>PerrinSpacing.destroy());
 assert.equal(await p.locator('.panel').evaluate(el=>getComputedStyle(el).paddingTop),'18px');
 const isolation=await p.evaluate(async()=>{
   const {mountSpacingControl}=await import('/src/spacing-control.js');
   const roots=[document.createElement('div'),document.createElement('div')];
   for(const root of roots){root.innerHTML='<div class="panel">隔离测试</div>';document.body.append(root);}
   const a=mountSpacingControl({root:roots[0],storageKey:'isolation-a'}),b=mountSpacingControl({root:roots[1],storageKey:'isolation-b'});
   a.set({card:23});b.set({card:35});
   const result=roots.map(root=>getComputedStyle(root.firstChild).paddingTop);a.destroy();b.destroy();return result;
 });
 assert.deepEqual(isolation,['23px','35px']);await standalone.close();
 report.push({standalone_script:true,duplicate_install:true,root_isolation:true});
 return report;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const {chromium}=await import('playwright');const browser=await chromium.launch();
 try{console.log(JSON.stringify(await checkBrowser(browser,process.env.TEST_ORIGIN||'http://127.0.0.1:5174')));}finally{await browser.close();}
}
