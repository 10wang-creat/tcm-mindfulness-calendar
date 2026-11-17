// ============================================================
// 音檔來源設定
// ============================================================
// 冥想語音與背景音床（mp3，共約 1 GB）不放在 repo / Vercel 部署裡，
// 改由 GitHub Releases 提供（tag: audio-v1）。
// 新增或更換音檔時：到 GitHub → Releases → audio-v1 → Edit → 上傳檔案即可，
// 檔名規則與 public/meditations 時期相同（meditation_NN_name_05m.mp3 等）。
//
// 本機開發若想用本地檔案，可在 .env.local 設定：
//   VITE_AUDIO_BASE=/meditations
// 並把 mp3 放回 public/meditations/（該資料夾已被 .gitignore 排除）。
export const AUDIO_BASE = (
  import.meta.env.VITE_AUDIO_BASE ||
  "https://github.com/10wang-creat/tcm-mindfulness-calendar/releases/download/audio-v1"
).replace(/\/$/, "");

export function audioUrl(filename) {
  return `${AUDIO_BASE}/${filename}`;
}
