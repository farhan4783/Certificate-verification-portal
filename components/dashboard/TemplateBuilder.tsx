"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, RefreshCw, Palette, Layers, Eye, Check } from "lucide-react";

interface TemplateBuilderProps {
  initialData?: {
    name?: string;
    presetStyle?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    showWatermark?: boolean;
    watermarkText?: string;
  };
  onSave?: (data: any) => Promise<void>;
  isSaving?: boolean;
}

const PRESET_STYLES = [
  { id: "classic-gold", name: "Classic Gold & Navy", desc: "Warm ivory canvas with navy borders & metallic gold accents", bg: "#fafae8", border: "#142d5c", accent: "#d4af37" },
  { id: "modern-cyber", name: "Modern Cyberpunk", desc: "Dark obsidian mode with neon cyan highlights & purple glow", bg: "#0d1424", border: "#0fb8ef", accent: "#a648fa" },
  { id: "executive-navy", name: "Executive Corporate", desc: "Crisp white background with royal blue headers & navy border", bg: "#f5f7fc", border: "#0d2659", accent: "#2e73da" },
  { id: "emerald-academic", name: "Emerald Academic Crest", desc: "Traditional parchment with deep emerald green & antique gold", bg: "#f7faf7", border: "#0a5238", accent: "#c7a633" },
  { id: "minimal-dark", name: "Minimalist Slate", desc: "Sleek dark gray palette with minimalist bright gold typography", bg: "#1a1a1f", border: "#40404d", accent: "#e6bf4d" },
];

export default function TemplateBuilder({ initialData, onSave, isSaving = false }: TemplateBuilderProps) {
  const [name, setName] = useState(initialData?.name || "Standard Executive Template");
  const [presetStyle, setPresetStyle] = useState(initialData?.presetStyle || "classic-gold");
  const [primaryColor, setPrimaryColor] = useState(initialData?.primaryColor || "#142d5c");
  const [secondaryColor, setSecondaryColor] = useState(initialData?.secondaryColor || "#142d5c");
  const [accentColor, setAccentColor] = useState(initialData?.accentColor || "#d4af37");
  const [showWatermark, setShowWatermark] = useState(initialData?.showWatermark ?? true);
  const [watermarkText, setWatermarkText] = useState(initialData?.watermarkText || "OFFICIAL VERIFIED CREDENTIAL • KODE TO CAREER");
  
  const [studentName, setStudentName] = useState("Alex Johnson");
  const [courseTitle, setCourseTitle] = useState("Full Stack Web Development Masterclass");
  const [trainerName, setTrainerName] = useState("Dr. Marcus Vance");
  const [language, setLanguage] = useState("en");

  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Update preset defaults when preset style changes
  const handlePresetSelect = (presetId: string) => {
    setPresetStyle(presetId);
    const selected = PRESET_STYLES.find((p) => p.id === presetId);
    if (selected) {
      setPrimaryColor(selected.border);
      setSecondaryColor(selected.border);
      setAccentColor(selected.accent);
    }
  };

  const generatePreview = async () => {
    setIsGeneratingPreview(true);
    try {
      const res = await fetch("/api/certificates/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          courseTitle,
          trainerName,
          language,
          presetStyle,
          primaryColor,
          secondaryColor,
          accentColor,
          showWatermark,
          watermarkText,
        }),
      });

      const data = await res.json();
      if (data.success && data.pdfUrl) {
        setPreviewPdfUrl(data.pdfUrl);
      }
    } catch (error) {
      console.error("Failed to generate preview:", error);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      generatePreview();
    }, 400);
    return () => clearTimeout(timer);
  }, [presetStyle, primaryColor, secondaryColor, accentColor, showWatermark, watermarkText, studentName, courseTitle, trainerName, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      await onSave({
        name,
        presetStyle,
        primaryColor,
        secondaryColor,
        accentColor,
        showWatermark,
        watermarkText,
        layoutJson: {
          presetStyle,
          primaryColor,
          secondaryColor,
          accentColor,
          showWatermark,
          watermarkText,
        },
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Form Panel */}
      <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <Palette className="h-5 w-5 text-amber-500" />
          <h2 className="font-bold text-lg text-slate-100">Visual Template Designer</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="e.g. Executive Gold 2026 Edition"
            />
          </div>

          {/* Preset Styles Cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Visual Preset Theme
            </label>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {PRESET_STYLES.map((style) => (
                <div
                  key={style.id}
                  onClick={() => handlePresetSelect(style.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    presetStyle === style.id
                      ? "bg-slate-800/80 border-amber-500/80 shadow-md shadow-amber-500/10"
                      : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg border flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: style.bg, borderColor: style.border, color: style.accent }}
                    >
                      KTC
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{style.name}</h4>
                      <p className="text-[10px] text-slate-400 leading-tight">{style.desc}</p>
                    </div>
                  </div>
                  {presetStyle === style.id && <Check className="h-4 w-4 text-amber-500 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Custom Color Overrides */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Primary Color
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-1.5">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-300">{primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Secondary Color
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-1.5">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-300">{secondaryColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Accent Gold
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-1.5">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-300">{accentColor}</span>
              </div>
            </div>
          </div>

          {/* Watermark & Security Settings */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Enable Security Background Watermark</span>
              <input
                type="checkbox"
                checked={showWatermark}
                onChange={(e) => setShowWatermark(e.target.checked)}
                className="h-4 w-4 rounded accent-amber-500"
              />
            </div>

            {showWatermark && (
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {/* Dummy Live Text Input Fields for Testing */}
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Sample Preview Data
              </span>
              <span className="text-[10px] text-slate-500">Live Preview Updates</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Sample Student</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Sample Trainer</label>
                <input
                  type="text"
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Sample Course Title</label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Save Certificate Template
            </button>
          </div>
        </form>
      </div>

      {/* Right Real-time PDF Live Canvas Preview */}
      <div className="lg:col-span-7 flex flex-col h-full">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col backdrop-blur-xl min-h-[500px]">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-200">Real-Time PDF Certificate Render</h3>
            </div>
            <button
              type="button"
              onClick={generatePreview}
              disabled={isGeneratingPreview}
              className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingPreview ? "animate-spin text-amber-500" : ""}`} />
              Refresh Preview
            </button>
          </div>

          <div className="flex-1 bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex items-center justify-center relative min-h-[420px]">
            {isGeneratingPreview && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center z-10 text-amber-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-xs font-mono">Rendering High-DPI Vector PDF...</span>
              </div>
            )}

            {previewPdfUrl ? (
              <iframe
                src={previewPdfUrl}
                className="w-full h-full min-h-[440px] rounded-lg border-0"
                title="Certificate PDF Live Preview"
              />
            ) : (
              <div className="text-center p-8 text-slate-500 space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500/40" />
                <p className="text-xs">Initializing canvas renderer...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
