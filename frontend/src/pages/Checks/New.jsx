// frontend/src/pages/Checks/New.jsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./new.css";
import { createCheque } from "../../services/cheques";

// ---------- helpers (from client logic, adapted) ----------

// Convert number to words (BHD style)
function bhd(amount) {
  const words = [];
  words[0] = "Zero";
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
    const received_n_array = [];

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

    for (let i = 0; i < 11; i++) {
      let value = 0;
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
        words_string += "Billion ";
      }

      if (i === 4 && value === 0 && (n_array[i - 1] > 0 || n_array[i - 2] > 0)) {
        words_string += "Million ";
      } else if (i === 4 && value !== 0) {
        words_string += "Million ";
      }

      if (i === 7 && value === 0 && (n_array[i - 1] > 0 || n_array[i - 2] > 0)) {
        words_string += "Thousand ";
      } else if (i === 7 && value !== 0) {
        words_string += "Thousand ";
      }
    }

    words_string = words_string.split(" ").join(" ");
  }

  return words_string.trim();
}

// Format full "amount in words" incl. fils (plain text)
function formatAmountInWords(rawAmount) {
  if (rawAmount === null || rawAmount === undefined || rawAmount === "") {
    return "";
  }

  const str = rawAmount.toString();
  const [intPartRaw, fracPartRaw = ""] = str.split(".");

  const intPart = intPartRaw === "" ? "0" : intPartRaw;
  const wordsInt = bhd(intPart);

  // normalise fractional part to 3 digits (fils)
  let fracNormalized = fracPartRaw.padEnd(3, "0").slice(0, 3);
  let fracNumeric = parseInt(fracNormalized, 10);
  if (isNaN(fracNumeric)) fracNumeric = 0;

  if (fracNumeric > 0) {
    const filsWords = bhd(fracNormalized);
    return `${wordsInt} And Fils ${filsWords} Only`;
  }

  return `${wordsInt} Only`;
}

// Default calibration copied from old client code
const DEFAULT_CFG = {
  // line splitting
  lineLength1: 33,
  lineLength2: 33,

  // Name (Payee)
  nameX: 115,
  nameY: 80,
  nameFont: 14,
  nameTracking: 0,

  // Amount in words
  wordsX: 90,
  wordsY: 110,
  wordsGap: 28,
  wordsFont: 14,
  wordsTracking: 0,

  // Amount numbers
  numX: 410,
  numY: 143,
  numFont: 18,

  // Date digits (boxes)
  dateBaseX: 379,
  dateY: 45,
  gapDay: 23,
  gapMon: 21,
  gapYear: 21,
  dateFont: 14,

  // global canvas
  scale: 1.16,
  rotate: 90, // for printing orientation
};

const CFG_STORAGE_KEY = "bbk_cheque_cfg_v3";

// Load calibration from localStorage if available
function loadCfg() {
  try {
    const raw = window.localStorage.getItem(CFG_STORAGE_KEY);
    if (!raw) return DEFAULT_CFG;
    return { ...DEFAULT_CFG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CFG;
  }
}

// Save calibration
function saveCfg(cfg) {
  try {
    window.localStorage.setItem(CFG_STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    // ignore
  }
}

// draw text with extra tracking (like old code)
function fillTextWithTracking(ctx, text, x, y, trackingPx) {
  if (!trackingPx) {
    ctx.fillText(text, x, y);
    return;
  }
  let curX = x;
  for (const ch of text) {
    ctx.fillText(ch, curX, y);
    curX += ctx.measureText(ch).width + trackingPx;
  }
}

// split amount words into up to 3 lines using cfg line lengths
function splitWordsForLines(amountValue, cfg) {
  const fullWords = formatAmountInWords(amountValue) || "";
  const lineLen1 = cfg.lineLength1 || 47;
  const lineLen2 = cfg.lineLength2 || 39;

  const line1 = fullWords.substring(0, lineLen1).trim();
  const rest = fullWords.substring(lineLen1).trim();
  let line2 = "";
  let line3 = "";

  if (rest.length > 0) {
    line2 = rest.substring(0, lineLen2).trim();
    line3 = rest.substring(lineLen2).trim();
  }

  return { line1, line2, line3 };
}

// ---------- React component ----------

const NewCheque = () => {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const navigate = useNavigate();

  // CLIENT + SYSTEM FIELDS ---------------------------------
  const [company, setCompany] = useState("Intermid Training Center");
  const [payee, setPayee] = useState("");
  const [hideBeneficiary, setHideBeneficiary] = useState(false);

  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  const [chequeNumber, setChequeNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [cfg, setCfg] = useState(() => loadCfg());
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveDone, setSaveDone] = useState(false);

  // Core drawing logic – uses SAME logic for preview & print
  const renderCheque = (
    canvas,
    img,
    { payeeValue, hidePayee, dateValue, amountValue },
    cfgValue,
    { includeBackground }
  ) => {
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");

    // use same base size as old code
    const baseWidth = 650;
    const baseHeight = img.height;

    canvas.width = baseWidth;
    canvas.height = baseHeight;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, baseWidth, baseHeight);

    // scale (like old cfg_scale)
    const scale = cfgValue.scale || 1;
    ctx.scale(scale, scale);

    if (includeBackground) {
      ctx.drawImage(img, 0, 0);
    }

    ctx.fillStyle = "#000";

    // PAYEE
    const finalPayee = hidePayee ? "" : payeeValue;
    if (finalPayee) {
      ctx.font = `${cfgValue.nameFont}px Arial`;
      fillTextWithTracking(
        ctx,
        finalPayee.toUpperCase(),
        cfgValue.nameX,
        cfgValue.nameY,
        cfgValue.nameTracking
      );
    }

    // AMOUNT IN WORDS
    if (amountValue) {
      const { line1, line2, line3 } = splitWordsForLines(
        amountValue,
        cfgValue
      );
      ctx.font = `${cfgValue.wordsFont}px Arial`;

      if (line1) {
        fillTextWithTracking(
          ctx,
          line1,
          cfgValue.wordsX,
          cfgValue.wordsY,
          cfgValue.wordsTracking
        );
      }
      if (line2) {
        fillTextWithTracking(
          ctx,
          line2,
          cfgValue.wordsX,
          cfgValue.wordsY + cfgValue.wordsGap,
          cfgValue.wordsTracking
        );
      }
      if (line3) {
        fillTextWithTracking(
          ctx,
          line3,
          cfgValue.wordsX,
          cfgValue.wordsY + cfgValue.wordsGap * 2,
          cfgValue.wordsTracking
        );
      }
    }

    // AMOUNT NUMBERS (BD)
    if (amountValue) {
      ctx.font = `${cfgValue.numFont}px Arial`;
      const parts = amountValue.toString().split(".");
      const fils = parts[1] ? parts[1].padEnd(3, "0").slice(0, 3) : "";
      if (fils) {
        ctx.fillText(`${parts[0]}/${fils}`, cfgValue.numX, cfgValue.numY);
      } else {
        ctx.fillText(`${parts[0]}/-`, cfgValue.numX, cfgValue.numY);
      }
    }

    // DATE digits (DDMMYYYY)
    if (dateValue) {
      const [y, m, d] = dateValue.split("-");
      if (y && m && d) {
        ctx.font = `${cfgValue.dateFont || 20}px Arial`;
        const baseX = cfgValue.dateBaseX;
        const baseY = cfgValue.dateY;
        const gapDay = cfgValue.gapDay;
        const gapMon = cfgValue.gapMon;
        const gapYear = cfgValue.gapYear;

        // day boxes
        ctx.fillText(d[0], baseX, baseY);
        ctx.fillText(d[1], baseX + gapDay, baseY);

        // month boxes
        const monBase = baseX + gapDay + gapMon;
        ctx.fillText(m[0], monBase, baseY);
        ctx.fillText(m[1], monBase + gapMon, baseY);

        // year boxes
        const yearBase = monBase + gapMon + gapYear;
        ctx.fillText(y[0], yearBase, baseY);
        ctx.fillText(y[1], yearBase + gapYear, baseY);
        ctx.fillText(y[2], yearBase + gapYear * 2, baseY);
        ctx.fillText(y[3], yearBase + gapYear * 3, baseY);
      }
    }
  };

  // Load cheque background image once
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/bbk_3.jpeg"; // in /public

    img.onload = () => {
      imgRef.current = img;
      if (canvasRef.current) {
        renderCheque(
          canvasRef.current,
          img,
          { payeeValue: payee, hidePayee: hideBeneficiary, dateValue: date, amountValue: amount },
          cfg,
          { includeBackground: true }
        );
      }
    };
  }, []); // only once

  // Redraw preview when data / cfg changes
  useEffect(() => {
    if (!imgRef.current || !canvasRef.current) return;
    renderCheque(
      canvasRef.current,
      imgRef.current,
      {
        payeeValue: payee,
        hidePayee: hideBeneficiary,
        dateValue: date,
        amountValue: amount,
      },
      cfg,
      { includeBackground: true }
    );
  }, [payee, hideBeneficiary, date, amount, cfg]);

  // Download preview canvas as PNG (screen preview)
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    const payeePart = payee ? `_${payee}` : "";
    link.download = `${company}${payeePart}_cheque.png`.replace(/\s+/g, "_");
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Print: **NO BACKGROUND** — draw ONLY text (same coordinates) and rotate
  const handlePrint = () => {
    if (!imgRef.current) return;

    const overlay = document.createElement("canvas");

    // render text only (no template)
    renderCheque(
      overlay,
      imgRef.current,
      {
        payeeValue: payee,
        hidePayee: hideBeneficiary,
        dateValue: date,
        amountValue: amount,
      },
      cfg,
      { includeBackground: false }
    );

    const dataUrl = overlay.toDataURL("image/png");

    const win = window.open("", "_blank");
    if (!win) return;

    const rotateDeg = cfg.rotate || 0;

    win.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Print Cheque Overlay</title>
          <style>
            @page { size: A4 landscape; margin: 0; }
            html,body {
              margin:0;
              padding:0;
              background:#ffffff;
            }
            :root{
              --print-scale: 1;
            }
            .print-sheet{
              position:relative;
              width:297mm;
              height:210mm;
              overflow:hidden;
            }
            .print-overlay{
              position:absolute;
              top:50%;
              left:50%;
              transform-origin:center center;
              transform: translate(-50%, -50%) rotate(${rotateDeg}deg) scale(var(--print-scale));
              max-width:none;
              max-height:none;
            }
          </style>
        </head>
        <body>
          <div class="print-sheet">
            <img class="print-overlay" src="${dataUrl}" />
          </div>
          <script>
            window.onload = function(){
              window.focus();
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // Print WITH cheque template (for PDF / test print on plain paper)
  const handlePrintWithTemplate = () => {
    const srcCanvas = canvasRef.current;
    if (!srcCanvas) return;

    const dataUrl = srcCanvas.toDataURL("image/png"); // full cheque image + text

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Print Cheque (with template)</title>
          <style>
            @page { size: A4 portrait; margin: 0; }
            html,body {
              margin:0;
              padding:0;
              background:#ffffff;
            }
            .print-sheet {
              position:relative;
              width:210mm;
              height:297mm;
              overflow:hidden;
            }
            .print-img {
              position:absolute;
              top:10mm;
              left:10mm;
              transform-origin:top left;
              transform:scale(0.92);
              max-width:none;
              max-height:none;
            }
          </style>
        </head>
        <body>
          <div class="print-sheet">
            <img class="print-img" src="${dataUrl}" />
          </div>
          <script>
            window.onload = function(){
              window.focus();
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // Share – simple: just download for now
  const handleShare = () => {
    handleDownload();
  };

  // Update cfg + persist
  const updateCfg = (field, value) => {
    const numeric = Number(value);
    const finalValue = Number.isNaN(numeric) ? 0 : numeric;
    setCfg((prev) => {
      const next = { ...prev, [field]: finalValue };
      saveCfg(next);
      return next;
    });
  };

  // Save cheque into backend system (Draft)
  const handleSaveToSystem = async () => {
    setSaveError("");
    setSaveDone(false);

    if (!company.trim() || !date || !amount) {
      setSaveError("Bank / date / amount are required before saving.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        bankName: company.trim(),
        accountNumber: accountNumber.trim(),
        chequeNumber: chequeNumber.trim(),
        date,
        currency: "BHD",
        amount: Number(amount),
        amountWords: formatAmountInWords(amount),
        beneficiaryName: payee.trim(),
        hideBeneficiary,
        notes: notes.trim(),
      };

      await createCheque(payload);
      setSaveDone(true);

      // After save, go to history so user can see it in the list
      navigate("/app/history");
    } catch (e) {
      setSaveError(
        e?.response?.data?.message ||
          "Failed to save cheque. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cheque-page">
      <h1 className="cheque-title">Write cheque — BBK</h1>
      <p className="cheque-subtitle">
        Fill the cheque on the left. The preview on the right prints exactly on
        top of the original BBK cheque.
      </p>

      <div className="cheque-card">
        <div className="cheque-main">
          {/* Left: form */}
          <div className="cheque-form">
            {/* BANK / COMPANY */}
            <label className="field-label" htmlFor="company">
              Bank / Company
            </label>
            <select
              id="company"
              className="field-input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            >
              <option>Intermid Consultancy</option>
              <option>Intermid Training Center</option>
              <option>Intergulf</option>
              <option>IDP</option>
            </select>

            {/* PAYEE */}
            <label className="field-label" htmlFor="payee">
              Name (Payee)
            </label>
            <input
              id="payee"
              className="field-input"
              type="text"
              value={payee}
              onChange={(e) => setPayee(e.target.value.toUpperCase())}
              placeholder="Name"
            />

            <label className="field-checkbox">
              <input
                type="checkbox"
                checked={hideBeneficiary}
                onChange={(e) => setHideBeneficiary(e.target.checked)}
              />
              <span>Hide beneficiary name on printed cheque</span>
            </label>

            {/* DATE */}
            <label className="field-label" htmlFor="date">
              Date
            </label>
            <input
              id="date"
              className="field-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            {/* CHEQUE NO + ACCOUNT NO */}
            <label className="field-label" htmlFor="chequeNumber">
              Cheque number
            </label>
            <input
              id="chequeNumber"
              className="field-input"
              type="text"
              value={chequeNumber}
              onChange={(e) => setChequeNumber(e.target.value)}
              placeholder="Cheque # (optional)"
            />

            <label className="field-label" htmlFor="accountNumber">
              Account number
            </label>
            <input
              id="accountNumber"
              className="field-input"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Account number (optional)"
            />

            {/* AMOUNT */}
            <label className="field-label" htmlFor="amount">
              Amount (BHD)
            </label>
            <input
              id="amount"
              className="field-input"
              type="number"
              min="0"
              step="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
            />

            {/* NOTES / PURPOSE */}
            <label className="field-label" htmlFor="notes">
              Purpose / remarks
            </label>
            <textarea
              id="notes"
              className="field-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment for rent, supplier invoice, etc."
            />

            {/* SAVE STATUS */}
            {saveError && <div className="cheque-error">{saveError}</div>}
            {saveDone && !saveError && (
              <div className="cheque-success">
                Cheque saved as Draft. You can see it in History / Approvals.
              </div>
            )}

            {/* BUTTONS ROW */}
            <div className="button-row">
              <button
                type="button"
                className="btn btn-save"
                onClick={handleSaveToSystem}
                disabled={saving}
              >
                <span className="btn-icon" aria-hidden="true">
                  💾
                </span>
                <span>{saving ? "Saving…" : "Save cheque"}</span>
              </button>

              <button
                type="button"
                className="btn btn-download"
                onClick={handleDownload}
              >
                <span className="btn-icon" aria-hidden="true">
                  ⭳
                </span>
                <span>Download</span>
              </button>

              {/* Physical cheque: text only */}
              <button
                type="button"
                className="btn btn-print"
                onClick={handlePrint}
              >
                <span className="btn-icon" aria-hidden="true">
                  🖨
                </span>
                <span>Print (cheque only)</span>
              </button>

              {/* Test / PDF: with background template */}
              <button
                type="button"
                className="btn btn-print"
                onClick={handlePrintWithTemplate}
              >
                <span className="btn-icon" aria-hidden="true">
                  🧾
                </span>
                <span>Print with template</span>
              </button>

              <button
                type="button"
                className="btn btn-share"
                onClick={handleShare}
              >
                <span className="btn-icon" aria-hidden="true">
                  ⤴
                </span>
                <span>Share</span>
              </button>
            </div>

            {/* ADVANCED CALIBRATION */}
            <label className="advanced-toggle">
              <input
                type="checkbox"
                checked={showAdvanced}
                onChange={(e) => setShowAdvanced(e.target.checked)}
              />{" "}
              Advanced calibration
            </label>

            {showAdvanced && (
              <div className="advanced-panel">
                <h3>Line lengths (amount in words)</h3>
                <div className="advanced-row">
                  <span>Line 1</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.lineLength1}
                    onChange={(e) =>
                      updateCfg("lineLength1", e.target.value)
                    }
                  />
                  <span>Line 2</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.lineLength2}
                    onChange={(e) =>
                      updateCfg("lineLength2", e.target.value)
                    }
                  />
                </div>

                <h3>Name (Payee)</h3>
                <div className="advanced-row">
                  <span>X</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.nameX}
                    onChange={(e) => updateCfg("nameX", e.target.value)}
                  />
                  <span>Y</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.nameY}
                    onChange={(e) => updateCfg("nameY", e.target.value)}
                  />
                  <span>Font px</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.nameFont}
                    onChange={(e) => updateCfg("nameFont", e.target.value)}
                  />
                  <span>Tracking px</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.nameTracking}
                    onChange={(e) =>
                      updateCfg("nameTracking", e.target.value)
                    }
                  />
                </div>

                <h3>Amount (in words)</h3>
                <div className="advanced-row">
                  <span>Start X</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.wordsX}
                    onChange={(e) => updateCfg("wordsX", e.target.value)}
                  />
                  <span>Start Y</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.wordsY}
                    onChange={(e) => updateCfg("wordsY", e.target.value)}
                  />
                </div>
                <div className="advanced-row">
                  <span>Line gap px</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.wordsGap}
                    onChange={(e) => updateCfg("wordsGap", e.target.value)}
                  />
                  <span>Font px</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.wordsFont}
                    onChange={(e) => updateCfg("wordsFont", e.target.value)}
                  />
                  <span>Tracking px</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.wordsTracking}
                    onChange={(e) =>
                      updateCfg("wordsTracking", e.target.value)
                    }
                  />
                </div>

                <h3>Amount (numbers)</h3>
                <div className="advanced-row">
                  <span>X</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.numX}
                    onChange={(e) => updateCfg("numX", e.target.value)}
                  />
                  <span>Y</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.numY}
                    onChange={(e) => updateCfg("numY", e.target.value)}
                  />
                  <span>Font px</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.numFont}
                    onChange={(e) => updateCfg("numFont", e.target.value)}
                  />
                </div>

                <h3>Date digits</h3>
                <div className="advanced-row">
                  <span>Base X</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.dateBaseX}
                    onChange={(e) => updateCfg("dateBaseX", e.target.value)}
                  />
                  <span>Y</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.dateY}
                    onChange={(e) => updateCfg("dateY", e.target.value)}
                  />
                </div>
                <div className="advanced-row">
                  <span>Gap day</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.gapDay}
                    onChange={(e) => updateCfg("gapDay", e.target.value)}
                  />
                  <span>Gap month</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.gapMon}
                    onChange={(e) => updateCfg("gapMon", e.target.value)}
                  />
                  <span>Gap year</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.gapYear}
                    onChange={(e) => updateCfg("gapYear", e.target.value)}
                  />
                  <span>Font px</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.dateFont}
                    onChange={(e) => updateCfg("dateFont", e.target.value)}
                  />
                </div>

                <h3>Global canvas</h3>
                <div className="advanced-row">
                  <span>Scale</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.scale}
                    onChange={(e) => updateCfg("scale", e.target.value)}
                  />
                  <span>Rotate° (print)</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.rotate}
                    onChange={(e) => updateCfg("rotate", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: cheque preview */}
          <div className="cheque-preview">
            <canvas ref={canvasRef} className="cheque-canvas" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCheque;
