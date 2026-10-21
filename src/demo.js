import {mountSpacingControl} from './spacing-control.js';
const spacing = mountSpacingControl({root:document.querySelector('#app')});
document.querySelector('#spacing').onclick = () => spacing.open();
const names={overview:'运行总览',messages:'对话记录',memory:'记忆卡片',settings:'模块设置'};
function navigate(){const page=location.hash.slice(1);const active=Object.hasOwn(names,page)?page:'overview';for(const node of document.querySelectorAll('[data-view]'))node.hidden=node.dataset.view!==active;for(const button of document.querySelectorAll('[data-page]')){if(button.dataset.page===active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');}document.querySelector('#page-title').textContent=names[active];document.title=names[active]+' · Perrin UI Kit';}
for(const button of document.querySelectorAll('[data-page]'))button.onclick=()=>{location.hash=button.dataset.page;};
window.addEventListener('hashchange',navigate);navigate();
const theme=document.querySelector('#theme');
function setTheme(dark){document.documentElement.dataset.theme=dark?'dark':'light';theme.setAttribute('aria-pressed',String(dark));theme.textContent=dark?'浅色外观':'深色外观';}
try{setTheme(localStorage.getItem('perrin-ui-theme')==='dark');}catch{}
theme.onclick=()=>{const dark=document.documentElement.dataset.theme!=='dark';setTheme(dark);try{localStorage.setItem('perrin-ui-theme',dark?'dark':'light');}catch{}};
function filter(){const q=document.querySelector('#search').value.trim().toLowerCase(),state=document.querySelector('#filter').value;let count=0;for(const card of document.querySelectorAll('#memory-list .panel')){card.hidden=!(card.textContent.toLowerCase().includes(q)&&(state==='all'||card.dataset.state===state));if(!card.hidden)count++;}document.querySelector('#empty').hidden=count>0;}
document.querySelector('#search').oninput=filter;document.querySelector('#filter').onchange=filter;
document.querySelector('#message-form').onsubmit=event=>{event.preventDefault();const input=document.querySelector('#message-input');if(!input.value.trim())return;const item=document.createElement('li');item.className='mine';const text=document.createElement('p');text.textContent=input.value.trim();item.append(text);document.querySelector('#message-list').append(item);input.value='';};
const form=document.querySelector('#settings-form'),status=document.querySelector('#settings-status');
let saved={projectName:'我的控制台',description:'在现有组件基础上逐步完善你的页面。',showHint:true};
try{const data=JSON.parse(localStorage.getItem('perrin-ui-demo-settings'));if(data&&typeof data.projectName==='string'&&typeof data.description==='string'&&typeof data.showHint==='boolean')saved={projectName:data.projectName.slice(0,60),description:data.description.slice(0,500),showHint:data.showHint};}catch{}
function restore(){form.elements.projectName.value=saved.projectName;form.elements.description.value=saved.description;form.elements.showHint.checked=saved.showHint;document.querySelector('.notice').hidden=!saved.showHint;}
restore();form.oninput=()=>{status.textContent='未保存';};
form.onsubmit=event=>{event.preventDefault();const next={projectName:form.elements.projectName.value.trim(),description:form.elements.description.value,showHint:form.elements.showHint.checked};try{localStorage.setItem('perrin-ui-demo-settings',JSON.stringify(next));saved=next;restore();status.textContent='已保存在本机';}catch{status.textContent='保存失败，请检查浏览器存储权限';}};
document.querySelector('#cancel-settings').onclick=()=>{restore();status.textContent='已取消未保存的修改';};
