<style>
input#ch_name {
  text-transform: uppercase;
}
.printModal{font-family:sans-serif;display:flex;text-align:center;font-weight:300;font-size:30px;left:0;top:0;position:absolute;color:#045fb4;width:100%;height:100%;background-color:hsla(0,0%,100%,.9)}.printClose{position:absolute;right:10px;top:10px}.printClose:before{content:"\00D7";font-family:Helvetica Neue,sans-serif;font-weight:100;line-height:1px;padding-top:.5em;display:block;font-size:2em;text-indent:1px;overflow:hidden;height:1.25em;width:1.25em;text-align:center;cursor:pointer}.printSpinner{margin-top:3px;margin-left:-40px;position:absolute;display:inline-block;width:25px;height:25px;border:2px solid #045fb4;border-radius:50%;animation:spin .75s linear infinite}.printSpinner:after,.printSpinner:before{left:-2px;top:-2px;display:none;position:absolute;content:"";width:inherit;height:inherit;border:inherit;border-radius:inherit}.printSpinner,.printSpinner:after,.printSpinner:before{display:inline-block;border-color:#045fb4 transparent transparent;animation-duration:1.2s}.printSpinner:before{transform:rotate(120deg)}.printSpinner:after{transform:rotate(240deg)}@keyframes spin{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}
.cheque .site-wrapper {
  background: linear-gradient(267deg,#91351e,#041568,#032a38,#703976)!important;
  background-size: 200% 400%!important;
  animation: gradient 15s ease infinite;
  color: #fff;
}
canvas#cheque_img {
  position: absolute;
  left: -11px;
  top: 10px;
  transform: scale(.99);
}
canvas#cheque_img_back {
  border: 1px solid #ddd;
  box-shadow: 0px 0px 6px 0px #858080;
  min-height: 287px;
  background: #ffffff94;
  border: 11px solid #ffff;
  border-right: 0;
}
.print_cheque {
  display: flex;
  min-height: 100vh;
  width: 100%;
  align-items: center;
  justify-content: space-evenly;
}
.left_box {
  display: flex;
  flex-direction: column;
  margin-right: 1vw;
}
.left_box input {
  display: block;
  height: 40px;
  width: 100%;
  margin-bottom: 10px;
  padding: 0 10px;
  color: #000;
}
button#populate ,#download,#print,button{
  height: 39px;
  max-width: 100%;
  text-transform: uppercase;
  font-size: 16px;
  background: #ddd;
  border: 1px solid #000;
  line-height: 40px;
  color: #000;
  padding: 0 15px;
}
select#company {
  margin-bottom: 10px;
  height: 35px;
  padding: 0 10px;
}
.print_cheque input, .print_cheque select {
  font-size: 14px;
  line-height: 35px;
}
button i { margin-left: 5px; }
button:hover { background: #fff !important; }
.btns {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
}
.right_box { position: relative; }
input#checkbox {
  max-width: 15px;
  height: 15px;
  display: inline-block;
  vertical-align: -webkit-baseline-middle;
  line-height: 15px;
}
@media screen and (max-width:991px){
  .print_cheque { flex-direction: column; margin-top: 5vh; }
  .print_cheque input { width: 100%; }
  .print_cheque #populate,.print_cheque #download,button#print,button#share {width: 100%;max-width: 100%;margin-bottom: 10px;}
  .right_box canvas { zoom: 60%; }
  .left_box { width: 75%; }
  .print_cheque { min-height: 100vh; }
}
@media screen and (max-width:767px){
  .right_box canvas { zoom: 45%; }
  .btns  button { font-size: 0px !important; }
  .btns  button i { font-size: 18px !important; vertical-align: middle; }
  .left_box h3 { font-size: 20px; }
  .left_box { width: 80%; }
}
</style>

<span class="msg"></span>
<div class="print_cheque">
  <div class="left_box">
    <h3>Write Cheque BBK</h3>
    <select id="company">
      <option>Intermid Consultancy</option>
      <option>Intermid Training Center</option>
      <option>Intergulf</option>
      <option>IDP</option>
    </select>
    <input type="text" id="ch_name" placeholder="Name" autocomplete="on">
    <input type="date" id="ch_date">
    <input type="number" min="1" step="any"   id="ch_amount" placeholder="Amount"/>

    <div class="btns">
      <button id="populate" style="display: none;"  >Sign<i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>
      <button id="download">download<i class="fa fa-download" aria-hidden="true"></i></button>
      <button type="button" id="print" >  Print <i class="fa fa-print" aria-hidden="true"></i></button>
      <button id="share" >Share<i class="fa fa-share-alt" aria-hidden="true"></i></button>
    </div>

    <label>Advanced
      <input type="checkbox" id="checkbox" onchange="showTextbox()">
    </label>

    <!-- SETTINGS with calibration + persistence -->
    <div class="settings" style="display:none;">
      <!-- existing line lengths -->
      <Label>Line 1
        <input type="number"  id="line_length" class="line_length" value="33">
      </label>
      <Label>Line 2
        <input type="number"  id="line_length2" class="line_length" value="33">
      </label>

      <!-- Name (Payee) -->
      <div style="margin-top:6px;font-weight:600;">Name (Payee)</div>
      <label>X <input type="number" id="cfg_name_x" value="115" step="1" style="width:90px;"></label>
      <label>Y <input type="number" id="cfg_name_y" value="80" step="1" style="width:90px;"></label>
      <label>Font px <input type="number" id="cfg_name_font" value="14" step="1" style="width:90px;"></label>
      <label>Tracking px <input type="number" id="cfg_name_track" value="0" step="0.2" style="width:90px;"></label>

      <!-- Amount (in words) -->
      <div style="margin-top:6px;font-weight:600;">Amount (in words)</div>
      <label>Start X <input type="number" id="cfg_words_x" value="90" step="1" style="width:90px;"></label>
      <label>Start Y <input type="number" id="cfg_words_y" value="110" step="1" style="width:90px;"></label>
      <label>Line gap px <input type="number" id="cfg_words_gap" value="28" step="1" style="width:90px;"></label>
      <label>Font px <input type="number" id="cfg_words_font" value="14" step="1" style="width:90px;"></label>
      <label>Tracking px <input type="number" id="cfg_words_track" value="0" step="0.2" style="width:90px;"></label>

      <!-- Amount (numbers) -->
      <div style="margin-top:6px;font-weight:600;">Amount (numbers)</div>
      <label>X <input type="number" id="cfg_num_x" value="410" step="1" style="width:90px;"></label>
      <label>Y <input type="number" id="cfg_num_y" value="143" step="1" style="width:90px;"></label>
      <label>Font px <input type="number" id="cfg_num_font" value="18" step="1" style="width:90px;"></label>

      <!-- Date -->
      <div style="margin-top:6px;font-weight:600;">Date digits</div>
      <label>Base X <input type="number" id="cfg_date_x" value="379" step="1" style="width:90px;"></label>
      <label>Base Y <input type="number" id="cfg_date_y" value="45" step="1" style="width:90px;"></label>
      <label>Gap day→ <input type="number" id="cfg_gap_day" value="23" step="0.5" style="width:90px;"></label>
      <label>Gap mon→ <input type="number" id="cfg_gap_mon" value="21" step="0.5" style="width:90px;"></label>
      <label>Gap year→ <input type="number" id="cfg_gap_year" value="21" step="0.5" style="width:90px;"></label>
      <label>Font px <input type="number" id="cfg_date_font" value="14" step="1" style="width:90px;"></label>

      <!-- Global -->
      <div style="margin-top:6px;font-weight:600;">Global canvas</div>
      <label>Scale <input type="number" id="cfg_scale" value="1.16" step="0.01" style="width:90px;"></label>
      <label>Rotate° <input type="number" id="cfg_rotate" value="90" step="1" style="width:90px;"></label>
    </div>
  </div>

  <div class="right_box">
    <img style="display: none;" crossorigin="Anonymous"  id="temp_img" class="private" src="https://intermid.net/wp-content/uploads/2023/01/bbk-3.jpg"/>
    <canvas id="cheque_img_back"></canvas>
    <canvas id="cheque_img"></canvas>
  </div>
</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.3/jspdf.min.js"></script>

<script>
/* ===================== printJS bundle (unchanged) ===================== */
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.printJS=t():e.printJS=t()}(window,(function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){e.exports=n(2)},function(e,t,n){},function(e,t,n){"use strict";n.r(t);n(1);var r={isFirefox:function(){return"undefined"!=typeof InstallTrigger},isIE:function(){return-1!==navigator.userAgent.indexOf("MSIE")||!!document.documentMode},isEdge:function(){return!r.isIE()&&!!window.StyleMedia},isChrome:function(){var e=arguments.length>0&&arguments[0]!==undefined?arguments[0]:window;return!!e.chrome},isSafari:function(){return Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor")>0||-1!==navigator.userAgent.toLowerCase().indexOf("safari")},isIOSChrome:function(){return-1!==navigator.userAgent.toLowerCase().indexOf("crios")}},o=r,i={show:function(e){var t=document.createElement("div");t.setAttribute("style","font-family:sans-serif; display:table; text-align:center; font-weight:300; font-size:30px; left:0; top:0;position:fixed; z-index: 9990;color: #0460B5; width: 100%; height: 100%; background-color:rgba(255,255,255,.9);transition: opacity .3s ease;"),t.setAttribute("id","printJS-Modal");var n=document.createElement("div");n.setAttribute("style","display:table-cell; vertical-align:middle; padding-bottom:100px;");var r=document.createElement("div");r.setAttribute("class","printClose"),r.setAttribute("id","printClose"),n.appendChild(r);var o=document.createElement("span");o.setAttribute("class","printSpinner"),n.appendChild(o);var a=document.createTextNode(e.modalMessage);n.appendChild(a),t.appendChild(n),document.getElementsByTagName("body")[0].appendChild(t),document.getElementById("printClose").addEventListener("click",(function(){i.close()}))},close:function(){var e=document.getElementById("printJS-Modal");e&&e.parentNode.removeChild(e)}},a=i;function l(e){return(l="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function d(e){return e.charAt(0).toUpperCase()+e.slice(1)}function c(e,t){for(var n=0;n<e.length;n++)if("object"===l(t)&&-1!==t.indexOf(e[n]))return!0;return!1}function s(e,t){var n,r=document.createElement("div");if(n=t.header,new RegExp("<([A-Za-z][A-Za-z0-9]*)\\b[^>]*>(.*?)</\\1>").test(n))r.innerHTML=t.header;else{var o=document.createElement("h1"),i=document.createTextNode(t.header);o.appendChild(i),o.setAttribute("style",t.headerStyle),r.appendChild(o)}e.insertBefore(r,e.childNodes[0])}function p(e){e.showModal&&a.close(),e.onLoadingEnd&&e.onLoadingEnd(),(e.showModal||e.onLoadingStart)&&window.URL.revokeObjectURL(e.printable);var t="mouseover";(o.isChrome()||o.isFirefox())&&(t="focus");window.addEventListener(t,(function n(){window.removeEventListener(t,n),e.onPrintDialogClose();var r=document.getElementById(e.frameId);r&&r.remove()}))}function u(e,t){try{if(e.focus(),o.isEdge()||o.isIE())try{e.contentWindow.document.execCommand("print",!1,null)}catch(n){e.contentWindow.print()}else e.contentWindow.print()}catch(r){t.onError(r)}finally{o.isFirefox()&&(e.style.visibility="hidden",e.style.left="-1px"),p(t)}}var f={send:function(e,t){document.getElementsByTagName("body")[0].appendChild(t);var n=document.getElementById(e.frameId);n.onload=function(){if("pdf"!==e.type){var t=n.contentWindow||n.contentDocument;if(t.document&&(t=t.document),t.body.appendChild(e.printableElement),"pdf"!==e.type&&e.style){var r=document.createElement("style");r.innerHTML=e.style,t.head.appendChild(r)}var i=t.getElementsByTagName("img");i.length>0?function(e){var t=e.map((function(e){if(e.src&&e.src!==window.location.href)return function(e){return new Promise((function(t){(function n(){e&&"undefined"!=typeof e.naturalWidth&&0!==e.naturalWidth&&e.complete?t():setTimeout(n,500)})()}))}(e)}));return Promise.all(t)}(Array.from(i)).then((function(){return u(n,e)})):u(n,e)}else o.isFirefox()?setTimeout((function(){return u(n,e)}),1e3):u(n,e)}}},m=function(e,t){if(e.base64){var n=Uint8Array.from(atob(e.printable),(function(e){return e.charCodeAt(0)}));b(e,t,n)}else{e.printable=/^(blob|http|\/\/)/i.test(e.printable)?e.printable:window.location.origin+("/"!==e.printable.charAt(0)?"/"+e.printable:e.printable);var r=new window.XMLHttpRequest;r.responseType="arraybuffer",r.addEventListener("error",(function(){p(e),e.onError(r.statusText)})),r.addEventListener("load",(function(){if(-1===[200,201].indexOf(r.status))return p(e),void e.onError(r.statusText);b(e,t,r.response)})),r.open("GET",e.printable,!0),r.send()}};function b(e,t,n){var r=new window.Blob([n],{type:"application/pdf"});r=window.URL.createObjectURL(r),t.setAttribute("src",r),f.send(e,t)}var y=function(e,t){var n=document.getElementById(e.printable);n?(e.printableElement=function r(e,t){for(var n=e.cloneNode(),o=Array.prototype.slice.call(e.childNodes),i=0;i<o.length;i++)if(-1===t.ignoreElements.indexOf(o[i].id)){var a=r(o[i],t);n.appendChild(a)}t.scanStyles&&1===e.nodeType&&n.setAttribute("style",function(e,t){for(var n="",r=(document.defaultView||window).getComputedStyle(e,""),o=0;o<r.length;o++)(-1!==t.targetStyles.indexOf("*")||-1!==t.targetStyle.indexOf(r[o])||c(t.targetStyles,r[o]))&&r.getPropertyValue(r[o])&&(n+=r[o]+":"+r.getPropertyValue(r[o])+";");return n+"max-width: "+t.maxWidth+"px !important; font-size: "+t.font_size+" !important;"}(e,t));switch(e.tagName){case"SELECT":n.value=e.value;break;case"CANVAS":n.getContext("2d").drawImage(e,0,0)}return n}(n,e),e.header&&s(e.printableElement,e),f.send(e,t)):window.console.error("Invalid HTML element id: "+e.printable)};var h=function(e,t){e.printableElement=document.createElement("div"),e.printableElement.setAttribute("style","width:100%"),e.printableElement.innerHTML=e.printable,f.send(e,t)},g=function(e,t){e.printable.constructor!==Array&&(e.printable=[e.printable]),e.printableElement=document.createElement("div"),e.printable.forEach((function(t){var n=document.createElement("img");if(n.setAttribute("style",e.imageStyle),n.src=t,o.isFirefox()){var r=n.src;n.src=r}var i=document.createElement("div");i.appendChild(n),e.printableElement.appendChild(i)})),e.header&&s(e.printableElement,e),f.send(e,t)};function w(e){return(w="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var v=function(e,t){if("object"!==w(e.printable))throw new Error("Invalid javascript data object (JSON).");if("boolean"!=typeof e.repeatTableHeader)throw new Error("Invalid value for repeatTableHeader attribute (JSON).");if(!e.properties||!Array.isArray(e.properties))throw new Error("Invalid properties array for your JSON data.");e.properties=e.properties.map((function(t){return{field:"object"===w(t)?t.field:t,displayName:"object"===w(t)?t.displayName:t,columnSize:"object"===w(t)&&t.columnSize?t.columnSize+";":100/e.properties.length+"%;"}})),e.printableElement=document.createElement("div"),e.header&&s(e.printableElement,e),e.printableElement.innerHTML+=function(e){var t=e.printable,n=e.properties,r='<table style="border-collapse: collapse; width: 100%;">';e.repeatTableHeader&&(r+="<thead>");r+="<tr>";for(var o=0;o<n.length;o++)r+='<th style="width:'+n[o].columnSize+";"+e.gridHeaderStyle+'">'+d(n[o].displayName)+"</th>";r+="</tr>",e.repeatTableHeader&&(r+="</thead>");r+="<tbody>";for(var i=0;i<t.length;i++){r+="<tr>";for(var a=0;a<n.length;a++){var l=t[i],c=n[a].field.split(".");if(c.length>1)for(var s=0;s<c.length;s++)l=l[c[s]];else l=l[n[a].field];r+='<td style="width:'+n[a].columnSize+e.gridStyle+'">'+l+"</td>"}r+="</tr>"}return r+="</tbody></table>"}(e),f.send(e,t)};function E(e){return(E="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var S=["pdf","html","image","json","raw-html"],x=function(){var e={printable:null,fallbackPrintable:null,type:"pdf",header:null,headerStyle:"font-weight: 300;",maxWidth:800,properties:null,gridHeaderStyle:"font-weight: bold; padding: 5px; border: 1px solid #dddddd;",gridStyle:"border: 1px solid lightgray; margin-bottom: -1px;",showModal:!1,onError:function(e){throw e},onLoadingStart:null,onLoadingEnd:null,onPrintDialogClose:function(){},onIncompatibleBrowser:function(){},modalMessage:"Retrieving Document...",frameId:"printJS",printableElement:null,documentTitle:"Document",targetStyle:["clear","display","width","min-width","height","min-height","max-height"],targetStyles:["border","box","break","text-decoration"],ignoreElements:[],repeatTableHeader:!0,css:null,style:null,scanStyles:!0,base64:!1,onPdfOpen:null,font:"TimesNewRoman",font_size:"12pt",honorMarginPadding:!0,honorColor:!1,imageStyle:"max-width: 100%;"},t=arguments[0];if(t===undefined)throw new Error("printJS expects at least 1 attribute.");switch(E(t)){case"string":e.printable=encodeURI(t),e.fallbackPrintable=e.printable,e.type=arguments[1]||e.type;break;case"object":for(var n in e.printable=t.printable,e.fallbackPrintable="undefined"!=typeof t.fallbackPrintable?t.fallbackPrintable:e.printable,e.fallbackPrintable=e.base64?"data:application/pdf;base64,".concat(e.fallbackPrintable):e.fallbackPrintable,e)"printable"!==n&&"fallbackPrintable"!==n&&(e[n]="undefined"!=typeof t[n]?t[n]:e[n]);break;default:throw new Error('Unexpected argument type! Expected "string" or "object", got '+E(t))}if(!e.printable)throw new Error("Missing printable information.");if(!e.type||"string"!=typeof e.type||-1===S.indexOf(e.type.toLowerCase()))throw new Error("Invalid print type. Available types are: pdf, html, image and json.");e.showModal&&a.show(e),e.onLoadingStart&&e.onLoadingStart();var r=document.getElementById(e.frameId);r&&r.parentNode.removeChild(r);var i=document.createElement("iframe");switch(o.isFirefox()?i.setAttribute("style","width: 1px; height: 100px; position: fixed; left: 0; top: 0; opacity: 0; border-width: 0; margin: 0; padding: 0"):i.setAttribute("style","visibility: hidden; height: 0; width: 0; position: absolute; border: 0"),i.setAttribute("id",e.frameId),"pdf"!==e.type&&(i.srcdoc="<html><head><title>"+e.documentTitle+"</title>",e.css&&(Array.isArray(e.css)||(e.css=[e.css]),e.css.forEach((function(e){i.srcdoc+='<link rel="stylesheet" href="'+e+'">'}))),i.srcdoc+="</head><body></body></html>"),e.type){case"pdf":if(o.isIE())try{console.info("Print.js doesn't support PDF printing in Internet Explorer.");var l=window.open(e.fallbackPrintable,"_blank");l.focus(),e.onIncompatibleBrowser()}catch(d){e.onError(d)}finally{e.showModal&&a.close(),e.onLoadingEnd&&e.onLoadingEnd()}else m(e,i);break;case"image":g(e,i);break;case"html":y(e,i);break;case"raw-html":h(e,i);break;case"json":v(e,i)}};"undefined"!=typeof window&&(window.printJS=x);t["default"]=x}])["default"]}));
/* ==================================================================== */

/* ================== Calibration config & persistence ================= */
const DEFAULT_CFG = {
  name_x:115, name_y:80, name_font:14, name_track:0,
  words_x:90, words_y:110, words_gap:28, words_font:14, words_track:0,
  num_x:410, num_y:143, num_font:18,
  date_x:379, date_y:45, gap_day:23, gap_mon:21, gap_year:21, date_font:14,
  scale:1.16, rotate:90
};
const STORAGE_KEY = 'cheque_calibration_v1';

function applyCfgToInputs(cfg){
  const set = (id,val)=>{ const el=document.getElementById(id); if(el) el.value = val; };
  set('cfg_name_x', cfg.name_x); set('cfg_name_y', cfg.name_y);
  set('cfg_name_font', cfg.name_font); set('cfg_name_track', cfg.name_track);

  set('cfg_words_x', cfg.words_x); set('cfg_words_y', cfg.words_y);
  set('cfg_words_gap', cfg.words_gap); set('cfg_words_font', cfg.words_font);
  set('cfg_words_track', cfg.words_track);

  set('cfg_num_x', cfg.num_x); set('cfg_num_y', cfg.num_y); set('cfg_num_font', cfg.num_font);

  set('cfg_date_x', cfg.date_x); set('cfg_date_y', cfg.date_y);
  set('cfg_gap_day', cfg.gap_day); set('cfg_gap_mon', cfg.gap_mon); set('cfg_gap_year', cfg.gap_year);
  set('cfg_date_font', cfg.date_font);

  set('cfg_scale', cfg.scale); set('cfg_rotate', cfg.rotate);
}
function loadCalibration(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {...DEFAULT_CFG};
    const parsed = JSON.parse(raw);
    return {...DEFAULT_CFG, ...parsed};
  }catch(e){ return {...DEFAULT_CFG}; }
}
function saveCalibration(){
  try{
    const cfg = readCfgFromInputs();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  }catch(e){}
}

function readCfgFromInputs(){
  const gv = id => Number(document.getElementById(id)?.value || 0);
  return {
    name_x: gv('cfg_name_x'), name_y: gv('cfg_name_y'), name_font: gv('cfg_name_font'), name_track: gv('cfg_name_track'),
    words_x: gv('cfg_words_x'), words_y: gv('cfg_words_y'), words_gap: gv('cfg_words_gap'), words_font: gv('cfg_words_font'), words_track: gv('cfg_words_track'),
    num_x: gv('cfg_num_x'), num_y: gv('cfg_num_y'), num_font: gv('cfg_num_font'),
    date_x: gv('cfg_date_x'), date_y: gv('cfg_date_y'), gap_day: gv('cfg_gap_day'), gap_mon: gv('cfg_gap_mon'), gap_year: gv('cfg_gap_year'), date_font: gv('cfg_date_font'),
    scale: Number(document.getElementById('cfg_scale')?.value || DEFAULT_CFG.scale),
    rotate: Number(document.getElementById('cfg_rotate')?.value || DEFAULT_CFG.rotate),
  };
}
/* ==================================================================== */

/* ==================== Drawing helpers (tracking/scale) =============== */
function fillTextWithTracking(ctx, text, x, y, trackingPx){
  if (!trackingPx) { ctx.fillText(text, x, y); return; }
  let cur = x;
  for (const ch of text) {
    ctx.fillText(ch, cur, y);
    cur += ctx.measureText(ch).width + trackingPx;
  }
}
function draw_canvas_with_cfg(cfg) {
  var cb = document.getElementById("cheque_img_back");
  var c  = document.getElementById("cheque_img");
  var img = document.getElementById("temp_img");

  // *** IMPORTANT: only draw when image is loaded ***
  if (!img || !img.complete || img.naturalWidth === 0) {
    return;
  }

  var ctx = c.getContext("2d");
  var ctx_b= cb.getContext("2d");
  ctx.canvas.width  = 650;
  ctx.canvas.height = img.height;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(cfg.scale, cfg.scale);
  ctx_b.canvas.width  = 650;
  ctx_b.canvas.height = img.height;
  ctx_b.setTransform(1,0,0,1,0,0);
  ctx_b.scale(cfg.scale, cfg.scale);
  ctx.clearRect(0,0,c.width,c.height);
  ctx_b.clearRect(0,0,cb.width,cb.height);
  ctx_b.drawImage(img, 0, 0);
}
/* ==================================================================== */

function draw_canvas() {
  // kept for compatibility; not used by generate_Cheque anymore
  var cb = document.getElementById("cheque_img_back");
  var c = document.getElementById("cheque_img");
  var img = document.getElementById("temp_img");
  img.crossOrigin="Anonymous";
  var ctx = c.getContext("2d");
  var ctx_b=  cb.getContext("2d");
  ctx.canvas.width  = 650;
  ctx.canvas.height = img.height;
  ctx.scale(1.16, 1.16);
  ctx_b.canvas.width  = 650;
  ctx_b.canvas.height = img.height;
  ctx_b.scale(1.16, 1.16);
  ctx_b.drawImage(img, 0, 0);
}

/* ======== WAIT FOR IMAGE BEFORE FIRST DRAW ======== */
jQuery(document).ready(function() {
  const cfg = loadCalibration();
  applyCfgToInputs(cfg);

  const img = document.getElementById('temp_img');
  function initialDraw() {
    draw_canvas_with_cfg(loadCalibration());
  }

  if (img) {
    if (img.complete && img.naturalWidth !== 0) {
      initialDraw();
    } else {
      img.onload = initialDraw;
    }
  }

  const start_date = document.getElementById('ch_date');
  if (start_date && !start_date.value) {
    start_date.value = new Date().toISOString().split('T')[0];
  }
});
/* ================================================== */

function bhd(amount){
  var words = new Array();
  words[0] = 'zero';words[1] = 'One';words[2] = 'Two';words[3] = 'Three';words[4] = 'Four';words[5] = 'Five';words[6] = 'Six';words[7] = 'Seven';words[8] = 'Eight';words[9] = 'Nine';words[10] = 'Ten';words[11] = 'Eleven';words[12] = 'Twelve';words[13] = 'Thirteen';words[14] = 'Fourteen';words[15] = 'Fifteen';words[16] = 'Sixteen';words[17] = 'Seventeen';words[18] = 'Eighteen';words[19] = 'Nineteen';words[20] = 'Twenty';words[30] = 'Thirty';words[40] = 'Forty';words[50] = 'Fifty';words[60] = 'Sixty';words[70] = 'Seventy';words[80] = 'Eighty';words[90] = 'Ninety'; words[100] = 'One Hundred'; words[200] = 'Two Hundred'; words[300] = 'Three Hundred'; words[400] = 'Four Hundred'; words[500] = 'Five Hundred'; words[600] = 'Six Hundred'; words[700] = 'Seven Hundred'; words[800] = 'Eight Hundred'; words[900] = 'Nine Hundred';var op;
  amount = amount.toString();
  var atemp = amount.split('.');
  var number = atemp[0].split(',').join('');
  var n_length = number.length;
  var words_string = '';
  if(n_length <= 11){
    var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    var received_n_array = new Array();
    for (var i = 0; i < n_length; i++){
      received_n_array[i] = number.substr(i, 1);}
    for (var i = 11 - n_length, j = 0; i < 11; i++, j++){
      n_array[i] = received_n_array[j];}
    for (var i = 0, j = 1; i < 11; i++, j++){
      if(i == 0 || i == 3 || i == 6 || i == 9){
        if(n_array[i] == 1){
          n_array[j] = 10 + parseInt(n_array[j]);
          n_array[i] = 0;}
      }}
    value = '';
    for (var i = 0; i < 11; i++){
      if(i == 0 || i == 3 || i == 6 || i == 9){
        value = n_array[i] * 10;}
      else if( i == 2 || i == 5 || i == 8){
        value = n_array[i] * 100;} else {
          value = n_array[i];}

      if(value != 0){
        words_string += words[value] + ' ';}
      if((i == 1 && value != 0) && (n_array[i - 1] > 0)){
        words_string += 'Billion ';}else if(( i == 1) && value != 0){
          words_string += 'Biillion ';}
      if((i == 4) && value == 0 && (n_array[i - 1] > 0 || n_array[i - 2] > 0)){
        words_string += 'Million ';} else if(( i == 4) && value != 0){
          words_string += 'Million ';}
      if((i == 7) && value == 0 && (n_array[i - 1] > 0 || n_array[i - 2] > 0)){
        words_string += 'Thousand ';} else if(( i == 7) && value != 0){
          words_string += 'Thousand ';}}
    words_string = words_string.split(' ').join(' ');}
  return words_string;}

jQuery("#populate").click(function() { generate_Cheque() });

/* ================== UPDATED generate_Cheque() ================== */
function generate_Cheque(){
  var line_length  = Number(jQuery("#line_length").val());
  var line_length2 = Number(jQuery("#line_length2").val());

  if(jQuery("#ch_name").val().length>0 && jQuery("#ch_date").val().length>2 && jQuery("#ch_amount").val().length>0){

    const cfg = readCfgFromInputs();
    draw_canvas_with_cfg(cfg);

    var c = document.getElementById("cheque_img");
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#000";

    // NAME (Payee)
    let ch_name = jQuery("#ch_name").val().toUpperCase();
    ctx.font = `${cfg.name_font}px Arial`; 
    fillTextWithTracking(ctx, ch_name, cfg.name_x, cfg.name_y, cfg.name_track);

    // AMOUNT numeric + words
    let amnt=jQuery("#ch_amount").val();
    let amnt_arr=amnt.split(".");
    var ch_amount="**"+bhd(amnt_arr[0]);

    if(amnt_arr.length>1){
      if(amnt_arr[1].length<=3){
        let fils=bhd(amnt_arr[1]);
        ch_amount=ch_amount+" And Fils "+fils+" Only**";
      }
      else{
        alert("you can only add maximum three decimal palces for fills");
        return;
      }
      ctx.font = `${cfg.num_font}px Arial`; 
      ctx.fillText("**"+amnt_arr[0]+"/"+amnt_arr[1]+"**", cfg.num_x, cfg.num_y);
    }
    else{
      ch_amount+=" Only**";
      ctx.font = `${cfg.num_font}px Arial`; 
      ctx.fillText(amnt+"/-", cfg.num_x, cfg.num_y);
    }

    // Amount in words (wrapping with tracking)
    ctx.font = `${cfg.words_font}px Arial`; 
    let x = cfg.words_x;
    let y = cfg.words_y;
    if(ch_amount.length>line_length){
      let str_1= ch_amount.substring(0, line_length);
      let str_2= ch_amount.substring(line_length, ch_amount.length);
      let str_3= str_2.substring(0,line_length2);  
      let str_4= str_2.substring(line_length2,str_2.length);  
      fillTextWithTracking(ctx, str_1, x, y, cfg.words_track);
      fillTextWithTracking(ctx, str_3, 30, y + cfg.words_gap, cfg.words_track);
      fillTextWithTracking(ctx, str_4, 30, y + cfg.words_gap*2, cfg.words_track);
    } else {
      fillTextWithTracking(ctx, ch_amount, x, y, cfg.words_track);
    }

    // DATE digits (adjustable)
    ctx.font = `${cfg.date_font}px Arial`; 
    let ch_date=jQuery("#ch_date").val();
    let ch_date_ar_arr=ch_date.split("-"); // [yyyy, mm, dd]

    const baseX = cfg.date_x, baseY = cfg.date_y;
    // day
    ctx.fillText(ch_date_ar_arr[2][0], baseX, baseY);
    ctx.fillText(ch_date_ar_arr[2][1], baseX + cfg.gap_day, baseY);
    // month
    const monBase = baseX + cfg.gap_day + cfg.gap_mon;
    ctx.fillText(ch_date_ar_arr[1][0], monBase, baseY);
    ctx.fillText(ch_date_ar_arr[1][1], monBase + cfg.gap_mon, baseY);
    // year
    const yearBase = monBase + cfg.gap_mon + cfg.gap_year;
    ctx.fillText(ch_date_ar_arr[0][0], yearBase, baseY);
    ctx.fillText(ch_date_ar_arr[0][1], yearBase + cfg.gap_year, baseY);
    ctx.fillText(ch_date_ar_arr[0][2], yearBase + cfg.gap_year*2, baseY);
    ctx.fillText(ch_date_ar_arr[0][3], yearBase + cfg.gap_year*3, baseY);

    // persist latest calibrated values
    saveCalibration();

  } else {
    alert("Please Fill All the Details");
  }
}
/* =============================================================== */

function showTextbox() {
  var checkbox = document.getElementById('checkbox');
  var textbox = $('.settings');
  if (checkbox.checked) { textbox.slideDown(); } else { textbox.slideUp(); }
}

function rotate(srcBase64, degrees, callback) {
  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d');
  const image  = new Image();
  image.crossOrigin="anonymous";
  image.onload = function () {
    canvas.width  = degrees % 180 === 0 ? image.width : image.height;
    canvas.height = degrees % 180 === 0 ? image.height : image.width;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(degrees * Math.PI / 180);
    ctx.drawImage(image, image.width / -2, image.height / -2);
    callback(canvas.toDataURL());
  };
  image.src = srcBase64;
}

/* ================== SHARE / DOWNLOAD / PRINT (use cfg.rotate) ================== */
const btn = document.querySelector('#share');
const resultPara = document.querySelector('.result');
btn.addEventListener('click', async () => {
  jQuery("#populate").click();
  if(jQuery("#ch_name").val().length>0 && jQuery("#ch_date").val().length>2 && jQuery("#ch_amount").val().length>0){
    var canvas = document.getElementById('cheque_img');
    var imgData = canvas.toDataURL("image/png", 1.0);
    const cfg = readCfgFromInputs();
    var pdf = new jsPDF();
    rotate(imgData, cfg.rotate, function(resultBase64) {
      pdf.addImage(resultBase64, 'png', 78.5, 0);
      let pdf_output=pdf.output('blob');
      var file = new File([pdf_output], "cheque.pdf", {type: 'application/pdf'});
      var filesArray = [file];
      var fname="From: "+jQuery("select#company").val()+"\n To: "+jQuery("input#ch_name").val();
      if(navigator.canShare && navigator.canShare({ files: filesArray })) {
        navigator.share({ text: fname, files: filesArray, title: 'Cheque', url: '' });
      }
    });
  }
});

download.addEventListener("click", function() {
  jQuery("#populate").click();
  if(jQuery("#ch_name").val().length>0 && jQuery("#ch_date").val().length>2 && jQuery("#ch_amount").val().length>0){
    var canvas = document.getElementById('cheque_img');
    let fname=jQuery("select#company").val()+"_"+jQuery("input#ch_name").val();
    var imgData = canvas.toDataURL("image/png", 1.0);
    const cfg = readCfgFromInputs();
    rotate(imgData, cfg.rotate, function(resultBase64) {
      var pdf = new jsPDF();
      pdf.addImage(resultBase64, 'png', 78.5, 0);
      pdf.save( fname.replace(" ","_")+"_cheque.pdf");
    });
  }
}, false);

document.getElementById("print").addEventListener("click", function() {
  jQuery("#populate").click();
  if(jQuery("#ch_name").val().length>0 && jQuery("#ch_date").val().length>2 && jQuery("#ch_amount").val().length>0){
    var canvas = document.getElementById('cheque_img');
    var imgData = canvas.toDataURL("image/png", 1.0);
    const cfg = readCfgFromInputs();
    var pdf = new jsPDF();
    rotate(imgData, cfg.rotate, function(resultBase64) {
      pdf.addImage(resultBase64, 'png', 78, 0);
      printJS(pdf.output('bloburl'));
    });
  }
}, false);

/* Live preview + persist on calibration changes */
jQuery("#ch_amount,#ch_name,#ch_date,.line_length,.line_length2,\
#cfg_name_x,#cfg_name_y,#cfg_name_font,#cfg_name_track,\
#cfg_words_x,#cfg_words_y,#cfg_words_gap,#cfg_words_font,#cfg_words_track,\
#cfg_num_x,#cfg_num_y,#cfg_num_font,\
#cfg_date_x,#cfg_date_y,#cfg_gap_day,#cfg_gap_mon,#cfg_gap_year,#cfg_date_font,\
#cfg_scale,#cfg_rotate"
).on('change input', function(){
  saveCalibration();
  if(jQuery("#ch_name").val().length>0 && jQuery("#ch_date").val().length>2 && jQuery("#ch_amount").val().length>0){
    jQuery("button#populate").click();
  } else {
    draw_canvas_with_cfg(readCfgFromInputs());
  }
});
</script>
