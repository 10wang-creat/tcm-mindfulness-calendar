#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""試聽目前設定的聲音。輸出 冥想音檔工具/試聽/試聽.mp3"""
import asyncio, sys, subprocess
from pathlib import Path
try:
    import edge_tts
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "edge-tts"])
    import edge_tts

# 與「冥想轉語音.py」保持一致
VOICE = "zh-TW-HsiaoChenNeural"
RATE  = "-20%"
PITCH = "+0Hz"

SAMPLE = ("歡迎來到本草冥想。找一個舒適的姿勢，輕輕閉上眼睛，"
          "讓呼吸自然流動，不需要刻意控制。現在，讓我們一起，"
          "慢慢地，進入這段溫柔的時光。")

OUT = Path(__file__).resolve().parent / "試聽" / "試聽.mp3"

async def go():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = edge_tts.Communicate(SAMPLE, VOICE, rate=RATE, pitch=PITCH)
    await c.save(str(OUT))
    print(f"完成：{OUT}")

if __name__ == "__main__":
    asyncio.run(go())
