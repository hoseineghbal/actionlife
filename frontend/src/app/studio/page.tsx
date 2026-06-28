"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  getStudioFiles,
  createStudioFile,
  deleteStudioFile,
  uploadFile,
} from "@/lib/api";
import type { StudioFile } from "@/types";

type RecordMode = "video" | "audio";
type StudioStep = "idle" | "setup" | "recording" | "preview" | "edit" | "uploading";

export default function StudioPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [recordMode, setRecordMode] = useState<RecordMode>("video");
  const [step, setStep] = useState<StudioStep>("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState("");
  const [recordTitle, setRecordTitle] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recordingTimer, setRecordingTimer] = useState<any>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("");
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("");
  const [permissionError, setPermissionError] = useState("");

  // edit state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [bgMusicFile, setBgMusicFile] = useState<File | null>(null);
  const [bgMusicUrl, setBgMusicUrl] = useState("");
  const [bgMusicGain, setBgMusicGain] = useState(0.3);

  // library state
  const [libraryFiles, setLibraryFiles] = useState<StudioFile[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [libraryTab, setLibraryTab] = useState<"all" | "video" | "audio">("all");

  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : "";

  useEffect(() => {
    if (typeof window !== "undefined" && !token) {
      router.push("/auth/login");
    }
  }, [token, router]);

  const loadLibrary = useCallback(async () => {
    if (!token) return;
    setLoadingLibrary(true);
    try {
      const type = libraryTab === "all" ? undefined : libraryTab;
      const files = await getStudioFiles(token, type);
      setLibraryFiles(files);
    } catch {
      // ignore
    } finally {
      setLoadingLibrary(false);
    }
  }, [token, libraryTab]);

  useEffect(() => {
    if (token) loadLibrary();
  }, [token, loadLibrary]);

  useEffect(() => {
    if (step === "idle") {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          setAudioDevices(devices.filter((d) => d.kind === "audioinput"));
          setVideoDevices(devices.filter((d) => d.kind === "videoinput"));
        })
        .catch(() => {});
    }
  }, [step]);

  useEffect(() => {
    return () => {
      if (recordingTimer) clearInterval(recordingTimer);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset to idle
  const resetAll = () => {
    if (recorder && recorder.state !== "inactive") recorder.stop();
    if (recordingTimer) clearInterval(recordingTimer);
    if (stream) { stream.getTracks().forEach((t) => t.stop()); setStream(null); }
    if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
    setRecorder(null);
    setRecordedBlob(null);
    setRecordedUrl("");
    setRecordTitle("");
    setTrimStart(0);
    setTrimEnd(100);
    setBgMusicFile(null);
    setBgMusicUrl("");
    setStep("idle");
  };

  const startCamera = async () => {
    setPermissionError("");
    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedAudioDevice
          ? { deviceId: { exact: selectedAudioDevice } }
          : true,
        video:
          recordMode === "video"
            ? { width: { ideal: 1280 }, height: { ideal: 720 }, ...(selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : {}) }
            : false,
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoPreviewRef.current && recordMode === "video") {
        videoPreviewRef.current.srcObject = mediaStream;
      }
      setStep("setup");
    } catch (err: unknown) {
      const e = err as Error;
      setPermissionError(
        e.message.includes("NotAllowed")
          ? "لطفا دسترسی دوربین و میکروفن را تایید کنید"
          : e.message.includes("NotFound")
          ? "دوربین یا میکروفن یافت نشد"
          : "خطا در دسترسی به دوربین/میکروفن",
      );
    }
  };

  const startRecording = () => {
    if (!stream) return;
    if (recordingTimer) clearInterval(recordingTimer);
    setRecordingTime(0);
    const chunks: Blob[] = [];
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "video/webm";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mr = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 1_500_000 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mr.ondataavailable = (e: any) => { if (e.data?.size > 0) chunks.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunks, { type: recordMode === "video" ? "video/webm" : "audio/webm" });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
      setStep("preview");
    };
    mr.start(250);
    setRecorder(mr);
    setStep("recording");
    const timer = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    setRecordingTimer(timer);
  };

  const stopRecording = () => {
    if (recorder && recorder.state !== "inactive") recorder.stop();
    if (recordingTimer) clearInterval(recordingTimer);
    if (stream) { stream.getTracks().forEach((t) => t.stop()); setStream(null); }
  };

  const togglePause = () => {
    if (!recorder) return;
    if (recorder.state === "recording") {
      recorder.pause();
      setIsPaused(true);
      if (recordingTimer) clearInterval(recordingTimer);
    } else if (recorder.state === "paused") {
      recorder.resume();
      setIsPaused(false);
      const timer = setInterval(() => setRecordingTime((t) => t + 1), 1000);
      setRecordingTimer(timer);
    }
  };

  const handleBgMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBgMusicFile(file);
      if (bgMusicUrl) URL.revokeObjectURL(bgMusicUrl);
      setBgMusicUrl(URL.createObjectURL(file));
    }
  };

  const processAndUpload = async () => {
    if (!recordedBlob || !token) return;
    setStep("uploading");
    try {
      let finalBlob = recordedBlob;
      if (recordMode === "audio" && (trimStart > 0 || trimEnd < 100 || bgMusicFile)) {
        finalBlob = await processAudioWithTrimAndBg(recordedBlob, trimStart, trimEnd, bgMusicFile, bgMusicGain);
      }
      const title = recordTitle.trim() || `ضبط ${new Date().toLocaleDateString("fa-IR")}`;
      const file = new File([finalBlob], `${title}.${recordMode === "video" ? "webm" : "wav"}`, {
        type: recordMode === "audio" ? "audio/wav" : "video/webm",
      });
      const result = await uploadFile(token, file, "studio");
      await createStudioFile(token, {
        url: result.url, title, type: recordMode,
        mimeType: result.mimeType, size: result.size,
      });
      resetAll();
      loadLibrary();
      alert("فایل با موفقیت ذخیره شد");
    } catch (err: unknown) {
      alert((err as Error).message || "خطا در ذخیره فایل");
      setStep("edit");
    }
  };

  const handleDeleteLibrary = async (id: string) => {
    if (!token || !confirm("آیا از حذف این فایل مطمئن هستید؟")) return;
    try { await deleteStudioFile(token, id); loadLibrary(); } catch { alert("خطا در حذف فایل"); }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
      </div>
    );
  }

  if (!user.hasStore && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-dark-light mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🎬</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">دسترسی محدود</h1>
          <p className="text-gray-custom mb-4">برای استفاده از استودیو باید دسترسی فروشگاه داشته باشید.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">استودیو <span className="text-accent">اکشن</span></h1>
            <p className="text-gray-custom mt-1">ضبط و ویرایش ویدیو و صدا برای محصولات فروشگاه</p>
          </div>
          <div className="flex gap-2">
            <Link href="/store/add" className="px-4 py-2 bg-dark-light border border-white/10 text-gray-custom hover:text-white rounded-xl text-sm transition-colors">افزودن محصول</Link>
            <Link href="/store/my-products" className="px-4 py-2 bg-dark-light border border-white/10 text-gray-custom hover:text-white rounded-xl text-sm transition-colors">محصولات من</Link>
          </div>
        </div>

        {/* ---------- IDLE: Mode selection + start ---------- */}
        {step === "idle" && (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-12 text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-accent/10 mx-auto mb-6 flex items-center justify-center">
              <span className="text-5xl">🎬</span>
            </div>
            <div className="flex gap-3 mb-6 justify-center">
              <button onClick={() => setRecordMode("video")}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${recordMode === "video" ? "bg-accent text-white" : "bg-dark border border-white/10 text-gray-custom"}`}>
                🎥 ویدیو
              </button>
              <button onClick={() => setRecordMode("audio")}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${recordMode === "audio" ? "bg-accent text-white" : "bg-dark border border-white/10 text-gray-custom"}`}>
                🎙️ صدا
              </button>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">ضبط {recordMode === "video" ? "ویدیو" : "صدا"} جدید</h2>
            <p className="text-gray-custom mb-6 max-w-md mx-auto">
              {recordMode === "video" ? "با دوربین خود ویدیو ضبط کنید، ویرایش کنید و برای محصولاتتان استفاده کنید" : "صدای خود را ضبط کنید، آهنگ پس‌زمینه اضافه کنید و به محصولاتتان متصل کنید"}
            </p>
            {permissionError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-4">{permissionError}</div>
            )}
            {/* Device selectors */}
            {videoDevices.length > 0 && recordMode === "video" && (
              <div className="mb-3 max-w-xs mx-auto">
                <select value={selectedVideoDevice} onChange={(e) => setSelectedVideoDevice(e.target.value)}
                  className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-accent/50">
                  <option value="">دوربین پیش‌فرض</option>
                  {videoDevices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || `دوربین ${d.deviceId.slice(0, 8)}`}</option>)}
                </select>
              </div>
            )}
            {audioDevices.length > 0 && (
              <div className="mb-3 max-w-xs mx-auto">
                <select value={selectedAudioDevice} onChange={(e) => setSelectedAudioDevice(e.target.value)}
                  className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-accent/50">
                  <option value="">میکروفن پیش‌فرض</option>
                  {audioDevices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || `میکروفن ${d.deviceId.slice(0, 8)}`}</option>)}
                </select>
              </div>
            )}
            <button onClick={startCamera}
              className="px-8 py-3 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-all">
              شروع ضبط
            </button>
          </div>
        )}

        {/* ---------- SETUP: Camera preview ---------- */}
        {step === "setup" && stream && (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-6 mb-8">
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video mb-4">
              {recordMode === "video" ? (
                <video ref={videoPreviewRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-accent/20 mx-auto flex items-center justify-center mb-3">
                      <span className="text-4xl animate-pulse">🎙️</span>
                    </div>
                    <p className="text-gray-custom">میکروفن آماده ضبط است</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={startRecording}
                className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                <span className="w-3 h-3 bg-white rounded-full" /> شروع ضبط
              </button>
              <button onClick={resetAll}
                className="px-4 py-4 bg-dark border border-white/10 text-gray-custom hover:text-white rounded-xl transition-colors">انصراف</button>
            </div>
          </div>
        )}

        {/* ---------- RECORDING ---------- */}
        {step === "recording" && (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-6 mb-8">
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video mb-4">
              {recordMode === "video" ? (
                <video ref={videoPreviewRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-red-600/30 mx-auto flex items-center justify-center mb-3 animate-pulse">
                      <span className="text-4xl">🎙️</span>
                    </div>
                    <div className="inline-block px-3 py-1 bg-red-600/20 border border-red-600/30 rounded-full">
                      <span className="text-red-400 font-mono text-lg">{formatTime(recordingTime)}</span>
                    </div>
                    {isPaused && <p className="text-yellow-400 text-sm mt-2">ضبط متوقف شده</p>}
                  </div>
                </div>
              )}
            </div>
            {recordMode === "video" && (
              <div className="text-center mb-4">
                <span className="text-red-400 font-mono text-lg">{formatTime(recordingTime)}</span>
                {isPaused && <span className="text-yellow-400 text-sm mr-2">(مکث)</span>}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button onClick={togglePause}
                className={`px-6 py-3 font-bold rounded-xl transition-all ${isPaused ? "bg-green-600 hover:bg-green-700 text-white" : "bg-yellow-600 hover:bg-yellow-700 text-white"}`}>
                {isPaused ? "ادامه ضبط" : "مکث"}
              </button>
              <button onClick={stopRecording}
                className="px-6 py-3 bg-accent hover:bg-accent/90 text-dark font-bold rounded-xl transition-all">پایان ضبط</button>
              <button onClick={resetAll}
                className="px-6 py-3 bg-dark border border-white/10 text-gray-custom hover:text-white rounded-xl transition-colors">لغو</button>
            </div>
          </div>
        )}

        {/* ---------- PREVIEW ---------- */}
        {step === "preview" && recordedUrl && (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4">پیش‌نمایش</h2>
            <div className="relative bg-black rounded-xl overflow-hidden mb-4">
              {recordMode === "video" ? (
                <video src={recordedUrl} controls className="w-full max-h-[500px] object-contain" />
              ) : (
                <div className="p-8 flex flex-col items-center"><audio src={recordedUrl} controls className="w-full max-w-md" /></div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep("edit")}
                className="flex-1 py-4 bg-accent hover:bg-accent/90 text-dark font-bold rounded-xl transition-all">ادامه ویرایش</button>
              <button onClick={resetAll}
                className="px-6 py-4 bg-dark border border-white/10 text-gray-custom hover:text-white rounded-xl transition-colors">ضبط دوباره</button>
            </div>
          </div>
        )}

        {/* ---------- EDIT ---------- */}
        {step === "edit" && (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-6">ویرایش {recordMode === "video" ? "ویدیو" : "صدا"}</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-custom mb-2">عنوان فایل</label>
                <input type="text" value={recordTitle} onChange={(e) => setRecordTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
                  placeholder="مثلا: معرفی محصول" />
              </div>
              <div>
                <label className="block text-sm text-gray-custom mb-2">برش (Trim)</label>
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-custom mb-1">شروع (%)</label>
                    <input type="range" min={0} max={trimEnd - 1} value={trimStart}
                      onChange={(e) => setTrimStart(Number(e.target.value))} className="w-full accent-accent" />
                    <span className="text-gray-custom text-xs">{trimStart}%</span>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-custom mb-1">پایان (%)</label>
                    <input type="range" min={trimStart + 1} max={100} value={trimEnd}
                      onChange={(e) => setTrimEnd(Number(e.target.value))} className="w-full accent-accent" />
                    <span className="text-gray-custom text-xs">{trimEnd}%</span>
                  </div>
                </div>
              </div>
              {recordMode === "audio" && (
                <div className="bg-dark rounded-xl p-4 border border-white/5">
                  <label className="block text-sm text-gray-custom mb-2">آهنگ پس‌زمینه</label>
                  <input type="file" accept="audio/*" onChange={handleBgMusicChange}
                    className="block w-full text-sm text-gray-custom file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-accent file:text-white hover:file:bg-accent/90" />
                  {bgMusicUrl && (
                    <div className="mt-3 space-y-3">
                      <audio src={bgMusicUrl} controls className="w-full max-w-md" />
                      <div>
                        <label className="block text-xs text-gray-custom mb-1">صدای پس‌زمینه: {Math.round(bgMusicGain * 100)}%</label>
                        <input type="range" min={0} max={1} step={0.05} value={bgMusicGain}
                          onChange={(e) => setBgMusicGain(Number(e.target.value))} className="w-full max-w-xs accent-accent" />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={processAndUpload}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all">آپلود و ذخیره</button>
                <button onClick={() => setStep("preview")}
                  className="px-6 py-4 bg-dark border border-white/10 text-gray-custom hover:text-white rounded-xl transition-colors">بازگشت</button>
              </div>
            </div>
          </div>
        )}

        {/* ---------- UPLOADING ---------- */}
        {step === "uploading" && (
          <div className="bg-dark-light border border-white/5 rounded-2xl p-12 text-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4" />
            <p className="text-white text-lg">در حال آپلود و پردازش...</p>
            <p className="text-gray-custom text-sm mt-1">لطفا صبر کنید</p>
          </div>
        )}

        {/* ---------- LIBRARY ---------- */}
        <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">کتابخانه استودیو</h2>
            <div className="flex gap-2">
              {(["all", "video", "audio"] as const).map((tab) => (
                <button key={tab} onClick={() => setLibraryTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${libraryTab === tab ? "bg-accent text-white" : "bg-dark text-gray-custom hover:text-white"}`}>
                  {tab === "all" ? "همه" : tab === "video" ? "ویدیو" : "صدا"}
                </button>
              ))}
            </div>
          </div>
          {loadingLibrary ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" /></div>
          ) : libraryFiles.length === 0 ? (
            <p className="text-gray-custom text-center py-8">هنوز فایلی در کتابخانه ندارید</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {libraryFiles.map((file) => (
                <div key={file._id} className="bg-dark rounded-xl p-4 border border-white/5 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{file.type === "video" ? "🎥" : "🎙️"}</span>
                      <div>
                        <h3 className="text-white text-sm font-medium line-clamp-1">{file.title}</h3>
                        <p className="text-gray-custom text-xs">{file.type === "video" ? "ویدیو" : "صدا"}{file.isEdited && " (ویرایش شده)"}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteLibrary(file._id)}
                      className="text-gray-custom hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-sm">🗑️</button>
                  </div>
                  {file.type === "video" ? (
                    <video src={file.url} controls className="w-full aspect-video object-cover rounded-lg bg-black" />
                  ) : (
                    <audio src={file.url} controls className="w-full" />
                  )}
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-custom">
                    <span>{new Date(file.createdAt).toLocaleDateString("fa-IR")}</span>
                    {file.size > 0 && <span>{file.size > 1_000_000 ? `${(file.size / 1_000_000).toFixed(1)} MB` : `${(file.size / 1000).toFixed(0)} KB`}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Audio processing helpers ---
async function processAudioWithTrimAndBg(
  blob: Blob, trimStartPercent: number, trimEndPercent: number,
  bgMusicFile: File | null, bgGain: number,
): Promise<Blob> {
  const audioCtx = new AudioContext();
  const arrayBuffer = await blob.arrayBuffer();
  const mainBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const totalSamples = mainBuffer.length;
  const startSample = Math.floor((trimStartPercent / 100) * totalSamples);
  const endSample = Math.floor((trimEndPercent / 100) * totalSamples);
  const trimLength = endSample - startSample;

  const offlineCtx = new OfflineAudioContext(mainBuffer.numberOfChannels, trimLength, mainBuffer.sampleRate);
  const mainSource = offlineCtx.createBufferSource();
  const trimmedBuffer = offlineCtx.createBuffer(mainBuffer.numberOfChannels, trimLength, mainBuffer.sampleRate);
  for (let ch = 0; ch < mainBuffer.numberOfChannels; ch++) {
    trimmedBuffer.copyToChannel(mainBuffer.getChannelData(ch).slice(startSample, endSample), ch);
  }
  mainSource.buffer = trimmedBuffer;
  mainSource.connect(offlineCtx.destination);

  if (bgMusicFile) {
    const bgBuffer = await audioCtx.decodeAudioData(await bgMusicFile.arrayBuffer());
    const bgSource = offlineCtx.createBufferSource();
    const bgLength = Math.min(bgBuffer.length, trimLength);
    const bgTrimmed = offlineCtx.createBuffer(bgBuffer.numberOfChannels, bgLength, bgBuffer.sampleRate);
    for (let ch = 0; ch < bgBuffer.numberOfChannels; ch++) {
      bgTrimmed.copyToChannel(bgBuffer.getChannelData(ch).slice(0, bgLength), ch);
    }
    bgSource.buffer = bgTrimmed;
    const gainNode = offlineCtx.createGain();
    gainNode.gain.value = bgGain;
    bgSource.connect(gainNode);
    gainNode.connect(offlineCtx.destination);
    bgSource.start(0);
  }

  mainSource.start(0);
  const rendered = await offlineCtx.startRendering();
  audioCtx.close();
  return audioBufferToWav(rendered);
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitsPerSample = 16;
  const dataLength = buffer.length * numChannels * (bitsPerSample / 8);
  const totalLength = 44 + dataLength;
  const wav = new ArrayBuffer(totalLength);
  const view = new DataView(wav);

  writeStr(view, 0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  writeStr(view, 8, "WAVE");
  writeStr(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(view, 36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([wav], { type: "audio/wav" });
}

function writeStr(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}
