#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
本草冥想 - 文字檔轉語音工具（edge-tts + ffmpeg）
================================================================================

用法：
    直接雙擊「轉語音.bat」即可（會處理「腳本」資料夾裡所有還沒轉的 txt）
    或手動：
        py 冥想轉語音.py                 # 轉全部（已存在成品的會跳過）
        py 冥想轉語音.py --force         # 全部重轉，覆蓋舊成品
        py 冥想轉語音.py --file meditation_01_renshen.txt   # 只轉指定一支

輸入：  冥想音檔工具/腳本/*.txt
輸出：  冥想音檔工具/成品/<同名>.mp3
背景音：冥想音檔工具/背景音樂/  裡的第一個 mp3（檔名以底線 _ 開頭的會略過）
        沒放任何音樂 → 只輸出純人聲

腳本 txt 格式：
    一行一句，句尾用 [停N] 標停頓秒數（N 可含小數，如 [停2.5]）。
    只想要一段純靜默，就單獨一行寫 [停20]。
    範例：
        歡迎來到人蔘觀想冥想。[停2]
        輕輕閉上眼睛，讓呼吸自然流動。[停4]
        [停18]
        慢慢地，準備好的時候，睜開眼睛。[停3]
================================================================================
"""

import asyncio
import subprocess
import sys
import os
import re
import shutil
import argparse
from pathlib import Path

try:
    import edge_tts
except ImportError:
    print("正在安裝 edge-tts ...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "edge-tts"])
    import edge_tts

# ============================================================================
# 設定（可自行修改）
# ============================================================================

VOICE = "zh-TW-HsiaoChenNeural"   # 台灣女聲・曉臻（與草本夜話 Podcast 同一個）
RATE  = "-20%"                    # 語速（約 0.8x）
PITCH = "+0Hz"                    # 音調

ADD_BGM     = True                # 是否混入背景音樂
BGM_FILE    = ""                  # 指定背景音樂檔；留空 = 自動抓「背景音樂」資料夾裡第一個 mp3
BGM_VOLUME  = 0.18                # 背景音樂相對音量（0~1，越小越輕）
LEAD_IN     = 3.0                 # 開頭純背景音樂秒數
TAIL        = 6.0                 # 結尾純背景音樂秒數
FADE_IN     = 2.0                 # 整體淡入秒數
FADE_OUT    = 6.0                 # 整體淡出秒數
LOUDNORM_I  = -16                 # 響度標準化目標（dBFS/LUFS）

# ffmpeg / ffprobe 執行檔。若不在系統 PATH，改成完整路徑，例如：
#   FFMPEG  = r"C:\ffmpeg\bin\ffmpeg.exe"
#   FFPROBE = r"C:\ffmpeg\bin\ffprobe.exe"
FFMPEG  = "ffmpeg"
FFPROBE = "ffprobe"

# ============================================================================
# 路徑
# ============================================================================

BASE      = Path(__file__).resolve().parent
INPUT_DIR = BASE / "腳本"
OUTPUT_DIR = BASE / "成品"
BGM_DIR   = BASE / "背景音樂"
TEMP_DIR  = BASE / "_暫存"


# ============================================================================
# 工具函式
# ============================================================================

def find_bgm():
    """決定背景音樂檔：優先用 BGM_FILE，否則抓背景音樂資料夾第一個非底線開頭的 mp3。"""
    if not ADD_BGM:
        return None
    if BGM_FILE:
        p = Path(BGM_FILE)
        if not p.is_absolute():
            p = BGM_DIR / BGM_FILE
        return p if p.exists() else None
    if not BGM_DIR.exists():
        return None
    cands = sorted(f for f in BGM_DIR.glob("*.mp3") if not f.name.startswith("_"))
    return cands[0] if cands else None


def parse_script(text):
    """解析腳本 → [(spoken_text, pause_sec, kind), ...]。
    kind = "fixed"（[停N]，固定小停頓）或 "rest"（[靜N]，可延展的深度留白）。"""
    segments = []
    # 同時抓 [停N] 與 [靜N]；兩個 capture group：標記字、秒數
    parts = re.split(r"\[\s*(停|靜)\s*([\d.]+)\s*\]", text)
    # parts = [句子, 標記, 秒數, 句子, 標記, 秒數, ...]
    i = 0
    while i < len(parts):
        spoken = re.sub(r"\s*\n\s*", " ", parts[i].strip()).strip()
        mark, pause, kind = None, 0.0, "fixed"
        if i + 2 < len(parts):
            mark = parts[i + 1]
            try:
                pause = float(parts[i + 2])
            except (ValueError, TypeError):
                pause = 0.0
            kind = "rest" if mark == "靜" else "fixed"
        if spoken or pause > 0:
            segments.append((spoken, pause, kind))
        i += 3
    return segments


async def tts(text, out_path):
    last = None
    for attempt in range(3):
        try:
            c = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
            await asyncio.wait_for(c.save(str(out_path)), timeout=30)
            if out_path.exists() and out_path.stat().st_size > 0:
                return
            last = "輸出為空檔"
        except asyncio.TimeoutError:
            last = "逾時（30 秒）"
        except Exception as e:  # noqa: BLE001
            last = str(e)
        print(f"      (第 {attempt + 1} 次未成功：{last}，重試中…)", flush=True)
        await asyncio.sleep(1.5)
    raise RuntimeError(f"TTS 連續三次失敗，可能是網路或防火牆擋住 edge-tts。最後錯誤：{last}")


def make_silence(sec, out_path):
    subprocess.run([
        FFMPEG, "-y", "-f", "lavfi",
        "-i", "anullsrc=r=24000:cl=mono",
        "-t", f"{sec}",
        "-c:a", "libmp3lame", "-q:a", "2",
        str(out_path)
    ], capture_output=True)


def concat(files, out_path, work_dir):
    listfile = work_dir / "filelist.txt"
    with open(listfile, "w", encoding="utf-8") as f:
        for fp in files:
            f.write(f"file '{fp.resolve().as_posix()}'\n")
    subprocess.run([
        FFMPEG, "-y", "-f", "concat", "-safe", "0",
        "-i", str(listfile),
        "-c:a", "libmp3lame", "-q:a", "2",
        str(out_path)
    ], capture_output=True)


def duration(path):
    r = subprocess.run([
        FFPROBE, "-v", "error", "-show_entries", "format=duration",
        "-of", "csv=p=0", str(path)
    ], capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except ValueError:
        return 0.0


def render_final(voice_path, out_path, bgm_path):
    """人聲 + 背景音樂 → 最終成品（含前後留白、淡入淡出、響度標準化）。"""
    vdur = duration(voice_path)

    if bgm_path and bgm_path.exists():
        total = LEAD_IN + vdur + TAIL
        out_start = max(0.0, total - FADE_OUT)
        lead_ms = int(LEAD_IN * 1000)
        fc = (
            f"[0]aformat=sample_rates=44100:channel_layouts=stereo,"
            f"adelay={lead_ms}:all=1,apad=pad_dur={TAIL}[v];"
            f"[1]aformat=sample_rates=44100:channel_layouts=stereo,"
            f"volume={BGM_VOLUME}[bt];"
            f"[v][bt]amix=inputs=2:duration=first:dropout_transition=0,"
            f"afade=t=in:st=0:d={FADE_IN},"
            f"afade=t=out:st={out_start}:d={FADE_OUT},"
            f"loudnorm=I={LOUDNORM_I}:TP=-1.5:LRA=11[out]"
        )
        cmd = [
            FFMPEG, "-y",
            "-i", str(voice_path),
            "-stream_loop", "-1", "-i", str(bgm_path),
            "-filter_complex", fc,
            "-map", "[out]",
            "-c:a", "libmp3lame", "-q:a", "2",
            str(out_path)
        ]
    else:
        total = LEAD_IN + vdur + TAIL
        out_start = max(0.0, total - FADE_OUT)
        lead_ms = int(LEAD_IN * 1000)
        af = (
            f"adelay={lead_ms}:all=1,apad=pad_dur={TAIL},"
            f"afade=t=in:st=0:d={FADE_IN},"
            f"afade=t=out:st={out_start}:d={FADE_OUT},"
            f"loudnorm=I={LOUDNORM_I}:TP=-1.5:LRA=11"
        )
        cmd = [
            FFMPEG, "-y", "-i", str(voice_path),
            "-af", af,
            "-c:a", "libmp3lame", "-q:a", "2",
            str(out_path)
        ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("    [ffmpeg 錯誤]", result.stderr[-400:])


async def build_one(txt_path, bgm_path, minutes_list):
    """把一份腳本轉成一或多個長度的成品。
    minutes_list 為 None 或空 → 產出原始長度單一檔；
    否則對每個分鐘數各產一檔，靠延展 [靜N] 留白撐到目標總長。"""
    name = txt_path.stem
    work = TEMP_DIR / name
    work.mkdir(parents=True, exist_ok=True)

    segments = parse_script(txt_path.read_text(encoding="utf-8"))

    # 先把每段人聲合成一次（多長度共用），並量測時長
    speech_files = {}   # index -> Path
    speech_total = 0.0
    spoken_idx = [i for i, (s, _p, _k) in enumerate(segments) if s]
    total_spoken = len(spoken_idx)
    done = 0
    for i, (spoken, _p, _k) in enumerate(segments):
        if spoken:
            done += 1
            print(f"      轉語音 {done}/{total_spoken} …", flush=True)
            f = work / f"seg_{i:03d}.mp3"
            await tts(spoken, f)
            speech_files[i] = f
            speech_total += duration(f)
    print("      語音完成，開始混音與輸出 …", flush=True)

    fixed_total = sum(p for _s, p, k in segments if k == "fixed")
    rest_base   = sum(p for _s, p, k in segments if k == "rest")
    rest_count  = sum(1 for _s, p, k in segments if k == "rest")

    def assemble(target_seconds, suffix):
        # 需要 voice 段（含各停頓）的總長 = target - 前後留白
        rests = {}  # index -> 這一版的留白秒數
        if target_seconds:
            want_voice = target_seconds - LEAD_IN - TAIL
            extra = want_voice - (speech_total + fixed_total + rest_base)
            per = max(0.0, extra) / rest_count if rest_count else 0.0
            for i, (_s, p, k) in enumerate(segments):
                if k == "rest":
                    rests[i] = p + per
        pieces = []
        for i, (spoken, pause, kind) in enumerate(segments):
            if spoken and i in speech_files:
                pieces.append(speech_files[i])
            sec = rests.get(i, pause) if kind == "rest" else pause
            if sec > 0:
                sil = work / f"sil_{suffix}_{i:03d}.mp3"
                make_silence(round(sec, 2), sil)
                pieces.append(sil)
        voice = work / f"voice_{suffix}.mp3"
        concat(pieces, voice, work)
        out = OUTPUT_DIR / f"{name}{('_' + suffix) if suffix else ''}.mp3"
        render_final(voice, out, bgm_path)
        return out

    outs = []
    if minutes_list:
        for m in minutes_list:
            outs.append(assemble(m * 60, f"{m:02d}m"))
    else:
        outs.append(assemble(None, ""))

    # 清暫存
    for f in work.glob("*"):
        try:
            f.unlink()
        except OSError:
            pass
    try:
        work.rmdir()
    except OSError:
        pass

    return outs


def resolve_tool(name):
    """找 ffmpeg / ffprobe：先看設定值與 PATH，再掃常見的 Windows 安裝位置。"""
    # 1. 設定值本身就是可用路徑
    if Path(name).exists():
        return name
    # 2. 系統 PATH
    p = shutil.which(name)
    if p:
        return p
    # 3. 常見安裝位置
    exe = name if name.lower().endswith(".exe") else name + ".exe"
    bases = [
        Path("C:/ffmpeg/bin"),
        Path(os.environ.get("ProgramFiles", "C:/Program Files")) / "ffmpeg" / "bin",
        Path("C:/ProgramData/chocolatey/bin"),
        Path(os.environ.get("USERPROFILE", "")) / "scoop" / "shims",
        Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft" / "WinGet" / "Packages",
    ]
    for base in bases:
        try:
            direct = base / exe
            if direct.exists():
                return str(direct)
            hits = list(base.rglob(exe)) if base.exists() else []
            if hits:
                return str(hits[0])
        except OSError:
            pass
    return None


def preflight():
    """檢查並定位 ffmpeg / ffprobe / edge-tts，回傳問題清單。"""
    global FFMPEG, FFPROBE
    problems = []
    fm = resolve_tool(FFMPEG)
    if fm:
        FFMPEG = fm
    else:
        problems.append("找不到 ffmpeg —— 請安裝 ffmpeg（winget install Gyan.FFmpeg）並加入系統 PATH，"
                        "或在 run_tts.py 頂端把 FFMPEG 設成 ffmpeg.exe 的完整路徑。")
    fp = resolve_tool(FFPROBE)
    if fp:
        FFPROBE = fp
    else:
        problems.append("找不到 ffprobe —— 通常和 ffmpeg 是同一包；同樣加入 PATH 或設定 FFPROBE。")
    try:
        import edge_tts  # noqa: F401
    except ImportError:
        problems.append("找不到 edge-tts —— 在命令列執行：pip install edge-tts")
    return problems


async def main():
    ap = argparse.ArgumentParser(description="本草冥想 文字轉語音")
    ap.add_argument("--force", action="store_true", help="全部重轉，覆蓋舊成品")
    ap.add_argument("--file", type=str, help="只轉指定的 txt（檔名）")
    ap.add_argument("--minutes", type=str, default="5,10",
                    help="要產出的長度（分鐘），逗號分隔，如 5,10；填 0 = 原始長度單一檔")
    args = ap.parse_args()

    if args.minutes.strip() in ("0", ""):
        minutes_list = None
    else:
        minutes_list = [int(x) for x in args.minutes.split(",") if x.strip()]

    probs = preflight()
    if probs:
        print("\n  [環境檢查] 有問題需要先處理：\n")
        for p in probs:
            print("   - " + p)
        print("\n  處理好之後再雙擊一次即可。")
        return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)

    bgm = find_bgm()

    print("=" * 66)
    print("  本草冥想 - 文字檔轉語音")
    print("=" * 66)
    print(f"  聲音    ：{VOICE}   語速 {RATE}   音調 {PITCH}")
    print(f"  長度    ：{('、'.join(f'{m}分' for m in minutes_list)) if minutes_list else '原始長度'}")
    print(f"  背景音樂：{bgm.name if bgm else '（無，只輸出純人聲）'}")
    print(f"  輸入    ：{INPUT_DIR}")
    print(f"  輸出    ：{OUTPUT_DIR}")
    print("-" * 66)

    if args.file:
        txts = [INPUT_DIR / args.file]
    else:
        txts = sorted(INPUT_DIR.glob("*.txt"))

    if not txts or not txts[0].exists():
        print("  找不到任何腳本 txt，請把腳本放進「腳本」資料夾。")
        return

    def outputs_for(stem):
        if minutes_list:
            return [OUTPUT_DIR / f"{stem}_{m:02d}m.mp3" for m in minutes_list]
        return [OUTPUT_DIR / f"{stem}.mp3"]

    todo = []
    for t in txts:
        if all(o.exists() for o in outputs_for(t.stem)) and not args.force:
            print(f"  [跳過] {t.stem}（成品已齊，要重轉請加 --force）")
        else:
            todo.append(t)

    if not todo:
        print("\n  沒有需要轉的檔案。")
        return

    print(f"\n  準備轉換 {len(todo)} 支腳本：\n")
    for i, t in enumerate(todo, 1):
        print(f"  [{i}/{len(todo)}] {t.stem} ...", flush=True)
        try:
            outs = await build_one(t, bgm, minutes_list)
            for out in outs:
                secs = duration(out)
                kb = out.stat().st_size / 1024
                print(f"        [完成] {out.name}  ({secs/60:.1f} 分, {kb:.0f}KB)")
        except Exception as e:
            print(f"        [失敗] {e}")

    # 清總暫存
    try:
        TEMP_DIR.rmdir()
    except OSError:
        pass

    print("\n" + "=" * 66)
    print("  全部完成！成品在「成品」資料夾。")
    print("=" * 66)


if __name__ == "__main__":
    asyncio.run(main())
