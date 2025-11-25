// frontend/src/pages/Checks/New.jsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./new.css";
import { createCheque } from "../../services/cheques";

// ---------- helpers ----------

// Convert number to words (BHD style)
function bhd(amount) {
  const words = [];
  words[0] = "Zero"; // capitalized "Zero"
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

// Default calibration tuned to your BBK cheque
const DEFAULT_CFG = {
  // name (payee)
  nameX: 320,
  nameY: 210,
  nameFont: 33,

  // amount in words (start position)
  wordsX: 279,
  wordsY: 299,
  wordsFont: 32,
  wordsLineGap: 40,

  // amount numbers (BD box on right)
  numX: 1135,
  numY: 387,
  numFont: 63,

  // date digits – first box (day first digit)
  dateBaseX: 1011,
  dateY: 97,
  dateGap: 58,
  dateFont: 29,
};

const CFG_STORAGE_KEY = "bbk_cheque_cfg_v2";

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

const NewCheque = () => {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const navigate = useNavigate();

  // Track image size so print overlay uses identical coordinates
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

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

  // --- helper to get words split exactly like canvas preview ---
  function splitWordsForLines(amountValue) {
    const fullWords = formatAmountInWords(amountValue) || "";
    const lineLen1 = 47;
    const lineLen2 = 39;
    const line1 = fullWords.substring(0, lineLen1);
    const rest = fullWords.substring(lineLen1);
    const line2 = rest.substring(0, lineLen2);
    const line3 = rest.substring(lineLen2);
    return { line1, line2, line3 };
  }

  // Core drawing logic (for on-screen preview only)
  const drawCheque = (
    img,
    canvas,
    payeeValue,
    hidePayee,
    dateValue,
    amountValue,
    cfgValue
  ) => {
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background cheque image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000";

    // Payee name (optional hide on printed cheque)
    const finalPayee = hidePayee ? "" : payeeValue;
    if (finalPayee) {
      ctx.font = `${cfgValue.nameFont}px Arial`;
      ctx.fillText(finalPayee.toUpperCase(), cfgValue.nameX, cfgValue.nameY);
    }

    // Amount in words
    if (amountValue) {
      const { line1, line2, line3 } = splitWordsForLines(amountValue);
      ctx.font = `${cfgValue.wordsFont}px Arial`;

      ctx.fillText(line1, cfgValue.wordsX, cfgValue.wordsY);
      if (line2.trim())
        ctx.fillText(
          line2,
          cfgValue.wordsX,
          cfgValue.wordsY + cfgValue.wordsLineGap
        );
      if (line3.trim())
        ctx.fillText(
          line3,
          cfgValue.wordsX,
          cfgValue.wordsY + cfgValue.wordsLineGap * 2
        );
    }

    // Amount numbers (BD)
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

    // Date digits (DDMMYYYY into small boxes)
    if (dateValue) {
      const [y, m, d] = dateValue.split("-");
      if (y && m && d) {
        const digits = `${d}${m}${y}`;
        ctx.font = `${cfgValue.dateFont || 20}px Arial`;
        let x = cfgValue.dateBaseX;
        for (let i = 0; i < digits.length; i++) {
          ctx.fillText(digits[i], x, cfgValue.dateY);
          x += cfgValue.dateGap;
        }
      }
    }
  };

  // Load cheque background image once
  useEffect(() => {
    const img = new Image();
    img.src = "/bbk_3.jpeg"; // in /public

    img.onload = () => {
      imgRef.current = img;
      setImgSize({
        w: img.naturalWidth || img.width,
        h: img.naturalHeight || img.height,
      });
      drawCheque(
        img,
        canvasRef.current,
        payee,
        hideBeneficiary,
        date,
        amount,
        cfg
      );
    };
  }, []); // only once

  // Redraw when data / cfg changes
  useEffect(() => {
    if (!imgRef.current || !canvasRef.current) return;
    drawCheque(
      imgRef.current,
      canvasRef.current,
      payee,
      hideBeneficiary,
      date,
      amount,
      cfg
    );
  }, [payee, hideBeneficiary, date, amount, cfg]);

  // Download canvas as PNG (screen preview)
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    const payeePart = payee ? `_${payee}` : "";
    link.download = `${company}${payeePart}_cheque.png`.replace(/\s+/g, "_");
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Print: **NO BACKGROUND** — render only positioned text via a CANVAS OVERLAY
  // This is for printing directly on the physical cheque.
  const handlePrint = () => {
    const srcCanvas = canvasRef.current;
    if (!srcCanvas) return;

    const overlay = document.createElement("canvas");
    overlay.width = srcCanvas.width;
    overlay.height = srcCanvas.height;

    const ctx = overlay.getContext("2d");
    ctx.fillStyle = "#000";

    // NAME
    if (!hideBeneficiary && payee) {
      ctx.font = `${cfg.nameFont}px Arial`;
      ctx.fillText(payee.toUpperCase(), cfg.nameX, cfg.nameY);
    }

    // AMOUNT IN WORDS (3 LINES)
    if (amount) {
      const { line1, line2, line3 } = splitWordsForLines(amount);
      ctx.font = `${cfg.wordsFont}px Arial`;
      ctx.fillText(line1, cfg.wordsX, cfg.wordsY);
      if (line2.trim())
        ctx.fillText(line2, cfg.wordsX, cfg.wordsY + cfg.wordsLineGap);
      if (line3.trim())
        ctx.fillText(line3, cfg.wordsX, cfg.wordsY + cfg.wordsLineGap * 2);
    }

    // AMOUNT NUMBERS (200/- or 200/000)
    if (amount) {
      ctx.font = `${cfg.numFont}px Arial`;
      const parts = amount.toString().split(".");
      const fils = parts[1] ? parts[1].padEnd(3, "0").slice(0, 3) : "";
      if (fils) ctx.fillText(`${parts[0]}/${fils}`, cfg.numX, cfg.numY);
      else ctx.fillText(`${parts[0]}/-`, cfg.numX, cfg.numY);
    }

    // DATE DIGITS (DDMMYYYY)
    if (date) {
      const [y, m, d] = date.split("-");
      if (y && m && d) {
        const digits = `${d}${m}${y}`;
        ctx.font = `${cfg.dateFont || 20}px Arial`;
        let x = cfg.dateBaseX;
        for (let i = 0; i < digits.length; i++) {
          ctx.fillText(digits[i], x, cfg.dateY);
          x += cfg.dateGap;
        }
      }
    }

    const dataUrl = overlay.toDataURL("image/png");

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Print Cheque Overlay</title>
          <style>
            @page { size: A4 portrait; margin: 0; }
            html,body { margin:0; padding:0; background:transparent; }
            :root{
              --print-offset-x: 10mm;
              --print-offset-y: 12mm;
              --print-scale: 0.92;
            }
            .print-sheet{
              position:relative;
              width:210mm;
              height:297mm;
              overflow:hidden;
            }
            .print-overlay{
              position:absolute;
              top:var(--print-offset-y);
              left:var(--print-offset-x);
              transform-origin:top left;
              transform:scale(var(--print-scale));
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
            window.onload = function(){ window.focus(); window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // Print WITH cheque template (for PDF / test print)
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
            window.onload = function(){ window.focus(); window.print(); window.close(); };
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
    const numeric = Number(value) || 0;
    setCfg((prev) => {
      const next = { ...prev, [field]: numeric };
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
              onChange={(e) => setPayee(e.target.value)}
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
                <h3>Line lengths</h3>
                <div className="advanced-row">
                  <span>Line 1</span>
                  <input
                    type="number"
                    defaultValue={47}
                    disabled
                    className="advanced-input disabled"
                  />
                  <span>Line 2</span>
                  <input
                    type="number"
                    defaultValue={39}
                    disabled
                    className="advanced-input disabled"
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
                    value={cfg.wordsLineGap}
                    onChange={(e) =>
                      updateCfg("wordsLineGap", e.target.value)
                    }
                  />
                  <span>Font px</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.wordsFont}
                    onChange={(e) => updateCfg("wordsFont", e.target.value)}
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
                  <span>Gap px</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.dateGap}
                    onChange={(e) => updateCfg("dateGap", e.target.value)}
                  />
                  <span>Font px</span>
                  <input
                    type="number"
                    className="advanced-input"
                    value={cfg.dateFont || 20}
                    onChange={(e) => updateCfg("dateFont", e.target.value)}
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
