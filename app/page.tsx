"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BranchRow,
  SHEET_ID,
  SHEET_URL,
  SNAPSHOT_DATE,
  snapshotRows,
} from "./dashboardData";

type SourceState = "snapshot" | "loading" | "live";
type GvizCell = { v?: unknown; f?: string } | null;
type GvizPayload = {
  table?: { rows?: Array<{ c?: GvizCell[] }> };
};

const number = new Intl.NumberFormat("th-TH");
const percent = (value: number) =>
  `${Number.isFinite(value) ? value.toFixed(1) : "0.0"}%`;
const BMA_AREAS = ["BMA 1", "BMA 2", "BMA 3", "BMA 4", "BMA 5"];
const BMA_SHEETS = BMA_AREAS.map((bma) => ({
  bma,
  sheet: `ลงยอดรวม ${bma}`,
}));

const SG_EXEMPT_CODES = new Set(["80100484", "80100836"]);
const SNAPSHOT_SG_SUBMITTED = new Set([
  "80100477", "80101713", "80101185", "80100626", "80100565", "80100928",
  "80101679", "80101340", "80101707", "80101708", "80101341", "80101123",
  "80101418", "80100805", "80101070", "80101709", "80101296", "80100481",
  "80101630", "80101201", "80101363", "80101186", "80100623", "80101221",
  "80101269", "80101633", "80101349", "80100729", "80101667", "80101347",
]);
const SNAPSHOT_SSF_SUBMITTED = new Set([
  "80100477", "80101713", "80101264", "80101185", "80100626", "80100565",
  "80100928", "80101679", "80101340", "80101707", "80101708", "80101341",
  "80101418", "80100805", "80101070", "80101709", "80101296", "80100481",
  "80101630", "80101201", "80101363", "80101186", "80101221", "80101269",
  "80101633", "80101349", "80100729", "80101667", "80101347",
]);

function sgExpected(row: BranchRow) {
  return !SG_EXEMPT_CODES.has(row.code);
}

function sgSubmitted(row: BranchRow) {
  return row.sgSubmitted ?? SNAPSHOT_SG_SUBMITTED.has(row.code);
}

function ssfSubmitted(row: BranchRow) {
  return row.ssfSubmitted ?? SNAPSHOT_SSF_SUBMITTED.has(row.code);
}

function hasRelevantSubmission(row: BranchRow) {
  return (sgExpected(row) && sgSubmitted(row)) || ssfSubmitted(row);
}

function sum(rows: BranchRow[], key: keyof BranchRow) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function summarize(rows: BranchRow[]) {
  const sgExpectedRows = rows.filter(sgExpected);
  const sgTarget = sum(sgExpectedRows, "target");
  const ssfTarget = sum(rows, "target");
  const sg = sum(sgExpectedRows, "sg");
  const ssf = sum(rows, "ssf");
  const sgApproved = sum(sgExpectedRows, "sgApproved");
  const sgUsed = sum(sgExpectedRows, "sgUsed");
  const ssfApproved = sum(rows, "ssfApproved");
  const ssfUsed = sum(rows, "ssfUsed");
  const sgMtd = sum(sgExpectedRows, "sgMtd");
  const ssfMtd = sum(rows, "ssfMtd");
  const mtdTotal = sgMtd + ssfMtd;
  const approved = sgApproved + ssfApproved;
  const used = sgUsed + ssfUsed;
  const total = sg + ssf;
  const combinedTarget = sgTarget + ssfTarget;
  const sgReported = sgExpectedRows.filter(sgSubmitted).length;
  const ssfReported = rows.filter(ssfSubmitted).length;
  const submitted = rows.filter(hasRelevantSubmission).length;
  const missingReporter = rows.filter(
    (row) => hasRelevantSubmission(row) && !row.reporter.trim(),
  ).length;

  return {
    branches: rows.length,
    sgTarget,
    ssfTarget,
    sgExpectedBranches: sgExpectedRows.length,
    sg,
    ssf,
    sgApproved,
    sgUsed,
    ssfApproved,
    ssfUsed,
    sgMtd,
    ssfMtd,
    mtdTotal,
    total,
    combinedTarget,
    approved,
    used,
    sgReported,
    ssfReported,
    sgMissing: sgExpectedRows.length - sgReported,
    ssfMissing: rows.length - ssfReported,
    submitted,
    missingReporter,
    sgTargetRate: sgTarget ? (sg / sgTarget) * 100 : 0,
    ssfTargetRate: ssfTarget ? (ssf / ssfTarget) * 100 : 0,
    combinedTargetRate: combinedTarget ? (total / combinedTarget) * 100 : 0,
    sgApprovalRate: sg ? (sgApproved / sg) * 100 : 0,
    sgUsedRate: sgApproved ? (sgUsed / sgApproved) * 100 : 0,
    sgEndToEndRate: sg ? (sgUsed / sg) * 100 : 0,
    ssfApprovalRate: ssf ? (ssfApproved / ssf) * 100 : 0,
    ssfUsedRate: ssfApproved ? (ssfUsed / ssfApproved) * 100 : 0,
    ssfEndToEndRate: ssf ? (ssfUsed / ssf) * 100 : 0,
    approvalRate: total ? (approved / total) * 100 : 0,
    usedRate: approved ? (used / approved) * 100 : 0,
    endToEndRate: total ? (used / total) * 100 : 0,
  };
}

function displayValue(cell: GvizCell) {
  return cell?.f ?? cell?.v ?? "";
}

function normalizeDate(cell: GvizCell) {
  const candidates = [cell?.v, cell?.f].filter(
    (value): value is NonNullable<typeof value> => value != null,
  );

  for (const candidate of candidates) {
    const raw = String(candidate);
    const gvizDate = raw.match(/Date\((\d{4}),(\d{1,2}),(\d{1,2})\)/);
    if (gvizDate) {
      return `${gvizDate[3].padStart(2, "0")}/${String(Number(gvizDate[2]) + 1).padStart(2, "0")}/${gvizDate[1]}`;
    }

    const direct = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (direct) {
      const year = Number(direct[3]) > 2400
        ? Number(direct[3]) - 543
        : Number(direct[3]);
      return `${direct[1].padStart(2, "0")}/${direct[2].padStart(2, "0")}/${year}`;
    }
  }

  return "";
}

function parseRawGviz(payload: GvizPayload, bma: string) {
  return (payload.table?.rows ?? [])
    .map((item): BranchRow | null => {
      const row = item.c ?? [];
      const date = normalizeDate(row[0]);
      const code = String(displayValue(row[1])).trim();
      const branch = String(displayValue(row[2])).trim();
      if (!date || !code || !branch || code === "รหัสสาขา") return null;

      const sgSubmitted = row.slice(5, 8).some((cell) => cell != null);
      const ssfSubmitted = row.slice(11, 14).some((cell) => cell != null);
      return {
        date,
        bma,
        code,
        branch,
        type: String(displayValue(row[3])),
        target: Number(displayValue(row[4]) || 0),
        sg: Number(displayValue(row[5]) || 0),
        sgApproved: Number(displayValue(row[6]) || 0),
        sgUsed: Number(displayValue(row[7]) || 0),
        ssf: Number(displayValue(row[11]) || 0),
        ssfApproved: Number(displayValue(row[12]) || 0),
        ssfUsed: Number(displayValue(row[13]) || 0),
        reporter: String(displayValue(row[17])).trim(),
        sgMtd: Number(displayValue(row[19]) || 0),
        ssfMtd: Number(displayValue(row[20]) || 0),
        submitted: sgSubmitted || ssfSubmitted,
        sgSubmitted,
        ssfSubmitted,
      };
    })
    .filter((row): row is BranchRow => row !== null);
}

function dateKey(value: string) {
  const [day, month, year] = value.split("/").map(Number);
  return year * 10000 + month * 100 + day;
}

function bangkokReportDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const bangkokNow = new Date(
    Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)),
  );
  if (Number(values.hour) < 20) bangkokNow.setUTCDate(bangkokNow.getUTCDate() - 1);
  return `${String(bangkokNow.getUTCDate()).padStart(2, "0")}/${String(bangkokNow.getUTCMonth() + 1).padStart(2, "0")}/${bangkokNow.getUTCFullYear()}`;
}

function loadGvizSheet(sheet: string, bma: string) {
  return new Promise<BranchRow[]>((resolve, reject) => {
    const callbackName = `__financeHistory${Date.now()}${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      script.remove();
      delete (window as unknown as Record<string, unknown>)[callbackName];
      reject(new Error(`Timeout: ${sheet}`));
    }, 15000);

    (
      window as unknown as Record<
        string,
        (payload: GvizPayload) => void
      >
    )[callbackName] = (payload) => {
      window.clearTimeout(timeout);
      const parsed = parseRawGviz(payload, bma);
      script.remove();
      delete (window as unknown as Record<string, unknown>)[callbackName];
      resolve(parsed);
    };

    script.onerror = () => {
      window.clearTimeout(timeout);
      script.remove();
      delete (window as unknown as Record<string, unknown>)[callbackName];
      reject(new Error(`Load failed: ${sheet}`));
    };

    const query = new URLSearchParams({
      sheet,
      range: "A4:U2004",
      tqx: `out:json;responseHandler:${callbackName}`,
      cacheBust: String(Date.now()),
    });
    script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?${query}`;
    document.body.appendChild(script);
  });
}

export default function Home() {
  const [allRows, setAllRows] = useState<BranchRow[]>(
    snapshotRows.map((row) => ({ ...row, date: SNAPSHOT_DATE })),
  );
  const [reportDate, setReportDate] = useState(() => bangkokReportDate());
  const [source, setSource] = useState<SourceState>("snapshot");
  const [updatedAt, setUpdatedAt] = useState("");
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("ทั้งหมด");
  const [copied, setCopied] = useState("");
  const manualDate = useRef(false);

  const refresh = useCallback(async () => {
    setSource("loading");
    try {
      const loaded = (await Promise.all(
        BMA_SHEETS.map(({ sheet, bma }) => loadGvizSheet(sheet, bma)),
      )).flat();
      if (loaded.length < 50) throw new Error("Incomplete dashboard data");

      const dates = [...new Set(loaded.map((row) => row.date).filter(Boolean) as string[])]
        .sort((a, b) => dateKey(b) - dateKey(a));
      const scheduledDate = bangkokReportDate();
      const defaultDate =
        dates.find((date) => dateKey(date) <= dateKey(scheduledDate)) ??
        dates.at(-1) ??
        scheduledDate;

      setAllRows(loaded);
      if (!manualDate.current) {
        setReportDate(
          dates.includes(scheduledDate) ? scheduledDate : defaultDate,
        );
      }
      setSource("live");
      setUpdatedAt(
        new Intl.DateTimeFormat("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Bangkok",
        }).format(new Date()),
      );
    } catch {
      setSource((current) => (current === "loading" ? "snapshot" : current));
    }
  }, []);

  useEffect(() => {
    const syncBusinessDate = () => {
      if (!manualDate.current) setReportDate(bangkokReportDate());
    };
    const refreshWhenActive = () => {
      if (document.visibilityState === "visible") {
        syncBusinessDate();
        void refresh();
      }
    };
    const initialRefresh = window.setTimeout(refresh, 0);
    const refreshInterval = window.setInterval(refresh, 5 * 60 * 1000);
    const clockInterval = window.setInterval(syncBusinessDate, 30 * 1000);
    window.addEventListener("focus", refreshWhenActive);
    window.addEventListener("online", refreshWhenActive);
    document.addEventListener("visibilitychange", refreshWhenActive);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(refreshInterval);
      window.clearInterval(clockInterval);
      window.removeEventListener("focus", refreshWhenActive);
      window.removeEventListener("online", refreshWhenActive);
      document.removeEventListener("visibilitychange", refreshWhenActive);
    };
  }, [refresh]);

  const availableDates = useMemo(
    () =>
      [
        ...new Set([
          reportDate,
          ...allRows.map((row) => row.date ?? SNAPSHOT_DATE),
        ]),
      ]
        .sort((a, b) => dateKey(b) - dateKey(a)),
    [allRows, reportDate],
  );
  const rows = useMemo(
    () =>
      allRows.filter((row) => (row.date ?? SNAPSHOT_DATE) === reportDate),
    [allRows, reportDate],
  );
  const selectDate = useCallback((value: string) => {
    manualDate.current = true;
    setReportDate(value);
    setQuery("");
  }, []);
  const returnToCurrentCycle = useCallback(() => {
    manualDate.current = false;
    const scheduledDate = bangkokReportDate();
    const defaultDate =
      availableDates.find((date) => dateKey(date) <= dateKey(scheduledDate)) ??
      availableDates.at(-1) ??
      SNAPSHOT_DATE;
    setReportDate(defaultDate);
    setQuery("");
  }, [availableDates]);

  const dashboardRows = useMemo(
    () =>
      areaFilter === "ทั้งหมด"
        ? rows
        : rows.filter((row) => row.bma === areaFilter),
    [areaFilter, rows],
  );
  const total = useMemo(() => summarize(dashboardRows), [dashboardRows]);
  const allBmaRows = useMemo(
    () =>
      BMA_AREAS.map((bma) => ({
        bma,
        ...summarize(rows.filter((row) => row.bma === bma)),
      })),
    [rows],
  );
  const bmaRows = useMemo(
    () =>
      areaFilter === "ทั้งหมด"
        ? allBmaRows
        : allBmaRows.filter((row) => row.bma === areaFilter),
    [allBmaRows, areaFilter],
  );
  const rankedBmaRows = useMemo(
    () =>
      [...bmaRows]
        .sort(
          (a, b) =>
            b.total - a.total ||
            b.combinedTargetRate - a.combinedTargetRate ||
            a.bma.localeCompare(b.bma),
        )
        .map((row, index) => ({ ...row, rank: index + 1 })),
    [bmaRows],
  );
  const branchPerformance = useMemo(
    () =>
      dashboardRows
        .map((row) => {
          const includeSg = sgExpected(row);
          const totalInsert = (includeSg ? row.sg : 0) + row.ssf;
          const approved =
            (includeSg ? row.sgApproved : 0) + row.ssfApproved;
          const used = (includeSg ? row.sgUsed : 0) + row.ssfUsed;
          const target = (includeSg ? row.target : 0) + row.target;
          const sgMtd = includeSg ? Number(row.sgMtd || 0) : 0;
          const ssfMtd = Number(row.ssfMtd || 0);
          return {
            ...row,
            totalInsert,
            approved,
            used,
            sgMtd,
            ssfMtd,
            mtdTotal: sgMtd + ssfMtd,
            combinedTarget: target,
            achRate: target ? (totalInsert / target) * 100 : 0,
            approvalRate: totalInsert ? (approved / totalInsert) * 100 : 0,
            usedRate: approved ? (used / approved) * 100 : 0,
          };
        })
        .filter((row) => row.totalInsert > 0),
    [dashboardRows],
  );
  const topQtyBranches = useMemo(
    () =>
      [...branchPerformance]
        .sort(
          (a, b) =>
            b.totalInsert - a.totalInsert ||
            b.achRate - a.achRate ||
            a.branch.localeCompare(b.branch),
        )
        .slice(0, 5),
    [branchPerformance],
  );
  const topAchBranches = useMemo(
    () =>
      [...branchPerformance]
        .filter((row) => row.combinedTarget > 0)
        .sort(
          (a, b) =>
            b.achRate - a.achRate ||
            b.totalInsert - a.totalInsert ||
            a.branch.localeCompare(b.branch),
        )
        .slice(0, 5),
    [branchPerformance],
  );
  const maxBmaTotal = Math.max(...bmaRows.map((bma) => bma.total), 1);
  const maxBmaInsert = Math.max(
    ...bmaRows.flatMap((bma) => [bma.sg, bma.ssf]),
    1,
  );
  const maxReportingBase = Math.max(
    ...bmaRows.map((bma) => bma.sgExpectedBranches + bma.branches),
    1,
  );
  const missingRows = useMemo(
    () =>
      dashboardRows
        .map((row) => ({
          row,
          missingSg: sgExpected(row) && !sgSubmitted(row),
          missingSsf: !ssfSubmitted(row),
        }))
        .filter((item) => item.missingSg || item.missingSsf),
    [dashboardRows],
  );
  const visibleRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return dashboardRows.filter((row) => {
      if (!hasRelevantSubmission(row)) return false;
      return (
        !normalized ||
        row.code.toLowerCase().includes(normalized) ||
        row.branch.toLowerCase().includes(normalized) ||
        row.reporter.toLowerCase().includes(normalized)
      );
    });
  }, [dashboardRows, query]);
  const leadingBma = [...bmaRows].sort((a, b) => b.total - a.total)[0];
  const mostMissingBma = [...bmaRows].sort(
    (a, b) => b.sgMissing + b.ssfMissing - (a.sgMissing + a.ssfMissing),
  )[0];
  const pendingUse = Math.max(total.approved - total.used, 0);
  const approvalGap = Math.max(total.total - total.approved, 0);
  const areaLabel = areaFilter === "ทั้งหมด" ? "ทุกพื้นที่" : areaFilter;
  const selectArea = useCallback((value: string) => {
    setAreaFilter(value);
    setQuery("");
  }, []);

  const copyText = useCallback(
    async (kind: "summary" | "table") => {
      const report =
        kind === "summary"
          ? [
              `สรุปผลงาน Finance ${areaLabel} ประจำวันที่ ${reportDate}`,
              `SG Finance: เสียบบัตร ${total.sg} รายการ • TG ${total.sgTarget} • ${percent(total.sgTargetRate)} TG • ลงข้อมูล ${total.sgReported}/${total.sgExpectedBranches} สาขา • ยังไม่ลงข้อมูล ${total.sgMissing} สาขา`,
              `Samsung Finance: เสียบบัตร ${total.ssf} รายการ • TG ${total.ssfTarget} • ${percent(total.ssfTargetRate)} TG • ลงข้อมูล ${total.ssfReported}/${total.branches} สาขา • ยังไม่ลงข้อมูล ${total.ssfMissing} สาขา`,
              `อนุมัติ ${total.approved} รายการ (${percent(total.approvalRate)}) • Used ${total.used} รายการ (${percent(total.usedRate)})`,
              `Conversion SG: เสียบบัตร ${total.sg} → อนุมัติ ${total.sgApproved} (${percent(total.sgApprovalRate)}) → Used ${total.sgUsed} (${percent(total.sgUsedRate)} ของอนุมัติ)`,
              `Conversion Samsung: เสียบบัตร ${total.ssf} → อนุมัติ ${total.ssfApproved} (${percent(total.ssfApprovalRate)}) → Used ${total.ssfUsed} (${percent(total.ssfUsedRate)} ของอนุมัติ)`,
              `MTD: SG Finance ${total.sgMtd} • Samsung Finance ${total.ssfMtd} • รวม ${total.mtdTotal} รายการ`,
              ...bmaRows.map(
                (bma) =>
                  `${bma.bma}: SG ${bma.sg}/${bma.sgTarget} (${percent(bma.sgTargetRate)}) • Samsung ${bma.ssf}/${bma.ssfTarget} (${percent(bma.ssfTargetRate)}) • รวม ${bma.total} • MTD SG ${bma.sgMtd} / Samsung ${bma.ssfMtd}`,
              ),
              `จุดติดตาม: ${mostMissingBma.bma} มีรายการขาดรายงานรวม SG/SSF มากที่สุด ${mostMissingBma.sgMissing + mostMissingBma.ssfMissing} จุด • อนุมัติแล้วแต่ยังไม่ Used ${pendingUse} รายการ • ไม่ระบุชื่อผู้ลงข้อมูล ${total.missingReporter} สาขา`,
              `Top QTY: ${topQtyBranches.map((row, index) => `${index + 1}. ${row.branch} ${row.totalInsert} รายการ (SG ${row.sg} / Samsung ${row.ssf} / MTD ${row.mtdTotal})`).join(" • ")}`,
              `Top % Ach: ${topAchBranches.map((row, index) => `${index + 1}. ${row.branch} ${percent(row.achRate)} (SG ${row.sg} / Samsung ${row.ssf} / MTD ${row.mtdTotal})`).join(" • ")}`,
              `หมายเหตุ SG: Shopcode 80100484 และ 80100836 ถูกระงับการใช้งาน จึงไม่รวมใน TG และจำนวนสาขาที่ต้องรายงาน SG`,
            ].join("\n")
          : [
              [
                "พื้นที่",
                "รหัสสาขา",
                "ชื่อสาขา",
                "Type Shop",
                "SG TG",
                "SG เสียบบัตร",
                "SG อนุมัติ",
                "SG Used",
                "SG % TG",
                "Samsung TG",
                "SSF เสียบบัตร",
                "SSF อนุมัติ",
                "SSF Used",
                "Samsung % TG",
                "SG MTD",
                "Samsung MTD",
                "ชื่อผู้ลงข้อมูล",
              ].join("\t"),
              ...visibleRows.map((row) => {
                const isSgExempt = !sgExpected(row);
                return [
                  row.bma,
                  row.code,
                  row.branch,
                  row.type,
                  isSgExempt ? "ยกเว้น" : row.target,
                  isSgExempt ? "-" : row.sg,
                  isSgExempt ? "-" : row.sgApproved,
                  isSgExempt ? "-" : row.sgUsed,
                  isSgExempt ? "-" : percent(row.target ? (row.sg / row.target) * 100 : 0),
                  row.target,
                  row.ssf,
                  row.ssfApproved,
                  row.ssfUsed,
                  percent(row.target ? (row.ssf / row.target) * 100 : 0),
                  isSgExempt ? "-" : Number(row.sgMtd || 0),
                  Number(row.ssfMtd || 0),
                  row.reporter || "-",
                ].join("\t");
              }),
            ].join("\n");
      await navigator.clipboard.writeText(report);
      setCopied(kind);
      window.setTimeout(() => setCopied(""), 1800);
    },
    [
      bmaRows,
      mostMissingBma.bma,
      mostMissingBma.sgMissing,
      mostMissingBma.ssfMissing,
      pendingUse,
      topAchBranches,
      topQtyBranches,
      reportDate,
      areaLabel,
      total,
      visibleRows,
    ],
  );

  const kpis = [
    {
      label: "SG เสียบบัตร",
      value: number.format(total.sg),
      note: `TG ${total.sgTarget} • ${percent(total.sgTargetRate)}`,
      tone: "red",
      icon: "SG",
    },
    {
      label: "SG สาขาที่ลงข้อมูล",
      value: `${total.sgReported}/${total.sgExpectedBranches}`,
      note: `ยังไม่ลงข้อมูล ${total.sgMissing} สาขา`,
      tone: "dark",
      icon: "✓",
    },
    {
      label: "Samsung เสียบบัตร",
      value: number.format(total.ssf),
      note: `TG ${total.ssfTarget} • ${percent(total.ssfTargetRate)}`,
      tone: "blue",
      icon: "SS",
    },
    {
      label: "Samsung สาขาที่ลงข้อมูล",
      value: `${total.ssfReported}/${total.branches}`,
      note: `ยังไม่ลงข้อมูล ${total.ssfMissing} สาขา`,
      tone: "green",
      icon: "✓",
    },
    {
      label: "อัตราอนุมัติ",
      value: percent(total.approvalRate),
      note: `${total.approved} จาก ${total.total} รายการ`,
      tone: "amber",
      icon: "A",
    },
    {
      label: "Conversion Used",
      value: percent(total.usedRate),
      note: `${total.used} จากอนุมัติ ${total.approved}`,
      tone: "violet",
      icon: "U",
    },
  ];

  return (
    <main>
      <section className="hero">
        <div className="hero-glow hero-glow-red" />
        <div className="hero-glow hero-glow-blue" />
        <div className="shell hero-content">
          <div className="topbar">
            <div className="brand">
              <span className="brand-mark">T</span>
              <div>
                <strong>TRUE SHOP FINANCE</strong>
                <span>Daily performance intelligence</span>
              </div>
            </div>
            <div className="top-actions">
              <label className="global-area-filter">
                <span>By BMA</span>
                <select
                  aria-label="เลือกพื้นที่ BMA สำหรับ Dashboard"
                  value={areaFilter}
                  onChange={(event) => selectArea(event.target.value)}
                >
                  {["ทั้งหมด", ...BMA_AREAS].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <span className={`source-pill ${source}`}>
                <i />
                {source === "live"
                  ? `ข้อมูลล่าสุด${updatedAt ? ` • ${updatedAt} น.` : ""}`
                  : source === "loading"
                    ? "กำลังอัปเดต"
                    : `ข้อมูลสำรอง ${SNAPSHOT_DATE}`}
              </span>
              <button className="button button-ghost" onClick={refresh}>
                ↻ รีเฟรช
              </button>
              <a
                className="button button-light"
                href={SHEET_URL}
                target="_blank"
                rel="noreferrer"
              >
                เปิด Google Sheet ↗
              </a>
            </div>
          </div>

          <div className="hero-copy">
            <div>
              <span className="eyebrow">EXECUTIVE DAILY INFOGRAPHIC</span>
              <h1>
                ภาพรวมผลงาน <span>SG + Samsung Finance</span>
              </h1>
              <p>
                สรุปผลเสียบบัตร การอนุมัติ และ Conversion Used
                พร้อมเลือกดูภาพรวมรายพื้นที่ BMA ในหน้าเดียว
              </p>
            </div>
            <div className="date-card">
              <label htmlFor="report-date">ประจำวันที่</label>
              <select
                id="report-date"
                aria-label="เลือกวันที่ผลงาน"
                value={reportDate}
                onChange={(event) => selectDate(event.target.value)}
              >
                {availableDates.map((date) => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
              <small>เปลี่ยนวันใหม่อัตโนมัติหลัง 20:00 น.</small>
              <button type="button" onClick={returnToCurrentCycle}>
                ดูรอบวันที่ปัจจุบัน
              </button>
            </div>
          </div>

          <div className="kpi-grid">
            {kpis.map((kpi) => (
              <article className={`kpi-card ${kpi.tone}`} key={kpi.label}>
                <div className="kpi-icon">{kpi.icon}</div>
                <span>{kpi.label}</span>
                <strong>{kpi.value}</strong>
                <small>{kpi.note}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="shell content">
        <div className="section-heading">
          <div>
            <span className="eyebrow dark">PERFORMANCE BY AREA</span>
            <h2>ภาพผลงาน {areaLabel}</h2>
          </div>
          <div className="legend">
            <span><i className="legend-sg" /> SG Finance</span>
            <span><i className="legend-ssf" /> Samsung Finance</span>
          </div>
        </div>

        <div className="bma-grid">
          {bmaRows.map((bma) => (
            <article className="bma-card" key={bma.bma}>
              <div className="bma-head">
                <div>
                  <span>{bma.bma}</span>
                  <strong>{bma.total}</strong>
                  <small>รายการเสียบบัตร</small>
                </div>
              </div>
              <div className="stacked-track" aria-label={`${bma.bma} ${bma.total} รายการ`}>
                <span
                  className="bar-sg"
                  style={{ width: `${(bma.sg / maxBmaTotal) * 100}%` }}
                />
                <span
                  className="bar-ssf"
                  style={{ width: `${(bma.ssf / maxBmaTotal) * 100}%` }}
                />
              </div>
              <div className="bma-split">
                <span><i className="legend-sg" /> SG <strong>{bma.sg}</strong><small>เสียบบัตร</small></span>
                <span><i className="legend-ssf" /> Samsung <strong>{bma.ssf}</strong><small>เสียบบัตร</small></span>
              </div>
              <div className="reporting reporting-dual">
                <div className="report-line">
                  <div>
                    <span>SG ผลงาน {bma.sg} / TG {bma.sgTarget}</span>
                    <strong className="target-rate sg-rate">
                      {percent(bma.sgTargetRate)}
                      <small>TG</small>
                    </strong>
                  </div>
                  <div className="thin-track sg-track">
                    <i style={{ width: `${Math.min(bma.sgTargetRate, 100)}%` }} />
                  </div>
                </div>
                <div className="report-line">
                  <div>
                    <span>Samsung ผลงาน {bma.ssf} / TG {bma.ssfTarget}</span>
                    <strong className="target-rate ssf-rate">
                      {percent(bma.ssfTargetRate)}
                      <small>TG</small>
                    </strong>
                  </div>
                  <div className="thin-track ssf-track">
                    <i style={{ width: `${Math.min(bma.ssfTargetRate, 100)}%` }} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <section className="executive-view">
          <div className="section-heading compact executive-view-heading">
            <div>
              <span className="eyebrow dark">EXECUTIVE VIEW</span>
              <h2>ตารางและกราฟสรุป {areaLabel}</h2>
              <p>มุมมองเดียวกับ Dashboard ใน Google Sheet • อัปเดตตามตัวเลือก By BMA</p>
            </div>
            <span className="executive-date">ประจำวันที่ {reportDate}</span>
          </div>

          <div className="matrix-wrap">
            <table className="executive-matrix" aria-label={`ตารางสรุปผลงาน ${areaLabel}`}>
              <thead>
                <tr>
                  <th>พื้นที่</th>
                  <th className="sg-head">SG<br />ฐานสาขา</th>
                  <th className="sg-head">SG<br />ลงข้อมูล</th>
                  <th className="sg-head">SG<br />ยังไม่ลง</th>
                  <th className="sg-head">SG<br />เสียบบัตร</th>
                  <th className="ssf-head">Samsung<br />เสียบบัตร</th>
                  <th className="sg-head">SG TG</th>
                  <th className="sg-head">SG % TG</th>
                  <th className="ssf-head">Samsung TG</th>
                  <th className="ssf-head">Samsung % TG</th>
                  <th className="ssf-head">Samsung<br />ฐานสาขา</th>
                  <th className="ssf-head">Samsung<br />ลงข้อมูล</th>
                  <th className="ssf-head">Samsung<br />ยังไม่ลง</th>
                  <th>ไม่ระบุ<br />ผู้ลงข้อมูล</th>
                </tr>
              </thead>
              <tbody>
                {bmaRows.map((bma) => (
                  <tr key={`matrix-${bma.bma}`}>
                    <td><strong>{bma.bma}</strong></td>
                    <td>{bma.sgExpectedBranches}</td>
                    <td>{bma.sgReported}</td>
                    <td className={bma.sgMissing ? "metric-alert" : ""}>{bma.sgMissing}</td>
                    <td className="metric-sg">{bma.sg}</td>
                    <td className="metric-ssf">{bma.ssf}</td>
                    <td>{bma.sgTarget}</td>
                    <td><span className="matrix-rate sg-matrix-rate">{percent(bma.sgTargetRate)}</span></td>
                    <td>{bma.ssfTarget}</td>
                    <td><span className="matrix-rate ssf-matrix-rate">{percent(bma.ssfTargetRate)}</span></td>
                    <td>{bma.branches}</td>
                    <td>{bma.ssfReported}</td>
                    <td className={bma.ssfMissing ? "metric-alert" : ""}>{bma.ssfMissing}</td>
                    <td className={bma.missingReporter ? "metric-warning" : ""}>{bma.missingReporter}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>รวม {areaLabel}</strong></td>
                  <td>{total.sgExpectedBranches}</td>
                  <td>{total.sgReported}</td>
                  <td>{total.sgMissing}</td>
                  <td>{total.sg}</td>
                  <td>{total.ssf}</td>
                  <td>{total.sgTarget}</td>
                  <td>{percent(total.sgTargetRate)}</td>
                  <td>{total.ssfTarget}</td>
                  <td>{percent(total.ssfTargetRate)}</td>
                  <td>{total.branches}</td>
                  <td>{total.ssfReported}</td>
                  <td>{total.ssfMissing}</td>
                  <td>{total.missingReporter}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="executive-highlight">
            <strong>EXECUTIVE HIGHLIGHT</strong>
            <span>
              ยอดเสียบบัตรรวม {total.total} รายการ • SG {percent(total.sgTargetRate)} TG •
              Samsung {percent(total.ssfTargetRate)} TG • Conversion Used {percent(total.usedRate)}
            </span>
          </div>

          <div className="executive-charts">
            <article className="executive-chart-panel">
              <div className="chart-title">
                <div>
                  <span className="eyebrow dark">DAILY APPLICATION</span>
                  <h3>ยอดเสียบบัตรวันนี้แยก BMA</h3>
                  <p>เปรียบเทียบ SG Finance และ Samsung Finance</p>
                </div>
                <strong>{total.total}</strong>
              </div>
              <div className={`insert-chart ${bmaRows.length === 1 ? "single-chart" : ""}`}>
                {bmaRows.map((bma) => (
                  <div className="insert-group" key={`insert-${bma.bma}`}>
                    <div className="insert-bars">
                      <div
                        className="insert-bar insert-sg"
                        style={{ height: `${Math.max((bma.sg / maxBmaInsert) * 100, bma.sg ? 7 : 0)}%` }}
                      >
                        <span>{bma.sg}</span>
                      </div>
                      <div
                        className="insert-bar insert-ssf"
                        style={{ height: `${Math.max((bma.ssf / maxBmaInsert) * 100, bma.ssf ? 7 : 0)}%` }}
                      >
                        <span>{bma.ssf}</span>
                      </div>
                    </div>
                    <strong>{bma.bma}</strong>
                  </div>
                ))}
              </div>
              <div className="chart-legend">
                <span><i className="legend-sg" /> SG เสียบบัตร</span>
                <span><i className="legend-ssf" /> Samsung เสียบบัตร</span>
              </div>
            </article>

            <article className="executive-chart-panel">
              <div className="chart-title">
                <div>
                  <span className="eyebrow dark">SUBMISSION STATUS</span>
                  <h3>ความครบถ้วนการลงข้อมูลรายพื้นที่</h3>
                  <p>รวมสถานะ SG และ Samsung Finance</p>
                </div>
                <strong>{total.sgReported + total.ssfReported}</strong>
              </div>
              <div className="submission-chart">
                {bmaRows.map((bma) => {
                  const reported = bma.sgReported + bma.ssfReported;
                  const missing = bma.sgMissing + bma.ssfMissing;
                  const reportingBase = bma.sgExpectedBranches + bma.branches;
                  return (
                    <div className="submission-line" key={`submission-${bma.bma}`}>
                      <strong>{bma.bma}</strong>
                      <div className="submission-axis">
                        <div
                          className="submission-stack"
                          style={{ width: `${(reportingBase / maxReportingBase) * 100}%` }}
                          aria-label={`${bma.bma} ลงข้อมูล ${reported} ยังไม่ลงข้อมูล ${missing}`}
                        >
                          <span
                            className="submission-reported"
                            style={{ width: `${reportingBase ? (reported / reportingBase) * 100 : 0}%` }}
                          >
                            {reported || ""}
                          </span>
                          <span
                            className="submission-missing"
                            style={{ width: `${reportingBase ? (missing / reportingBase) * 100 : 0}%` }}
                          >
                            {missing || ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="chart-legend">
                <span><i className="legend-reported" /> ลงข้อมูลแล้ว</span>
                <span><i className="legend-missing" /> ยังไม่ลงข้อมูล</span>
              </div>
            </article>
          </div>
        </section>

        <section className="performance-intelligence">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow dark">DAILY PERFORMANCE ANALYSIS</span>
              <h2>วิเคราะห์ Conversion และจัดอันดับ {areaLabel}</h2>
              <p>
                อ่านครบทั้งจำนวนเสียบบัตร การอนุมัติ การนำไปใช้ และผลงานเทียบ Target
              </p>
            </div>
            <span className="executive-date">ประจำวันที่ {reportDate}</span>
          </div>

          <div className="conversion-compare">
            {[
              {
                key: "sg",
                label: "SG Finance",
                tone: "sg-conversion",
                insert: total.sg,
                approved: total.sgApproved,
                used: total.sgUsed,
                approvalRate: total.sgApprovalRate,
                usedRate: total.sgUsedRate,
                endToEndRate: total.sgEndToEndRate,
              },
              {
                key: "ssf",
                label: "Samsung Finance",
                tone: "ssf-conversion",
                insert: total.ssf,
                approved: total.ssfApproved,
                used: total.ssfUsed,
                approvalRate: total.ssfApprovalRate,
                usedRate: total.ssfUsedRate,
                endToEndRate: total.ssfEndToEndRate,
              },
            ].map((finance) => (
              <article className={`conversion-card ${finance.tone}`} key={finance.key}>
                <div className="conversion-card-head">
                  <div>
                    <span>CONVERSION BY FINANCE</span>
                    <h3>{finance.label}</h3>
                  </div>
                  <strong>{percent(finance.endToEndRate)}</strong>
                </div>
                <div className="conversion-flow">
                  <div className="conversion-step">
                    <span>เสียบบัตร</span>
                    <strong>{finance.insert}</strong>
                    <small>ฐาน 100%</small>
                  </div>
                  <i>→</i>
                  <div className="conversion-step">
                    <span>อนุมัติ</span>
                    <strong>{finance.approved}</strong>
                    <small>{percent(finance.approvalRate)} ของเสียบบัตร</small>
                  </div>
                  <i>→</i>
                  <div className="conversion-step">
                    <span>Used</span>
                    <strong>{finance.used}</strong>
                    <small>{percent(finance.usedRate)} ของอนุมัติ</small>
                  </div>
                </div>
                <div className="conversion-gaps">
                  <span>
                    ไม่อนุมัติ/รอผล <strong>{Math.max(finance.insert - finance.approved, 0)}</strong>
                  </span>
                  <span>
                    อนุมัติแล้วยังไม่ Used <strong>{Math.max(finance.approved - finance.used, 0)}</strong>
                  </span>
                </div>
              </article>
            ))}

            <article className="conversion-card total-conversion">
              <div className="conversion-card-head">
                <div>
                  <span>COMBINED CONVERSION</span>
                  <h3>SG + Samsung</h3>
                </div>
                <strong>{percent(total.endToEndRate)}</strong>
              </div>
              <div className="conversion-summary-metrics">
                <div>
                  <span>เสียบบัตร → อนุมัติ</span>
                  <strong>{percent(total.approvalRate)}</strong>
                  <small>{total.approved} / {total.total} รายการ</small>
                </div>
                <div>
                  <span>อนุมัติ → Used</span>
                  <strong>{percent(total.usedRate)}</strong>
                  <small>{total.used} / {total.approved} รายการ</small>
                </div>
                <div>
                  <span>เสียบบัตร → Used</span>
                  <strong>{percent(total.endToEndRate)}</strong>
                  <small>{total.used} / {total.total} รายการ</small>
                </div>
              </div>
              <div className="conversion-gaps">
                <span>Gap ก่อนอนุมัติ <strong>{approvalGap}</strong></span>
                <span>Gap ก่อน Used <strong>{pendingUse}</strong></span>
              </div>
            </article>
          </div>

          <div className="ranking-layout">
            <article className="ranking-panel area-ranking-panel">
              <div className="ranking-panel-head">
                <div>
                  <span className="eyebrow dark">AREA RANKING</span>
                  <h3>สรุปและจัดอันดับรายพื้นที่</h3>
                  <p>เรียงตามจำนวนเสียบบัตรรวมสูงสุด</p>
                </div>
                <span className="rank-method">QTY → % Ach</span>
              </div>
              <div className="ranking-table-wrap">
                <table className="ranking-table">
                  <thead>
                    <tr>
                      <th>อันดับ</th>
                      <th>พื้นที่</th>
                      <th>Target รวม</th>
                      <th className="sg-head">SG</th>
                      <th className="ssf-head">Samsung</th>
                      <th>รวม</th>
                      <th>% Ach</th>
                      <th className="sg-head">SG MTD</th>
                      <th className="ssf-head">Samsung MTD</th>
                      <th>MTD รวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankedBmaRows.map((bma) => (
                      <tr key={`rank-${bma.bma}`}>
                        <td><span className={`rank-badge rank-${bma.rank}`}>{bma.rank}</span></td>
                        <td><strong>{bma.bma}</strong></td>
                        <td>{bma.combinedTarget}</td>
                        <td className="metric-sg">{bma.sg}</td>
                        <td className="metric-ssf">{bma.ssf}</td>
                        <td className="rank-primary">{bma.total}</td>
                        <td><span className="rank-rate">{percent(bma.combinedTargetRate)}</span></td>
                        <td className="metric-sg">{bma.sgMtd}</td>
                        <td className="metric-ssf">{bma.ssfMtd}</td>
                        <td><strong>{bma.mtdTotal}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <div className="top-branches-grid">
              <article className="ranking-panel">
                <div className="ranking-panel-head">
                  <div>
                    <span className="eyebrow dark">TOP 5 BRANCHES • QTY</span>
                    <h3>สาขาเสียบบัตรสูงสุด</h3>
                    <p>วัดจากจำนวนรายการ SG + Samsung</p>
                  </div>
                </div>
                <div className="leader-list">
                  {topQtyBranches.map((row, index) => (
                    <div className="leader-row" key={`qty-${row.code}`}>
                      <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
                      <div>
                        <strong>{row.branch}</strong>
                        <small>{row.bma} • {row.code} • Target {row.combinedTarget}</small>
                        <span className="finance-breakdown">
                          <i className="sg-chip">SG {row.sg}</i>
                          <i className="ssf-chip">Samsung {row.ssf}</i>
                          <i className="mtd-chip">MTD {row.mtdTotal}</i>
                        </span>
                      </div>
                      <div className="leader-value">
                        <strong>{row.totalInsert}</strong>
                        <small>{percent(row.achRate)} Ach</small>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="ranking-panel">
                <div className="ranking-panel-head">
                  <div>
                    <span className="eyebrow dark">TOP 5 BRANCHES • % ACH</span>
                    <h3>สาขาผลงานเทียบเป้าสูงสุด</h3>
                    <p>% Ach = เสียบบัตรรวม ÷ Target รวมที่เกี่ยวข้อง</p>
                  </div>
                </div>
                <div className="leader-list">
                  {topAchBranches.map((row, index) => (
                    <div className="leader-row" key={`ach-${row.code}`}>
                      <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
                      <div>
                        <strong>{row.branch}</strong>
                        <small>{row.bma} • {row.code} • {row.totalInsert}/{row.combinedTarget} รายการ</small>
                        <span className="finance-breakdown">
                          <i className="sg-chip">SG {row.sg}</i>
                          <i className="ssf-chip">Samsung {row.ssf}</i>
                          <i className="mtd-chip">MTD {row.mtdTotal}</i>
                        </span>
                      </div>
                      <div className="leader-value ach-value">
                        <strong>{percent(row.achRate)}</strong>
                        <small>Approved {percent(row.approvalRate)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>

        <div className="analysis-grid">
          <article className="panel finance-mix">
            <div className="panel-title">
              <div>
                <span className="eyebrow dark">FINANCE MIX</span>
                <h3>สัดส่วนยอดเสียบบัตร</h3>
              </div>
              <strong>{total.total}</strong>
            </div>
            <div className="donut-row">
              <div
                className="donut"
                style={{
                  background: `conic-gradient(var(--sg) 0 ${
                    total.total ? (total.sg / total.total) * 100 : 0
                  }%, var(--ssf) 0 100%)`,
                }}
              >
                <div>
                  <strong>{total.total}</strong>
                  <span>รายการรวม</span>
                </div>
              </div>
              <div className="mix-list">
                <div>
                  <span><i className="legend-sg" /> SG Finance</span>
                  <strong>{total.sg}</strong>
                  <small>{percent(total.total ? (total.sg / total.total) * 100 : 0)}</small>
                </div>
                <div>
                  <span><i className="legend-ssf" /> Samsung Finance</span>
                  <strong>{total.ssf}</strong>
                  <small>{percent(total.total ? (total.ssf / total.total) * 100 : 0)}</small>
                </div>
              </div>
            </div>
          </article>

          <article className="panel conversion-panel">
            <div className="panel-title">
              <div>
                <span className="eyebrow dark">CONVERSION USED</span>
                <h3>Conversion Used</h3>
              </div>
            </div>
            <div className="funnel">
              <div className="funnel-row">
                <div><span>เสียบบัตร</span><strong>{total.total}</strong></div>
                <div className="funnel-track"><i style={{ width: "100%" }} /></div>
                <small>ฐาน 100%</small>
              </div>
              <div className="funnel-row approved">
                <div><span>อนุมัติวงเงิน</span><strong>{total.approved}</strong></div>
                <div className="funnel-track"><i style={{ width: `${Math.min(total.approvalRate, 100)}%` }} /></div>
                <small>{percent(total.approvalRate)}</small>
              </div>
              <div className="funnel-row used">
                <div><span>Used ซื้อเครื่อง</span><strong>{total.used}</strong></div>
                <div className="funnel-track"><i style={{ width: `${Math.min(total.total ? (total.used / total.total) * 100 : 0, 100)}%` }} /></div>
                <small>{percent(total.usedRate)} ของอนุมัติ</small>
              </div>
            </div>
          </article>

          <article className="panel insight-panel">
            <div className="panel-title">
              <div>
                <span className="eyebrow dark">EXECUTIVE INSIGHT</span>
                <h3>วิเคราะห์และสรุปปัญหา</h3>
              </div>
            </div>
            <div className="insight-list">
              <div className="insight success">
                <span>01</span>
                <p>
                  <strong>{leadingBma.bma}</strong>{" "}
                  {areaFilter === "ทั้งหมด" ? "มียอดเสียบบัตรสูงสุด" : "มียอดเสียบบัตร"}
                  {" "}{leadingBma.total} รายการ — SG {percent(leadingBma.sgTargetRate)} TG
                  และ Samsung {percent(leadingBma.ssfTargetRate)} TG
                </p>
              </div>
              <div className="insight danger">
                <span>02</span>
                <p>
                  <strong>{mostMissingBma.bma}</strong>{" "}
                  {areaFilter === "ทั้งหมด" ? "ต้องเร่งติดตามมากที่สุด" : "มีสาขาที่ยังต้องติดตาม"}
                  {" "}— SG ยังไม่ลงข้อมูล {mostMissingBma.sgMissing} และ Samsung{" "}
                  {mostMissingBma.ssfMissing} สาขา
                </p>
              </div>
              <div className="insight warning">
                <span>03</span>
                <p>มี <strong>{pendingUse} รายการ</strong> ที่อนุมัติวงเงินแล้วแต่ยังไม่ Used ควรติดตามเพื่อปิดการขาย</p>
              </div>
              <div className="insight info">
                <span>04</span>
                <p>SG ยกเว้นการรายงาน 2 สาขา: <strong>80100484 และ 80100836</strong> เนื่องจากถูกระงับการใช้งาน</p>
              </div>
            </div>
            <button className="button copy-summary" onClick={() => copyText("summary")}>
              {copied === "summary" ? "✓ คัดลอกแล้ว" : "คัดลอกสรุปเพื่อส่งรายงาน"}
            </button>
          </article>
        </div>

        <section className="table-section">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow dark">MISSING SUBMISSION</span>
              <h2>สาขาที่ยังไม่ลงข้อมูล</h2>
              <p>แสดงแยกตาม Finance • SG ไม่นับ 80100484 และ 80100836 เนื่องจากระงับการใช้งาน</p>
            </div>
            <div className="missing-summary">
              <span className="count-badge sg-count">SG {total.sgMissing}</span>
              <span className="count-badge ssf-count">Samsung {total.ssfMissing}</span>
            </div>
          </div>
          <div className="missing-grid">
            {missingRows.map(({ row, missingSg, missingSsf }) => (
              <article className="missing-card" key={row.code}>
                <span>{row.bma}</span>
                <div>
                  <strong>{row.branch}</strong>
                  <small>{row.code} • {row.type}</small>
                </div>
                <div className="missing-finance-tags">
                  {missingSg && <i className="missing-sg">SG</i>}
                  {missingSsf && <i className="missing-ssf">SSF</i>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="table-section branch-section">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow dark">COPY-READY REPORT</span>
              <h2>สรุปยอดรายสาขา</h2>
              <p>
                {areaFilter === "ทั้งหมด"
                  ? "แสดงเฉพาะสาขาที่ลงข้อมูลแล้ว • TG และ % TG แยก SG / Samsung Finance"
                  : `แสดงครบ ${visibleRows.length} สาขาที่ลงข้อมูลแล้วใน ${areaLabel} • เรียงยาวต่อเนื่องสำหรับ Capture`}
              </p>
            </div>
            <button className="button copy-table" onClick={() => copyText("table")}>
              {copied === "table" ? "✓ คัดลอกแล้ว" : `คัดลอก ${visibleRows.length} แถว`}
            </button>
          </div>
          <div className="filters">
            <label className="search-box">
              <span>⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหารหัส ชื่อสาขา หรือผู้ลงข้อมูล"
              />
            </label>
            <select value={areaFilter} onChange={(event) => selectArea(event.target.value)}>
              {["ทั้งหมด", ...BMA_AREAS].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className={`table-wrap ${areaFilter === "ทั้งหมด" ? "" : "table-wrap-expanded"}`}>
            <table>
              <thead>
                <tr>
                  <th>พื้นที่ / สาขา</th>
                  <th className="sg-head">SG TG</th>
                  <th className="sg-head">SG<br /><small>เสียบ / อนุมัติ / Used</small></th>
                  <th className="sg-head">SG % TG</th>
                  <th className="ssf-head">Samsung TG</th>
                  <th className="ssf-head">Samsung<br /><small>เสียบ / อนุมัติ / Used</small></th>
                  <th className="ssf-head">Samsung % TG</th>
                  <th>ชื่อผู้ลงข้อมูล</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => {
                  const isSgExempt = !sgExpected(row);
                  const sgRate = row.target ? (row.sg / row.target) * 100 : 0;
                  const ssfRate = row.target ? (row.ssf / row.target) * 100 : 0;
                  return (
                    <tr key={row.code}>
                      <td>
                        <span className="area-label">{row.bma}</span>
                        <strong>{row.branch}</strong>
                        <small>{row.code} • {row.type}</small>
                      </td>
                      <td>{isSgExempt ? <span className="exempt-pill">ยกเว้น</span> : row.target}</td>
                      <td className="finance-values">
                        {isSgExempt
                          ? <span className="exempt-values">ระงับใช้งาน</span>
                          : <><strong>{row.sg}</strong><span>{row.sgApproved}</span><span>{row.sgUsed}</span></>}
                      </td>
                      <td>
                        {isSgExempt ? "—" : (
                          <span className={`rate-pill ${sgRate >= 100 ? "great" : sgRate >= 50 ? "mid" : "low"}`}>
                            {percent(sgRate)}
                          </span>
                        )}
                      </td>
                      <td>{row.target}</td>
                      <td className="finance-values">
                        <strong>{row.ssf}</strong><span>{row.ssfApproved}</span><span>{row.ssfUsed}</span>
                      </td>
                      <td>
                        <span className={`rate-pill ${ssfRate >= 100 ? "great" : ssfRate >= 50 ? "mid" : "low"}`}>
                          {percent(ssfRate)}
                        </span>
                      </td>
                      <td className={!row.reporter ? "data-warning" : ""}>
                        {row.reporter || "ไม่ระบุชื่อ"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <footer>
          <div>
            <strong>TRUE SHOP FINANCE DAILY INFOGRAPHIC</strong>
            <span>SG Finance + Samsung Finance • BMA 1–5</span>
          </div>
          <p>
            “อนุมัติ” = ลูกค้ายื่นสมัครและได้รับอนุมัติวงเงินสินเชื่อ • “Used” =
            ลูกค้าใช้สิทธิผ่อนซื้อเครื่องแล้ว
          </p>
        </footer>
      </section>
    </main>
  );
}
