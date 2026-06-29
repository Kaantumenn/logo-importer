"use client";

import Image from "next/image";
import {
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  FileSpreadsheet,
  Filter,
  Layers,
  Phone,
  PieChart,
  Search,
  Shield,
  ShoppingCart,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PwaInstallButton } from "@/components/pwa-install";
import { LOGO_FIRMS, LOGO_PERIOD } from "@/lib/logo-constants";
import { SimulationResult } from "@/types/simulation";

type CheckExcelRow = {
  vade: string;
  sehir: string;
  seriNo: string;
  borclu: string;
  tutar: number;
  banka: string;
  vergiNo: string;
  tarih: string;
  cariKod: string;
  muhasebeKodu: string;
};

type ActiveTab = "excel" | "logo";

const PAGE_SIZE = 10;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SimulationTable({
  title,
  fields,
}: {
  title: string;
  fields: { field: string; value: string | number | null; note?: string }[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#1e293b] bg-[#0b1220]">
      <div className="border-b border-[#1e293b] px-4 py-3">
        <h3 className="font-semibold text-slate-200">{title}</h3>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-[#0f172a] text-slate-400">
          <tr>
            <th className="px-4 py-2">Alan</th>
            <th className="px-4 py-2">Değer</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((item) => (
            <tr key={item.field} className="border-t border-[#1e293b]">
              <td className="px-4 py-2 font-mono text-slate-300">{item.field}</td>
              <td className="px-4 py-2">
                <span className="text-slate-100">{item.value ?? "—"}</span>
                {item.note && (
                  <span className="ml-2 text-xs text-amber-400">({item.note})</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-[#1e293b] bg-[#111827] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{sub}</p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [rows, setRows] = useState<CheckExcelRow[]>([]);
  const [validatedRows, setValidatedRows] = useState<any[]>([]);
  const [validating, setValidating] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("excel");
  const [selectedSimRow, setSelectedSimRow] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [firm, setFirm] = useState("760");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [importing, setImporting] = useState(false);

  const totalAmount = useMemo(() => {
    return rows.reduce((sum, row) => sum + Number(row.tutar || 0), 0);
  }, [rows]);

  const displayRows = validatedRows.length > 0 ? validatedRows : rows;

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return displayRows;

    return displayRows.filter((row) =>
      Object.values(row).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [displayRows, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const successRate = summary
    ? Math.round((summary.validRows / summary.totalRows) * 100)
    : 0;

  function resetValidation() {
    setValidatedRows([]);
    setSummary(null);
    setSimulation(null);
    setActiveTab("excel");
    setSelectedSimRow(0);
    setSearchQuery("");
    setCurrentPage(1);
  }

  function clearFile() {
    setFileName("");
    setFileSize(0);
    setRows([]);
    resetValidation();
  }

  async function processFile(file: File) {
    setLoading(true);
    setFileName(file.name);
    setFileSize(file.size);
    resetValidation();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/preview", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.ok) {
        alert(data.message || "Excel okunamadı");
        clearFile();
        return;
      }

      const parsedRows = data.rows || [];
      setRows(parsedRows);

      if (parsedRows.length === 0) {
        alert(
          "Excel okundu ancak satır bulunamadı. Sütun başlıklarını kontrol edin."
        );
      }
    } catch {
      alert("Excel yüklenirken hata oluştu. Doğru porttan açtığınızdan emin olun.");
      clearFile();
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  }

  async function runSimulation(validRows: any[]) {
    if (validRows.filter((row) => row.isValid).length === 0) {
      setSimulation(null);
      return;
    }

    setSimulating(true);

    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firm, rows: validRows }),
      });

      const data = await response.json();

      if (!data.ok) {
        alert(data.message || "Simülasyon başarısız");
        return;
      }

      setSimulation(data);
      setSelectedSimRow(0);
    } catch {
      alert("Simülasyon sırasında hata oluştu.");
    } finally {
      setSimulating(false);
    }
  }

  async function handleValidate() {
    if (rows.length === 0) return;

    setValidating(true);
    resetValidation();

    const response = await fetch("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firm, rows }),
    });

    const data = await response.json();

    if (!data.ok) {
      alert(data.message || "Doğrulama başarısız");
      setValidating(false);
      return;
    }

    const nextValidatedRows = data.rows || [];
    setValidatedRows(nextValidatedRows);
    setSummary(data.summary);
    setValidating(false);

    if (data.summary?.validRows > 0) {
      await runSimulation(nextValidatedRows);
    }
  }

  async function handleImport() {
    const validCount = validatedRows.filter((row) => row.isValid).length;
    if (validCount === 0) return;

    const confirmed = confirm(
      `${validCount} geçerli satır Logo'ya aktarılacak. Devam edilsin mi?`
    );
    if (!confirmed) return;

    setImporting(true);

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firm,
          period: LOGO_PERIOD,
          rows: validatedRows,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        alert(data.message || "Aktarım başarısız");
        return;
      }

      alert(data.message);
    } catch {
      alert("Aktarım sırasında hata oluştu.");
    } finally {
      setImporting(false);
    }
  }

  const currentSimRow = simulation?.rows[selectedSimRow];
  const pageStart = filteredRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, filteredRows.length);

  return (
    <main className="min-h-screen bg-[#0b1220] text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Image
              src="/as_cimento_logo_white.png"
              alt="AS Çimento"
              width={4688}
              height={4688}
              priority
              className="h-28 w-auto shrink-0 object-contain sm:h-32"
            />
            <div>
              <p className="text-sm text-slate-400">Logo Importer</p>
              <h1 className="text-3xl font-bold text-white">Çek Aktarım</h1>
              <p className="mt-2 max-w-xl text-slate-400">
                Excel dosyasını yükle, doğrula ve Logo kayıtlarını simüle et.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <PwaInstallButton />
            <button
              type="button"
              onClick={() => setShowHelp(true)}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-[#1e293b] bg-[#111827] px-4 py-2 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              <CircleHelp className="h-4 w-4" />
              Yardım
            </button>
          </div>
        </header>

        {showHelp && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowHelp(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-[#1e293b] bg-[#111827] p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Yardım & İletişim</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Teknik destek veya sorularınız için iletişime geçin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHelp(false)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-[#1e293b] hover:text-white"
                  aria-label="Kapat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">İletişim</p>
                    <p className="font-medium text-white">Mahmut Kaan Tümen</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Phone className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Telefon</p>
                    <a
                      href="tel:+905333128864"
                      className="font-medium text-white transition hover:text-blue-400"
                    >
                      0 (533) 312 88 64
                    </a>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="mt-6 w-full rounded-xl bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-500"
              >
                Kapat
              </button>
            </div>
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-[#1e293b] bg-[#111827] p-6">
          <div className="mb-5">
            <label htmlFor="firm" className="mb-2 block text-sm font-medium text-slate-300">
              Firma
            </label>
            <div className="relative max-w-md">
              <select
                id="firm"
                value={firm}
                onChange={(e) => {
                  setFirm(e.target.value);
                  resetValidation();
                }}
                className="w-full appearance-none rounded-xl border border-[#334155] bg-[#0b1220] px-4 py-2.5 pr-10 text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {LOGO_FIRMS.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} - {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <input
            id="excel-upload"
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleFileChange}
            className="sr-only"
          />

          <label
            htmlFor="excel-upload"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 transition ${
              isDragging
                ? "border-blue-500 bg-blue-500/5"
                : "border-[#334155] bg-[#0b1220] hover:border-blue-500/60 hover:bg-[#0f172a]"
            }`}
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1e293b]">
              <Upload className="h-7 w-7 text-blue-400" />
            </div>
            <span className="text-lg font-semibold text-white">Excel dosyası seç</span>
            <span className="mt-1 text-sm text-slate-400">
              .xlsx veya .xls desteklenir — sürükleyip bırakabilirsiniz
            </span>
          </label>

          {loading && (
            <p className="mt-4 text-sm text-blue-400">Excel okunuyor...</p>
          )}

          {fileName && !loading && (
            <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-emerald-500/40 bg-emerald-500/5 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{fileName}</p>
                  <p className="flex items-center gap-1.5 text-sm text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Dosya yüklendi · {formatFileSize(fileSize)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-[#1e293b] hover:text-red-400"
                aria-label="Dosyayı kaldır"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {rows.length > 0 && (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={handleValidate}
                disabled={validating || simulating || importing}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
              >
                {validating
                  ? "Doğrulanıyor..."
                  : simulating
                    ? "Simüle ediliyor..."
                    : "Doğrula"}
                <ChevronDown className="h-4 w-4 opacity-80" />
              </button>

              {validatedRows.some((row) => row.isValid) && (
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing || validating || simulating}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/10 px-6 py-3 font-semibold text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-50"
                >
                  {importing ? "Aktarılıyor..." : "Aktar"}
                </button>
              )}

              <p className="flex items-center gap-2 text-sm text-slate-400">
                <Shield className="h-4 w-4 shrink-0 text-blue-400" />
                Doğrulama işlemi, verilerin doğruluğunu kontrol eder
              </p>
            </div>
          )}
        </section>

        {rows.length > 0 && (
          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Toplam Satır"
              value={`${rows.length} Kayıt`}
              sub="Yüklenen satır sayısı"
              icon={ShoppingCart}
              iconClassName="bg-blue-500/10 text-blue-400"
            />
            <StatCard
              label="Toplam Tutar"
              value={totalAmount.toLocaleString("tr-TR", {
                style: "currency",
                currency: "TRY",
              })}
              sub="Genel Toplam"
              icon={Layers}
              iconClassName="bg-violet-500/10 text-violet-400"
            />
            <StatCard
              label="Durum"
              value={
                summary
                  ? `${summary.validRows} geçerli, ${summary.invalidRows} hatalı`
                  : "Doğrulama bekleniyor"
              }
              sub={summary ? "Doğrulama tamamlandı" : "Henüz doğrulanmadı"}
              icon={CheckCircle2}
              iconClassName="bg-emerald-500/10 text-emerald-400"
            />
            <StatCard
              label="Başarı Oranı"
              value={summary ? `%${successRate} Başarılı` : "—"}
              sub={summary ? "Geçerli satır oranı" : "Doğrulama sonrası görünür"}
              icon={PieChart}
              iconClassName="bg-cyan-500/10 text-cyan-400"
            />
          </section>
        )}

        {rows.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-[#1e293b] bg-[#111827]">
            <div className="border-b border-[#1e293b] px-5 pt-4">
              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("excel")}
                  className={`border-b-2 pb-3 text-sm font-medium transition ${
                    activeTab === "excel"
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Excel Önizleme
                </button>
                {simulation && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("logo")}
                    className={`border-b-2 pb-3 text-sm font-medium transition ${
                      activeTab === "logo"
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Logo Simülasyonu
                  </button>
                )}
              </div>
            </div>

            {activeTab === "excel" ? (
              <>
                <div className="flex flex-col gap-4 border-b border-[#1e293b] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Excel Önizleme</h2>
                    <p className="text-sm text-slate-400">İlk 100 kayıt gösteriliyor</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Ara..."
                        className="w-full rounded-xl border border-[#334155] bg-[#0b1220] py-2 pl-9 pr-4 text-sm text-slate-100 outline-none focus:border-blue-500 sm:w-56"
                      />
                    </div>
                    <button
                      type="button"
                      className="rounded-xl border border-[#334155] bg-[#0b1220] p-2.5 text-slate-400 transition hover:text-white"
                      aria-label="Filtrele"
                    >
                      <Filter className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="overflow-auto">
                  <table className="w-full min-w-[1200px] text-left text-sm">
                    <thead className="bg-[#0b1220] text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Vade</th>
                        <th className="px-4 py-3 font-medium">Şehir</th>
                        <th className="px-4 py-3 font-medium">Seri No</th>
                        <th className="px-4 py-3 font-medium">Borçlu</th>
                        <th className="px-4 py-3 font-medium">Tutar</th>
                        <th className="px-4 py-3 font-medium">Banka</th>
                        <th className="px-4 py-3 font-medium">Vergi No</th>
                        <th className="px-4 py-3 font-medium">Tarih</th>
                        <th className="px-4 py-3 font-medium">Cari Kod</th>
                        <th className="px-4 py-3 font-medium">Muhasebe Kodu</th>
                        <th className="px-4 py-3 font-medium">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRows.map((row, index) => (
                        <tr
                          key={index}
                          className="border-t border-[#1e293b] transition hover:bg-[#0f172a]"
                        >
                          <td className="px-4 py-3 text-slate-300">{row.vade}</td>
                          <td className="px-4 py-3 text-slate-300">{row.sehir}</td>
                          <td className="px-4 py-3 text-slate-300">{row.seriNo}</td>
                          <td className="px-4 py-3 text-slate-300">{row.borclu}</td>
                          <td className="px-4 py-3 text-slate-300">
                            {row.tutar.toLocaleString("tr-TR")}
                          </td>
                          <td className="px-4 py-3 text-slate-300">{row.banka}</td>
                          <td className="px-4 py-3 text-slate-300">{row.vergiNo}</td>
                          <td className="px-4 py-3 text-slate-300">{row.tarih}</td>
                          <td className="px-4 py-3 text-slate-300">{row.cariKod}</td>
                          <td className="px-4 py-3 text-slate-300">{row.muhasebeKodu}</td>
                          <td className="px-4 py-3">
                            {row.errors?.length > 0 ? (
                              <span className="inline-flex rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
                                Hatalı
                              </span>
                            ) : row.isValid ? (
                              <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                                Geçerli
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-medium text-slate-400">
                                Bekliyor
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#1e293b] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-400">
                    {filteredRows.length} kayıttan {pageStart} - {pageEnd} arası gösteriliyor
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="rounded-lg border border-[#334155] px-3 py-1.5 text-sm text-slate-300 disabled:opacity-40"
                    >
                      Önceki
                    </button>
                    <span className="px-2 text-sm text-slate-400">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="rounded-lg border border-[#334155] px-3 py-1.5 text-sm text-slate-300 disabled:opacity-40"
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
              </>
            ) : (
              simulation && (
                <div className="space-y-6 p-5">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Logo Simülasyonu</h2>
                    <p className="text-sm text-slate-400">
                      INSERT yapılmadan oluşturulacak kayıtlar. Dönem:{" "}
                      {simulation.period} — CSCARD → CSROLL → CSTRANS
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
                    <p className="font-medium">
                      Mevcut son değerler (LG_{firm}_{simulation.period}_*)
                    </p>
                    <div className="mt-2 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      <p>CSCARD MAX LOGICALREF: {simulation.sequences.maxCscard}</p>
                      <p>CSROLL MAX LOGICALREF: {simulation.sequences.maxCsroll}</p>
                      <p>CSTRANS MAX LOGICALREF: {simulation.sequences.maxCstrans}</p>
                      <p>Son ROLLNO: {simulation.sequences.lastRollno}</p>
                      <p>Son PORTFOYNO: {simulation.sequences.lastPortfoyno}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {simulation.rows.map((row, index) => (
                      <button
                        key={row.rowIndex}
                        type="button"
                        onClick={() => setSelectedSimRow(index)}
                        className={`rounded-lg px-3 py-2 text-sm transition ${
                          selectedSimRow === index
                            ? "bg-blue-600 text-white"
                            : "bg-[#0b1220] text-slate-300 hover:bg-[#1e293b]"
                        }`}
                      >
                        Satır {row.rowIndex}
                      </button>
                    ))}
                  </div>

                  {currentSimRow && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-[#1e293b] bg-[#0b1220] p-4">
                        <p className="text-sm text-slate-400">Seçili satır</p>
                        <p className="mt-1 font-medium text-white">
                          {currentSimRow.borclu} — {currentSimRow.seriNo}
                        </p>
                      </div>

                      <SimulationTable title="CSCARD" fields={currentSimRow.cscard} />
                      <SimulationTable title="CSROLL" fields={currentSimRow.csroll} />
                      <SimulationTable title="CSTRANS" fields={currentSimRow.cstrans} />
                    </div>
                  )}
                </div>
              )
            )}
          </section>
        )}
      </div>
    </main>
  );
}
