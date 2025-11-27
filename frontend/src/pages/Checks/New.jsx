// frontend/src/pages/Checks/New.jsx
// Direct port of client's cheque page into React
// Uses jsPDF + printJS exactly like old code

import React, { useEffect } from "react";
import "./new.css";
import jsPDF from "jspdf";
import printJS from "print-js";

const NewCheque = () => {
  useEffect(() => {
    // ========= helpers ===========

    const $id = (id) => document.getElementById(id);
    const getVal = (id) => ($id(id)?.value || "").toString();

    // ---- calibration (same as client) ----
    const DEFAULT_CFG = {
      name_x: 115,
      name_y: 80,
      name_font: 14,
      name_track: 0,
      words_x: 90,
      words_y: 110,
      words_gap: 28,
      words_font: 14,
      words_track: 0,
      num_x: 410,
      num_y: 143,
      num_font: 18,
      date_x: 379,
      date_y: 45,
      gap_day: 23,
      gap_mon: 21,
      gap_year: 21,
      date_font: 14,
      scale: 1.16,
      rotate: 90,
    };
    const STORAGE_KEY = "cheque_calibration_v1";

    function applyCfgToInputs(cfg) {
      const set = (id, val) => {
        const el = $id(id);
        if (el) el.value = val;
      };
      set("cfg_name_x", cfg.name_x);
      set("cfg_name_y", cfg.name_y);
      set("cfg_name_font", cfg.name_font);
      set("cfg_name_track", cfg.name_track);

      set("cfg_words_x", cfg.words_x);
      set("cfg_words_y", cfg.words_y);
      set("cfg_words_gap", cfg.words_gap);
      set("cfg_words_font", cfg.words_font);
      set("cfg_words_track", cfg.words_track);

      set("cfg_num_x", cfg.num_x);
      set("cfg_num_y", cfg.num_y);
      set("cfg_num_font", cfg.num_font);

      set("cfg_date_x", cfg.date_x);
      set("cfg_date_y", cfg.date_y);
      set("cfg_gap_day", cfg.gap_day);
      set("cfg_gap_mon", cfg.gap_mon);
      set("cfg_gap_year", cfg.gap_year);
      set("cfg_date_font", cfg.date_font);

      set("cfg_scale", cfg.scale);
      set("cfg_rotate", cfg.rotate);
    }

    function loadCalibration() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULT_CFG };
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_CFG, ...parsed };
      } catch {
        return { ...DEFAULT_CFG };
      }
    }

    function readCfgFromInputs() {
      const gv = (id, fallback) => {
        const el = $id(id);
        if (!el) return fallback;
        const n = Number(el.value);
        return Number.isNaN(n) ? fallback : n;
      };
      return {
        name_x: gv("cfg_name_x", DEFAULT_CFG.name_x),
        name_y: gv("cfg_name_y", DEFAULT_CFG.name_y),
        name_font: gv("cfg_name_font", DEFAULT_CFG.name_font),
        name_track: gv("cfg_name_track", DEFAULT_CFG.name_track),
        words_x: gv("cfg_words_x", DEFAULT_CFG.words_x),
        words_y: gv("cfg_words_y", DEFAULT_CFG.words_y),
        words_gap: gv("cfg_words_gap", DEFAULT_CFG.words_gap),
        words_font: gv("cfg_words_font", DEFAULT_CFG.words_font),
        words_track: gv("cfg_words_track", DEFAULT_CFG.words_track),
        num_x: gv("cfg_num_x", DEFAULT_CFG.num_x),
        num_y: gv("cfg_num_y", DEFAULT_CFG.num_y),
        num_font: gv("cfg_num_font", DEFAULT_CFG.num_font),
        date_x: gv("cfg_date_x", DEFAULT_CFG.date_x),
        date_y: gv("cfg_date_y", DEFAULT_CFG.date_y),
        gap_day: gv("cfg_gap_day", DEFAULT_CFG.gap_day),
        gap_mon: gv("cfg_gap_mon", DEFAULT_CFG.gap_mon),
        gap_year: gv("cfg_gap_year", DEFAULT_CFG.gap_year),
        date_font: gv("cfg_date_font", DEFAULT_CFG.date_font),
        scale: gv("cfg_scale", DEFAULT_CFG.scale),
        rotate: gv("cfg_rotate", DEFAULT_CFG.rotate),
      };
    }

    function saveCalibration() {
      try {
        const cfg = readCfgFromInputs();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
      } catch {
        // ignore
      }
    }

    // ---- drawing helpers ----
    function fillTextWithTracking(ctx, text, x, y, trackingPx) {
      if (!trackingPx) {
        ctx.fillText(text, x, y);
        return;
      }
      let cur = x;
      for (const ch of text) {
        ctx.fillText(ch, cur, y);
        cur += ctx.measureText(ch).width + trackingPx;
      }
    }

    function draw_canvas_with_cfg(cfg) {
      const cb = $id("cheque_img_back");
      const c = $id("cheque_img");
      const img = $id("temp_img");
      if (!cb || !c || !img) return;

      const ctx = c.getContext("2d");
      const ctx_b = cb.getContext("2d");
      ctx.canvas.width = 650;
      ctx.canvas.height = img.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(cfg.scale, cfg.scale);

      ctx_b.canvas.width = 650;
      ctx_b.canvas.height = img.height;
      ctx_b.setTransform(1, 0, 0, 1, 0, 0);
      ctx_b.scale(cfg.scale, cfg.scale);

      ctx.clearRect(0, 0, c.width, c.height);
      ctx_b.clearRect(0, 0, cb.width, cb.height);
      ctx_b.drawImage(img, 0, 0);
    }

    // ---- number to words (client bhd) ----
    function bhd(amount) {
      const words = [];
      words[0] = "zero";
      words[1] = "One";
      words[2] = "Two";
      words[3] = "Three";
      words[4] = "Four";
      words[5] = "Five";
      words[6] = "Six";
      words[7] = "Seven";
      words[8] = "Eight";
      words[9] = "Nine";
      words[10] = "Ten";
      words[11] = "Eleven";
      words[12] = "Twelve";
      words[13] = "Thirteen";
      words[14] = "Fourteen";
      words[15] = "Fifteen";
      words[16] = "Sixteen";
      words[17] = "Seventeen";
      words[18] = "Eighteen";
      words[19] = "Nineteen";
      words[20] = "Twenty";
      words[30] = "Thirty";
      words[40] = "Forty";
      words[50] = "Fifty";
      words[60] = "Sixty";
      words[70] = "Seventy";
      words[80] = "Eighty";
      words[90] = "Ninety";
      words[100] = "One Hundred";
      words[200] = "Two Hundred";
      words[300] = "Three Hundred";
      words[400] = "Four Hundred";
      words[500] = "Five Hundred";
      words[600] = "Six Hundred";
      words[700] = "Seven Hundred";
      words[800] = "Eight Hundred";
      words[900] = "Nine Hundred";

      amount = amount.toString();
      const atemp = amount.split(".");
      const number = atemp[0].split(",").join("");
      const n_length = number.length;
      let words_string = "";

      if (n_length <= 11) {
        const n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        const received_n_array = new Array();

        for (let i = 0; i < n_length; i++) {
          received_n_array[i] = number.substr(i, 1);
        }
        for (let i = 11 - n_length, j = 0; i < 11; i++, j++) {
          n_array[i] = received_n_array[j];
        }
        for (let i = 0, j = 1; i < 11; i++, j++) {
          if (i === 0 || i === 3 || i === 6 || i === 9) {
            if (n_array[i] === 1) {
              n_array[j] = 10 + parseInt(n_array[j], 10);
              n_array[i] = 0;
            }
          }
        }

        let value = "";
        for (let i = 0; i < 11; i++) {
          if (i === 0 || i === 3 || i === 6 || i === 9) {
            value = n_array[i] * 10;
          } else if (i === 2 || i === 5 || i === 8) {
            value = n_array[i] * 100;
          } else {
            value = n_array[i];
          }

          if (value !== 0) {
            words_string += words[value] + " ";
          }

          if (i === 1 && value !== 0 && n_array[i - 1] > 0) {
            words_string += "Billion ";
          } else if (i === 1 && value !== 0) {
            words_string += "Biillion ";
          }
          if (
            i === 4 &&
            value === 0 &&
            (n_array[i - 1] > 0 || n_array[i - 2] > 0)
          ) {
            words_string += "Million ";
          } else if (i === 4 && value !== 0) {
            words_string += "Million ";
          }
          if (
            i === 7 &&
            value === 0 &&
            (n_array[i - 1] > 0 || n_array[i - 2] > 0)
          ) {
            words_string += "Thousand ";
          } else if (i === 7 && value !== 0) {
            words_string += "Thousand ";
          }
        }
        words_string = words_string.split(" ").join(" ");
      }
      return words_string;
    }

    // =============== generate_Cheque (client logic) ===============
    function generate_Cheque() {
      const line_length = Number(getVal("line_length") || "0");
      const line_length2 = Number(getVal("line_length2") || "0");

      const nameVal = getVal("ch_name");
      const dateVal = getVal("ch_date");
      const amountVal = getVal("ch_amount");

      if (nameVal.length > 0 && dateVal.length > 2 && amountVal.length > 0) {
        const cfg = readCfgFromInputs();
        draw_canvas_with_cfg(cfg);

        const c = $id("cheque_img");
        if (!c) return;
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#000";

        // NAME
        const ch_name = nameVal.toUpperCase();
        ctx.font = `${cfg.name_font}px Arial`;
        fillTextWithTracking(
          ctx,
          ch_name,
          cfg.name_x,
          cfg.name_y,
          cfg.name_track
        );

        // AMOUNT numeric + words
        const amnt = amountVal;
        const amnt_arr = amnt.split(".");
        let ch_amount = "**" + bhd(amnt_arr[0]);

        if (amnt_arr.length > 1) {
          if (amnt_arr[1].length <= 3) {
            const fils = bhd(amnt_arr[1]);
            ch_amount = ch_amount + " And Fils " + fils + " Only**";
          } else {
            alert("You can only add maximum three decimal places for fils");
            return;
          }
          ctx.font = `${cfg.num_font}px Arial`;
          ctx.fillText(
            "**" + amnt_arr[0] + "/" + amnt_arr[1] + "**",
            cfg.num_x,
            cfg.num_y
          );
        } else {
          ch_amount += " Only**";
          ctx.font = `${cfg.num_font}px Arial`;
          ctx.fillText(amnt + "/-", cfg.num_x, cfg.num_y);
        }

        // Amount in words (wrapping)
        ctx.font = `${cfg.words_font}px Arial`;
        let x = cfg.words_x;
        let y = cfg.words_y;

        if (ch_amount.length > line_length) {
          const str_1 = ch_amount.substring(0, line_length);
          const str_2 = ch_amount.substring(line_length, ch_amount.length);
          const str_3 = str_2.substring(0, line_length2);
          const str_4 = str_2.substring(line_length2, str_2.length);

          fillTextWithTracking(ctx, str_1, x, y, cfg.words_track);
          fillTextWithTracking(ctx, str_3, 30, y + cfg.words_gap, cfg.words_track);
          fillTextWithTracking(
            ctx,
            str_4,
            30,
            y + cfg.words_gap * 2,
            cfg.words_track
          );
        } else {
          fillTextWithTracking(ctx, ch_amount, x, y, cfg.words_track);
        }

        // DATE digits
        ctx.font = `${cfg.date_font}px Arial`;
        const ch_date = dateVal;
        const parts = ch_date.split("-"); // [yyyy, mm, dd]

        const baseX = cfg.date_x;
        const baseY = cfg.date_y;

        // day
        ctx.fillText(parts[2][0], baseX, baseY);
        ctx.fillText(parts[2][1], baseX + cfg.gap_day, baseY);

        // month
        const monBase = baseX + cfg.gap_day + cfg.gap_mon;
        ctx.fillText(parts[1][0], monBase, baseY);
        ctx.fillText(parts[1][1], monBase + cfg.gap_mon, baseY);

        // year
        const yearBase = monBase + cfg.gap_mon + cfg.gap_year;
        ctx.fillText(parts[0][0], yearBase, baseY);
        ctx.fillText(parts[0][1], yearBase + cfg.gap_year, baseY);
        ctx.fillText(parts[0][2], yearBase + cfg.gap_year * 2, baseY);
        ctx.fillText(parts[0][3], yearBase + cfg.gap_year * 3, baseY);

        saveCalibration();
      } else {
        alert("Please Fill All the Details");
      }
    }

    // === show/hide settings ===
    function showTextbox() {
      const checkbox = $id("checkbox");
      const panel = document.querySelector(".settings");
      if (!checkbox || !panel) return;
      if (checkbox.checked) {
        panel.style.display = "block";
      } else {
        panel.style.display = "none";
      }
    }
    window.showTextbox = showTextbox; // used in onChange attribute

    // rotate helper (same logic)
    function rotateBase64(srcBase64, degrees, callback) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = function () {
        canvas.width =
          degrees % 180 === 0 ? image.width : image.height;
        canvas.height =
          degrees % 180 === 0 ? image.height : image.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((degrees * Math.PI) / 180);
        ctx.drawImage(image, image.width / -2, image.height / -2);
        callback(canvas.toDataURL());
      };
      image.src = srcBase64;
    }

    // ====== on mount: init calibration & canvas & default date ======
    const cfgInit = loadCalibration();
    applyCfgToInputs(cfgInit);

    const img = $id("temp_img");
    if (img) {
      img.crossOrigin = "Anonymous";
      if (img.complete) {
        draw_canvas_with_cfg(cfgInit);
      } else {
        img.onload = () => draw_canvas_with_cfg(cfgInit);
      }
    }

    const dateInput = $id("ch_date");
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split("T")[0];
    }

    // ====== button handlers ======
    const btnPopulate = $id("populate");
    const btnShare = $id("share");
    const btnDownload = $id("download");
    const btnPrint = $id("print");

    if (btnPopulate) {
      btnPopulate.addEventListener("click", generate_Cheque);
    }

    if (btnShare) {
      btnShare.addEventListener("click", async () => {
        generate_Cheque();
        if (
          getVal("ch_name").length > 0 &&
          getVal("ch_date").length > 2 &&
          getVal("ch_amount").length > 0
        ) {
          const canvas = $id("cheque_img");
          if (!canvas) return;
          const imgData = canvas.toDataURL("image/png", 1.0);
          const cfg = readCfgFromInputs();
          const pdf = new jsPDF();

          rotateBase64(imgData, cfg.rotate, (resultBase64) => {
            pdf.addImage(resultBase64, "png", 78.5, 0);
            const pdfOutput = pdf.output("blob");
            const file = new File([pdfOutput], "cheque.pdf", {
              type: "application/pdf",
            });
            const filesArray = [file];
            const fname =
              "From: " +
              getVal("company") +
              "\n To: " +
              getVal("ch_name");
            if (
              navigator.canShare &&
              navigator.canShare({ files: filesArray })
            ) {
              navigator.share({
                text: fname,
                files: filesArray,
                title: "Cheque",
                url: "",
              });
            }
          });
        }
      });
    }

    if (btnDownload) {
      btnDownload.addEventListener("click", () => {
        generate_Cheque();
        if (
          getVal("ch_name").length > 0 &&
          getVal("ch_date").length > 2 &&
          getVal("ch_amount").length > 0
        ) {
          const canvas = $id("cheque_img");
          if (!canvas) return;
          const imgData = canvas.toDataURL("image/png", 1.0);
          const cfg = readCfgFromInputs();
          const pdf = new jsPDF();
          rotateBase64(imgData, cfg.rotate, (resultBase64) => {
            pdf.addImage(resultBase64, "png", 78.5, 0);
            const fname =
              getVal("company") + "_" + getVal("ch_name");
            pdf.save(fname.replace(/\s+/g, "_") + "_cheque.pdf");
          });
        }
      });
    }

    if (btnPrint) {
      btnPrint.addEventListener("click", () => {
        generate_Cheque();
        if (
          getVal("ch_name").length > 0 &&
          getVal("ch_date").length > 2 &&
          getVal("ch_amount").length > 0
        ) {
          const canvas = $id("cheque_img");
          if (!canvas) return;
          const imgData = canvas.toDataURL("image/png", 1.0);
          const cfg = readCfgFromInputs();
          const pdf = new jsPDF();
          rotateBase64(imgData, cfg.rotate, (resultBase64) => {
            pdf.addImage(resultBase64, "png", 78, 0);
            const blobUrl = pdf.output("bloburl");
            printJS(blobUrl);
          });
        }
      });
    }

    // ===== live preview / calibration listeners =====
    const liveIds = [
      "ch_amount",
      "ch_name",
      "ch_date",
      "line_length",
      "line_length2",
      "cfg_name_x",
      "cfg_name_y",
      "cfg_name_font",
      "cfg_name_track",
      "cfg_words_x",
      "cfg_words_y",
      "cfg_words_gap",
      "cfg_words_font",
      "cfg_words_track",
      "cfg_num_x",
      "cfg_num_y",
      "cfg_num_font",
      "cfg_date_x",
      "cfg_date_y",
      "cfg_gap_day",
      "cfg_gap_mon",
      "cfg_gap_year",
      "cfg_date_font",
      "cfg_scale",
      "cfg_rotate",
    ];

    const onChange = () => {
      saveCalibration();
      if (
        getVal("ch_name").length > 0 &&
        getVal("ch_date").length > 2 &&
        getVal("ch_amount").length > 0
      ) {
        generate_Cheque();
      } else {
        draw_canvas_with_cfg(readCfgFromInputs());
      }
    };

    const boundEls = [];
    liveIds.forEach((id) => {
      const el = $id(id);
      if (!el) return;
      el.addEventListener("input", onChange);
      el.addEventListener("change", onChange);
      boundEls.push(el);
    });

    // cleanup on unmount
    return () => {
      if (btnPopulate) btnPopulate.removeEventListener("click", generate_Cheque);
      if (btnShare) btnShare.replaceWith(btnShare.cloneNode(true));
      if (btnDownload) btnDownload.replaceWith(btnDownload.cloneNode(true));
      if (btnPrint) btnPrint.replaceWith(btnPrint.cloneNode(true));
      boundEls.forEach((el) => {
        el.removeEventListener("input", onChange);
        el.removeEventListener("change", onChange);
      });
    };
  }, []);

  return (
    <div className="cheque-page">
      <span className="msg"></span>
      <div className="print_cheque">
        <div className="left_box">
          <h3>Write Cheque BBK</h3>
          <select id="company">
            <option>Intermid Consultancy</option>
            <option>Intermid Training Center</option>
            <option>Intergulf</option>
            <option>IDP</option>
          </select>
          <input
            type="text"
            id="ch_name"
            placeholder="Name"
            autoComplete="on"
            style={{ textTransform: "uppercase" }}
          />
          <input type="date" id="ch_date" />
          <input
            type="number"
            min="1"
            step="any"
            id="ch_amount"
            placeholder="Amount"
          />

          <div className="btns">
            <button id="populate" style={{ display: "none" }}>
              Sign
            </button>
            <button id="download">
              download
            </button>
            <button type="button" id="print">
              Print
            </button>
            <button id="share">
              Share
            </button>
          </div>

          <label>
            Advanced
            <input
              type="checkbox"
              id="checkbox"
              onChange={() => window.showTextbox && window.showTextbox()}
            />
          </label>

          {/* SETTINGS with calibration + persistence */}
          <div className="settings" style={{ display: "none" }}>
            <label>
              Line 1
              <input type="number" id="line_length" className="line_length" defaultValue="33" />
            </label>
            <label>
              Line 2
              <input type="number" id="line_length2" className="line_length" defaultValue="33" />
            </label>

            <div style={{ marginTop: 6, fontWeight: 600 }}>Name (Payee)</div>
            <label>
              X <input type="number" id="cfg_name_x" step="1" style={{ width: 90 }} />
            </label>
            <label>
              Y <input type="number" id="cfg_name_y" step="1" style={{ width: 90 }} />
            </label>
            <label>
              Font px{" "}
              <input type="number" id="cfg_name_font" step="1" style={{ width: 90 }} />
            </label>
            <label>
              Tracking px{" "}
              <input type="number" id="cfg_name_track" step="0.2" style={{ width: 90 }} />
            </label>

            <div style={{ marginTop: 6, fontWeight: 600 }}>Amount (in words)</div>
            <label>
              Start X{" "}
              <input type="number" id="cfg_words_x" step="1" style={{ width: 90 }} />
            </label>
            <label>
              Start Y{" "}
              <input type="number" id="cfg_words_y" step="1" style={{ width: 90 }} />
            </label>
            <label>
              Line gap px{" "}
              <input type="number" id="cfg_words_gap" step="1" style={{ width: 90 }} />
            </label>
            <label>
              Font px{" "}
              <input type="number" id="cfg_words_font" step="1" style={{ width: 90 }} />
            </label>
            <label>
              Tracking px{" "}
              <input type="number" id="cfg_words_track" step="0.2" style={{ width: 90 }} />
            </label>

            <div style={{ marginTop: 6, fontWeight: 600 }}>Amount (numbers)</div>
            <label>
              X <input type="number" id="cfg_num_x" step="1" style={{ width: 90 }} />
            </label>
            <label>
              Y <input type="number" id="cfg_num_y" step="1" style={{ width: 90 }} />
            </label>
            <label>
              Font px{" "}
              <input type="number" id="cfg_num_font" step="1" style={{ width: 90 }} />
            </label>

            <div style={{ marginTop: 6, fontWeight: 600 }}>Date digits</div>
            <label>
              Base X{" "}
              <input type="number" id="cfg_date_x" step="1" style={{ width: 90 }} />
            </label>
            <label>
              Base Y{" "}
              <input type="number" id="cfg_date_y" step="1" style={{ width: 90 }} />
            </label>
            <label>
              Gap day→{" "}
              <input type="number" id="cfg_gap_day" step="0.5" style={{ width: 90 }} />
            </label>
            <label>
              Gap mon→{" "}
              <input type="number" id="cfg_gap_mon" step="0.5" style={{ width: 90 }} />
            </label>
            <label>
              Gap year→{" "}
              <input type="number" id="cfg_gap_year" step="0.5" style={{ width: 90 }} />
            </label>
            <label>
              Font px{" "}
              <input type="number" id="cfg_date_font" step="1" style={{ width: 90 }} />
            </label>

            <div style={{ marginTop: 6, fontWeight: 600 }}>Global canvas</div>
            <label>
              Scale{" "}
              <input type="number" id="cfg_scale" step="0.01" style={{ width: 90 }} />
            </label>
            <label>
              Rotate°{" "}
              <input type="number" id="cfg_rotate" step="1" style={{ width: 90 }} />
            </label>
          </div>
        </div>

        <div className="right_box">
          <img
            style={{ display: "none" }}
            crossOrigin="Anonymous"
            id="temp_img"
            src="https://intermid.net/wp-content/uploads/2023/01/bbk-3.jpg"
            alt="BBK cheque template"
          />
          <canvas id="cheque_img_back"></canvas>
          <canvas id="cheque_img"></canvas>
        </div>
      </div>
    </div>
  );
};

export default NewCheque;
