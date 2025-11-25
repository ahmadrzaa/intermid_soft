import React, { useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import printJS from "print-js";

export default function BBK() {
  // refs for DOM nodes
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const backRef = useRef(null);

  // ====== Client CSS (unchanged) ======
  const css = `
input#ch_name { text-transform: uppercase; }
.printModal{font-family:sans-serif;display:flex;text-align:center;font-weight:300;font-size:30px;left:0;top:0;position:absolute;color:#045fb4;width:100%;height:100%;background-color:hsla(0,0%,100%,.9)}
.printClose{position:absolute;right:10px;top:10px}
.printClose:before{content:"\\00D7";font-family:Helvetica Neue,sans-serif;font-weight:100;line-height:1px;padding-top:.5em;display:block;font-size:2em;text-indent:1px;overflow:hidden;height:1.25em;width:1.25em;text-align:center;cursor:pointer}
.printSpinner{margin-top:3px;margin-left:-40px;position:absolute;display:inline-block;width:25px;height:25px;border:2px solid #045fb4;border-radius:50%;animation:spin .75s linear infinite}
.printSpinner:after,.printSpinner:before{left:-2px;top:-2px;display:none;position:absolute;content:"";width:inherit;height:inherit;border:inherit;border-radius:inherit}
.printSpinner,.printSpinner:after,.printSpinner:before{display:inline-block;border-color:#045fb4 transparent transparent;animation-duration:1.2s}
.printSpinner:before{transform:rotate(120deg)}
.printSpinner:after{transform:rotate(240deg)}
@keyframes spin{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}
.cheque .site-wrapper{
  background:linear-gradient(267deg,#91351e,#041568,#032a38,#703976)!important;
  background-size:200% 400%!important;animation:gradient 15s ease infinite;color:#fff
}
canvas#cheque_img{position:absolute;left:-11px;top:10px;transform:scale(.99)}
canvas#cheque_img_back{border:1px solid #ddd;box-shadow:0 0 6px 0 #858080;min-height:287px;background:#ffffff94;border:11px solid #ffff;border-right:0}
.print_cheque{display:flex;min-height:100vh;width:100%;align-items:center;justify-content:space-evenly}
.left_box{display:flex;flex-direction:column;margin-right:1vw}
.left_box input{display:block;height:40px;width:100%;margin-bottom:10px;padding:0 10px;color:#000}
button#populate,#download,#print,button{height:39px;max-width:100%;text-transform:uppercase;font-size:16px;background:#ddd;border:1px solid #000;line-height:40px;color:#000;padding:0 15px}
select#company{margin-bottom:10px;height:35px;padding:0 10px}
.print_cheque input,.print_cheque select{font-size:14px;line-height:35px}
button i{margin-left:5px}
button:hover{background:#fff!important}
.btns{display:flex;align-items:center;justify-content:space-evenly}
.right_box{position:relative}
input#checkbox{max-width:15px;height:15px;display:inline-block;vertical-align:-webkit-baseline-middle;line-height:15px}
@media screen and (max-width:991px){
  .print_cheque{flex-direction:column;margin-top:5vh}
  .print_cheque input{width:100%}
  .print_cheque #populate,.print_cheque #download,button#print,button#share{width:100%;max-width:100%;margin-bottom:10px}
  .right_box canvas{zoom:60%}
  .left_box{width:75%}
  .print_cheque{min-height:100vh}
}
@media screen and (max-width:767px){
  .right_box canvas{zoom:45%}
  .btns button{font-size:0px!important}
  .btns button i{font-size:18px!important;vertical-align:middle}
  .left_box h3{font-size:20px}
  .left_box{width:80%}
}
  `;

  // ====== Original logic (ported 1:1, no jQuery) ======
  const DEFAULT_CFG = {
    name_x:115, name_y:80, name_font:14, name_track:0,
    words_x:90, words_y:110, words_gap:28, words_font:14, words_track:0,
    num_x:410, num_y:143, num_font:18,
    date_x:379, date_y:45, gap_day:23, gap_mon:21, gap_year:21, date_font:14,
    scale:1.16, rotate:90
  };
  const STORAGE_KEY = "cheque_calibration_v1";

  const gv = (id) => {
    const el = document.getElementById(id);
    return el ? Number(el.value || 0) : 0;
  };
  const readCfg = () => ({
    name_x: gv("cfg_name_x"), name_y: gv("cfg_name_y"), name_font: gv("cfg_name_font"), name_track: gv("cfg_name_track"),
    words_x: gv("cfg_words_x"), words_y: gv("cfg_words_y"), words_gap: gv("cfg_words_gap"), words_font: gv("cfg_words_font"), words_track: gv("cfg_words_track"),
    num_x: gv("cfg_num_x"), num_y: gv("cfg_num_y"), num_font: gv("cfg_num_font"),
    date_x: gv("cfg_date_x"), date_y: gv("cfg_date_y"),
    gap_day: gv("cfg_gap_day"), gap_mon: gv("cfg_gap_mon"), gap_year: gv("cfg_gap_year"),
    date_font: gv("cfg_date_font"),
    scale: Number(document.getElementById("cfg_scale")?.value || DEFAULT_CFG.scale),
    rotate: Number(document.getElementById("cfg_rotate")?.value || DEFAULT_CFG.rotate),
  });
  const loadCfg = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULT_CFG, ...JSON.parse(raw) } : { ...DEFAULT_CFG };
    } catch { return { ...DEFAULT_CFG }; }
  };
  const saveCfg = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(readCfg())); } catch {}
  };
  const applyCfgToInputs = (cfg) => {
    const set = (id,val)=>{ const el=document.getElementById(id); if(el) el.value = val; };
    set("cfg_name_x", cfg.name_x); set("cfg_name_y", cfg.name_y);
    set("cfg_name_font", cfg.name_font); set("cfg_name_track", cfg.name_track);
    set("cfg_words_x", cfg.words_x); set("cfg_words_y", cfg.words_y);
    set("cfg_words_gap", cfg.words_gap); set("cfg_words_font", cfg.words_font);
    set("cfg_words_track", cfg.words_track);
    set("cfg_num_x", cfg.num_x); set("cfg_num_y", cfg.num_y); set("cfg_num_font", cfg.num_font);
    set("cfg_date_x", cfg.date_x); set("cfg_date_y", cfg.date_y);
    set("cfg_gap_day", cfg.gap_day); set("cfg_gap_mon", cfg.gap_mon); set("cfg_gap_year", cfg.gap_year);
    set("cfg_date_font", cfg.date_font);
    set("cfg_scale", cfg.scale); set("cfg_rotate", cfg.rotate);
  };

  function fillTextWithTracking(ctx, text, x, y, trackingPx){
    if (!trackingPx) { ctx.fillText(text, x, y); return; }
    let cur = x;
    for (const ch of text) {
      ctx.fillText(ch, cur, y);
      cur += ctx.measureText(ch).width + trackingPx;
    }
  }

  function drawWithCfg(cfg){
    const cb = backRef.current;
    const c  = canvasRef.current;
    const img = imgRef.current;
    if (!img || !c || !cb || !img.complete || img.naturalHeight === 0) return;

    const ctx = c.getContext("2d");
    const ctxb = cb.getContext("2d");

    c.width = 650; c.height = img.height;
    cb.width = 650; cb.height = img.height;

    ctx.setTransform(1,0,0,1,0,0);
    ctxb.setTransform(1,0,0,1,0,0);
    ctx.scale(cfg.scale, cfg.scale);
    ctxb.scale(cfg.scale, cfg.scale);

    ctx.clearRect(0,0,c.width,c.height);
    ctxb.clearRect(0,0,cb.width,cb.height);

    ctxb.drawImage(img, 0, 0);
  }

  function bhd(amount){
    const words = [];
    words[0]='zero';words[1]='One';words[2]='Two';words[3]='Three';words[4]='Four';words[5]='Five';words[6]='Six';words[7]='Seven';words[8]='Eight';words[9]='Nine';
    words[10]='Ten';words[11]='Eleven';words[12]='Twelve';words[13]='Thirteen';words[14]='Fourteen';words[15]='Fifteen';words[16]='Sixteen';words[17]='Seventeen';words[18]='Eighteen';words[19]='Nineteen';
    words[20]='Twenty';words[30]='Thirty';words[40]='Forty';words[50]='Fifty';words[60]='Sixty';words[70]='Seventy';words[80]='Eighty';words[90]='Ninety';
    words[100]='One Hundred';words[200]='Two Hundred';words[300]='Three Hundred';words[400]='Four Hundred';words[500]='Five Hundred';words[600]='Six Hundred';words[700]='Seven Hundred';words[800]='Eight Hundred';words[900]='Nine Hundred';

    amount = amount.toString();
    const atemp = amount.split('.');
    const number = atemp[0].split(',').join('');
    const n_length = number.length;
    let words_string = '';
    if (n_length <= 11){
      const n_array = Array(11).fill(0);
      const received = [];
      for (let i=0;i<n_length;i++) received[i] = number.substr(i,1);
      for (let i = 11 - n_length, j = 0; i < 11; i++, j++) n_array[i] = received[j];

      for (let i=0;i<11;i++){
        if(i===0||i===3||i===6||i===9){
          if (n_array[i] === 1){ n_array[i+1] = 10 + parseInt(n_array[i+1]); n_array[i] = 0; }
        }
      }
      for (let i=0;i<11;i++){
        const v = (i===0||i===3||i===6||i===9) ? n_array[i]*10 : (i===2||i===5||i===8) ? n_array[i]*100 : n_array[i];
        if(v!==0) words_string += words[v] + ' ';
        if(i===1 && v!==0) words_string += 'Billion ';
        if(i===4 && (v!==0 || n_array[i-1]>0 || n_array[i-2]>0)) words_string += 'Million ';
        if(i===7 && (v!==0 || n_array[i-1]>0 || n_array[i-2]>0)) words_string += 'Thousand ';
      }
      words_string = words_string.trim();
    }
    return words_string;
  }

  function generateCheque(){
    const line1 = Number(document.getElementById("line_length").value || 33);
    const line2 = Number(document.getElementById("line_length2").value || 33);

    const nameEl = document.getElementById("ch_name");
    const dateEl = document.getElementById("ch_date");
    const amtEl  = document.getElementById("ch_amount");
    if(!nameEl.value || !dateEl.value || !amtEl.value){ alert("Please Fill All the Details"); return; }

    const cfg = readCfg();
    drawWithCfg(cfg);

    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#000";

    // NAME
    const ch_name = nameEl.value.toUpperCase();
    ctx.font = `${cfg.name_font}px Arial`;
    fillTextWithTracking(ctx, ch_name, cfg.name_x, cfg.name_y, cfg.name_track);

    // AMOUNT
    const amnt = amtEl.value;
    const parts = amnt.split(".");
    let ch_amount = "**" + bhd(parts[0]);

    if(parts.length>1){
      if(parts[1].length<=3){
        const fils=bhd(parts[1]);
        ch_amount += " And Fils " + fils + " Only**";
      } else { alert("you can only add maximum three decimal palces for fills"); return; }
      ctx.font = `${cfg.num_font}px Arial`;
      ctx.fillText(`**${parts[0]}/${parts[1]}**`, cfg.num_x, cfg.num_y);
    } else {
      ch_amount += " Only**";
      ctx.font = `${cfg.num_font}px Arial`;
      ctx.fillText(`${amnt}/-`, cfg.num_x, cfg.num_y);
    }

    // Amount in words (wrap)
    ctx.font = `${cfg.words_font}px Arial`;
    const x = cfg.words_x, y = cfg.words_y;
    if(ch_amount.length > line1){
      const s1 = ch_amount.substring(0, line1);
      const s2 = ch_amount.substring(line1);
      const s3 = s2.substring(0, line2);
      const s4 = s2.substring(line2);
      fillTextWithTracking(ctx, s1, x, y, cfg.words_track);
      fillTextWithTracking(ctx, s3, 30, y + cfg.words_gap, cfg.words_track);
      fillTextWithTracking(ctx, s4, 30, y + cfg.words_gap*2, cfg.words_track);
    } else {
      fillTextWithTracking(ctx, ch_amount, x, y, cfg.words_track);
    }

    // DATE digits (yyyy-mm-dd)
    ctx.font = `${cfg.date_font}px Arial`;
    const [yyyy, mm, dd] = dateEl.value.split("-");
    const baseX = cfg.date_x, baseY = cfg.date_y;
    ctx.fillText(dd[0], baseX, baseY);
    ctx.fillText(dd[1], baseX + cfg.gap_day, baseY);
    const monBase = baseX + cfg.gap_day + cfg.gap_mon;
    ctx.fillText(mm[0], monBase, baseY);
    ctx.fillText(mm[1], monBase + cfg.gap_mon, baseY);
    const yearBase = monBase + cfg.gap_mon + cfg.gap_year;
    ctx.fillText(yyyy[0], yearBase, baseY);
    ctx.fillText(yyyy[1], yearBase + cfg.gap_year, baseY);
    ctx.fillText(yyyy[2], yearBase + cfg.gap_year*2, baseY);
    ctx.fillText(yyyy[3], yearBase + cfg.gap_year*3, baseY);

    saveCfg();
  }

  function rotate(base64, degrees){
    return new Promise((resolve)=>{
      const cv = document.createElement("canvas");
      const ctx = cv.getContext("2d");
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = function(){
        cv.width  = (degrees % 180 === 0) ? im.width : im.height;
        cv.height = (degrees % 180 === 0) ? im.height : im.width;
        ctx.translate(cv.width/2, cv.height/2);
        ctx.rotate(degrees * Math.PI / 180);
        ctx.drawImage(im, im.width/-2, im.height/-2);
        resolve(cv.toDataURL());
      };
      im.src = base64;
    });
  }

  // mount
  useEffect(() => {
    // init calibration + date + background
    const cfg = loadCfg();
    applyCfgToInputs(cfg);

    const dateEl = document.getElementById("ch_date");
    if (dateEl && !dateEl.value) dateEl.value = new Date().toISOString().split("T")[0];

    const img = imgRef.current;
    const onLoad = () => drawWithCfg(loadCfg());
    img.addEventListener("load", onLoad);
    if (img.complete && img.naturalHeight > 0) onLoad();

    // live preview
    const selectors = [
      "#line_length","#line_length2","#ch_amount","#ch_name","#ch_date",
      "#cfg_name_x","#cfg_name_y","#cfg_name_font","#cfg_name_track",
      "#cfg_words_x","#cfg_words_y","#cfg_words_gap","#cfg_words_font","#cfg_words_track",
      "#cfg_num_x","#cfg_num_y","#cfg_num_font",
      "#cfg_date_x","#cfg_date_y","#cfg_gap_day","#cfg_gap_mon","#cfg_gap_year","#cfg_date_font",
      "#cfg_scale","#cfg_rotate"
    ];
    const handler = () => {
      saveCfg();
      const n = document.getElementById("ch_name")?.value;
      const d = document.getElementById("ch_date")?.value;
      const a = document.getElementById("ch_amount")?.value;
      if(n && d && a){ generateCheque(); } else { drawWithCfg(readCfg()); }
    };
    const nodes = selectors.map(s => document.querySelector(s)).filter(Boolean);
    nodes.forEach(el => el.addEventListener("input", handler));

    return () => {
      img.removeEventListener("load", onLoad);
      nodes.forEach(el => el.removeEventListener("input", handler));
    };
  }, []);

  // actions
  const onShare = async () => {
    generateCheque();
    const name = document.getElementById("ch_name").value;
    const date = document.getElementById("ch_date").value;
    const amt  = document.getElementById("ch_amount").value;
    if(!name || !date || !amt) return;

    const canvas = canvasRef.current;
    const cfg = readCfg();
    const png = canvas.toDataURL("image/png", 1.0);
    const rotated = await rotate(png, cfg.rotate);
    const pdf = new jsPDF();
    pdf.addImage(rotated, "png", 78.5, 0);
    const blob = pdf.output("blob");
    const file = new File([blob], "cheque.pdf", { type: "application/pdf" });

    if(navigator.canShare && navigator.canShare({ files:[file] })){
      const note = `From: ${document.getElementById("company").value}\nTo: ${name}`;
      await navigator.share({ text: note, files:[file], title:"Cheque" });
    } else {
      // fallback -> download
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "cheque.pdf";
      a.click();
      URL.revokeObjectURL(a.href);
    }
  };

  const onDownload = async () => {
    generateCheque();
    const name = document.getElementById("ch_name").value;
    const date = document.getElementById("ch_date").value;
    const amt  = document.getElementById("ch_amount").value;
    if(!name || !date || !amt) return;

    const canvas = canvasRef.current;
    const cfg = readCfg();
    const png = canvas.toDataURL("image/png", 1.0);
    const rotated = await rotate(png, cfg.rotate);
    const pdf = new jsPDF();
    pdf.addImage(rotated, "png", 78.5, 0);
    const fname = `${document.getElementById("company").value}_${name}`.replace(/\s+/g,"_")+"_cheque.pdf";
    pdf.save(fname);
  };

  const onPrint = async () => {
    generateCheque();
    const name = document.getElementById("ch_name").value;
    const date = document.getElementById("ch_date").value;
    const amt  = document.getElementById("ch_amount").value;
    if(!name || !date || !amt) return;

    const canvas = canvasRef.current;
    const cfg = readCfg();
    const png = canvas.toDataURL("image/png", 1.0);
    const rotated = await rotate(png, cfg.rotate);
    const pdf = new jsPDF();
    pdf.addImage(rotated, "png", 78, 0);
    const url = pdf.output("bloburl");
    if (printJS) { printJS(url); } else { window.open(url, "_blank"); }
  };

  const toggleAdvanced = (e) => {
    const box = document.querySelector(".settings");
    if(!box) return;
    box.style.display = e.target.checked ? "block" : "none";
  };

  return (
    <div className="cheque">
      <style>{css}</style>

      <span className="msg"></span>
      <div className="print_cheque">
        <div className="left_box">
          <h3>Write Cheque BBK</h3>

          <select id="company" defaultValue="Intermid Consultancy">
            <option>Intermid Consultancy</option>
            <option>Intermid Training Center</option>
            <option>Intergulf</option>
            <option>IDP</option>
          </select>

          <input id="ch_name" placeholder="Name" autoComplete="on" />
          <input id="ch_date" type="date" />
          <input id="ch_amount" type="number" min="1" step="any" placeholder="Amount" />

          <div className="btns">
            <button id="populate" style={{display:"none"}} onClick={generateCheque}>Sign</button>
            <button id="download" onClick={onDownload}>download</button>
            <button id="print" onClick={onPrint}>Print</button>
            <button id="share" onClick={onShare}>Share</button>
          </div>

          <label>Advanced <input id="checkbox" type="checkbox" onChange={toggleAdvanced} /></label>

          {/* Calibration (kept exactly) */}
          <div className="settings" style={{display:"none"}}>
            <label>Line 1 <input id="line_length" type="number" defaultValue="33" /></label>
            <label>Line 2 <input id="line_length2" type="number" defaultValue="33" /></label>

            <div style={{marginTop:6,fontWeight:600}}>Name (Payee)</div>
            <label>X <input id="cfg_name_x" type="number" defaultValue="115" step="1" style={{width:90}}/></label>
            <label>Y <input id="cfg_name_y" type="number" defaultValue="80"  step="1" style={{width:90}}/></label>
            <label>Font px <input id="cfg_name_font" type="number" defaultValue="14" step="1" style={{width:90}}/></label>
            <label>Tracking px <input id="cfg_name_track" type="number" defaultValue="0" step="0.2" style={{width:90}}/></label>

            <div style={{marginTop:6,fontWeight:600}}>Amount (in words)</div>
            <label>Start X <input id="cfg_words_x" type="number" defaultValue="90" step="1" style={{width:90}}/></label>
            <label>Start Y <input id="cfg_words_y" type="number" defaultValue="110" step="1" style={{width:90}}/></label>
            <label>Line gap px <input id="cfg_words_gap" type="number" defaultValue="28" step="1" style={{width:90}}/></label>
            <label>Font px <input id="cfg_words_font" type="number" defaultValue="14" step="1" style={{width:90}}/></label>
            <label>Tracking px <input id="cfg_words_track" type="number" defaultValue="0" step="0.2" style={{width:90}}/></label>

            <div style={{marginTop:6,fontWeight:600}}>Amount (numbers)</div>
            <label>X <input id="cfg_num_x" type="number" defaultValue="410" step="1" style={{width:90}}/></label>
            <label>Y <input id="cfg_num_y" type="number" defaultValue="143" step="1" style={{width:90}}/></label>
            <label>Font px <input id="cfg_num_font" type="number" defaultValue="18" step="1" style={{width:90}}/></label>

            <div style={{marginTop:6,fontWeight:600}}>Date digits</div>
            <label>Base X <input id="cfg_date_x" type="number" defaultValue="379" step="1" style={{width:90}}/></label>
            <label>Base Y <input id="cfg_date_y" type="number" defaultValue="45"  step="1" style={{width:90}}/></label>
            <label>Gap day→ <input id="cfg_gap_day" type="number" defaultValue="23" step="0.5" style={{width:90}}/></label>
            <label>Gap mon→ <input id="cfg_gap_mon" type="number" defaultValue="21" step="0.5" style={{width:90}}/></label>
            <label>Gap year→ <input id="cfg_gap_year" type="number" defaultValue="21" step="0.5" style={{width:90}}/></label>
            <label>Font px <input id="cfg_date_font" type="number" defaultValue="14" step="1" style={{width:90}}/></label>

            <div style={{marginTop:6,fontWeight:600}}>Global canvas</div>
            <label>Scale <input id="cfg_scale" type="number" defaultValue="1.16" step="0.01" style={{width:90}}/></label>
            <label>Rotate° <input id="cfg_rotate" type="number" defaultValue="90" step="1" style={{width:90}}/></label>
          </div>
        </div>

        <div className="right_box">
          {/* IMPORTANT: same-origin image so export works */}
          <img ref={imgRef} id="temp_img" src="/bbk-3.jpg" crossOrigin="anonymous" alt="" style={{display:"none"}} />
          <canvas ref={backRef} id="cheque_img_back"></canvas>
          <canvas ref={canvasRef} id="cheque_img"></canvas>
        </div>
      </div>
    </div>
  );
}
