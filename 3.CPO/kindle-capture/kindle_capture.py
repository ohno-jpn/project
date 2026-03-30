from __future__ import annotations

import ctypes
import re
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
import shutil
import tkinter as tk
from tkinter import messagebox

import pyautogui
import psutil
from PIL import Image, ImageChops
import win32con
import win32gui
import win32process
import winsound


@dataclass
class CaptureConfig:
    author: str
    title: str
    direction: str
    pages: int | None
    delay_seconds: float
    output_dir: Path
    final_dir: Path


PAGE_DELAY_SECONDS = 1.0
OUTPUT_DIR_NAME = "output"
FINAL_DIR_NAME = "final_pdf"


def _sanitize_filename(text: str) -> str:
    cleaned = re.sub(r"[\\/:*?\"<>|]", "_", text)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned or "untitled"


def _gui_prompt() -> CaptureConfig | None:
    root = tk.Tk()
    root.title("Kindle Capture")
    root.resizable(False, False)

    frame = tk.Frame(root, padx=14, pady=12)
    frame.pack()

    tk.Label(frame, text="作者").grid(row=0, column=0, sticky="w")
    author_entry = tk.Entry(frame, width=36)
    author_entry.grid(row=0, column=1, padx=6, pady=4)

    tk.Label(frame, text="タイトル").grid(row=1, column=0, sticky="w")
    title_entry = tk.Entry(frame, width=36)
    title_entry.grid(row=1, column=1, padx=6, pady=4)

    tk.Label(frame, text="ページ送り").grid(row=2, column=0, sticky="w")
    direction_var = tk.StringVar(value="right")
    dir_frame = tk.Frame(frame)
    dir_frame.grid(row=2, column=1, sticky="w")
    tk.Radiobutton(dir_frame, text="左送り", variable=direction_var, value="left").pack(
        side="left", padx=2
    )
    tk.Radiobutton(dir_frame, text="右送り", variable=direction_var, value="right").pack(
        side="left", padx=8
    )

    tk.Label(frame, text="ページ数").grid(row=3, column=0, sticky="w")
    pages_entry = tk.Entry(frame, width=10)
    pages_entry.grid(row=3, column=1, sticky="w", padx=6, pady=4)

    result: dict[str, str] = {}

    def _on_start() -> None:
        author = author_entry.get().strip()
        title = title_entry.get().strip()
        pages_text = pages_entry.get().strip()
        if not author:
            messagebox.showerror("入力エラー", "作者を入力してください。")
            return
        if not title:
            messagebox.showerror("入力エラー", "タイトルを入力してください。")
            return
        pages = None
        if pages_text:
            try:
                pages = int(pages_text)
            except ValueError:
                messagebox.showerror("入力エラー", "ページ数は数字で入力してください。")
                return
            if pages <= 0:
                messagebox.showerror("入力エラー", "ページ数は1以上で入力してください。")
                return
        result["author"] = author
        result["title"] = title
        result["direction"] = direction_var.get()
        result["pages"] = "" if pages is None else str(pages)
        root.destroy()

    def _on_cancel() -> None:
        root.destroy()

    button_frame = tk.Frame(frame)
    button_frame.grid(row=4, column=0, columnspan=2, pady=(8, 0))
    tk.Button(button_frame, text="開始", width=10, command=_on_start).pack(
        side="left", padx=6
    )
    tk.Button(button_frame, text="キャンセル", width=10, command=_on_cancel).pack(
        side="left", padx=6
    )

    root.mainloop()

    if not result:
        return None

    output_dir = Path(OUTPUT_DIR_NAME)
    final_dir = output_dir / FINAL_DIR_NAME
    return CaptureConfig(
        author=result["author"],
        title=result["title"],
        direction=result["direction"],
        pages=int(result["pages"]) if result["pages"] else None,
        delay_seconds=PAGE_DELAY_SECONDS,
        output_dir=output_dir,
        final_dir=final_dir,
    )


def _ensure_output_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def _find_window_by_process(process_name: str) -> int | None:
    target_pids = set()
    for proc in psutil.process_iter(attrs=["name", "pid"]):
        name = proc.info.get("name") or ""
        if name.lower() == process_name.lower():
            target_pids.add(proc.info["pid"])

    if not target_pids:
        return None

    hwnds: list[int] = []

    def _enum_cb(hwnd: int, _extra: object) -> None:
        if not win32gui.IsWindowVisible(hwnd):
            return
        _, pid = win32process.GetWindowThreadProcessId(hwnd)
        if pid in target_pids:
            hwnds.append(hwnd)

    win32gui.EnumWindows(_enum_cb, None)
    return hwnds[0] if hwnds else None


def _find_window_by_process_any(process_name: str) -> int | None:
    """
    可視/不可視に関係なく、プロセスに紐づくウィンドウを探します。
    """
    target_pids = set()
    for proc in psutil.process_iter(attrs=["name", "pid"]):
        name = proc.info.get("name") or ""
        if name.lower() == process_name.lower():
            target_pids.add(proc.info["pid"])

    if not target_pids:
        return None

    hwnds: list[int] = []

    def _enum_cb(hwnd: int, _extra: object) -> None:
        _, pid = win32process.GetWindowThreadProcessId(hwnd)
        if pid in target_pids:
            hwnds.append(hwnd)

    win32gui.EnumWindows(_enum_cb, None)
    return hwnds[0] if hwnds else None


def _activate_window() -> int | None:
    hwnd = _find_window_by_process("Kindle.exe")
    if not hwnd:
        return None
    try:
        win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
        win32gui.SetForegroundWindow(hwnd)
        win32gui.ShowWindow(hwnd, win32con.SW_MAXIMIZE)
        time.sleep(0.6)
        return hwnd
    except Exception:
        return None


def _is_fullscreen(hwnd: int, tolerance: int = 40) -> bool:
    screen_width, screen_height = pyautogui.size()
    left, top, right, bottom = win32gui.GetWindowRect(hwnd)
    width = right - left
    height = bottom - top
    return (
        abs(width - screen_width) <= tolerance
        and abs(height - screen_height) <= tolerance
    )


def _ensure_fullscreen(hwnd: int) -> None:
    if _is_fullscreen(hwnd):
        return
    for _ in range(2):
        pyautogui.press("f11")
        time.sleep(0.9)
        if _is_fullscreen(hwnd):
            return

    screen_width, screen_height = pyautogui.size()
    try:
        win32gui.SetWindowPos(
            hwnd,
            win32con.HWND_TOP,
            0,
            0,
            screen_width,
            screen_height,
            win32con.SWP_SHOWWINDOW,
        )
        time.sleep(0.4)
    except Exception:
        pass


def _rms_diff(a: Image.Image, b: Image.Image) -> float:
    a_small = a.convert("L").resize((320, 180))
    b_small = b.convert("L").resize((320, 180))
    diff = ImageChops.difference(a_small, b_small)
    hist = diff.histogram()
    total = sum(v * (i * i) for i, v in enumerate(hist))
    rms = (total / (a_small.size[0] * a_small.size[1])) ** 0.5
    return rms


def _is_same_page(a: Image.Image, b: Image.Image, threshold: float = 2.0) -> bool:
    return _rms_diff(a, b) <= threshold


def _capture_pages(config: CaptureConfig) -> list[Path]:
    output_dir = config.output_dir
    _ensure_output_dir(output_dir)

    key = "right" if config.direction == "right" else "left"
    image_paths: list[Path] = []

    index = 1
    current = pyautogui.screenshot()
    while True:
        filename = f"{index:04d}.png"
        path = output_dir / filename
        current.save(path)
        image_paths.append(path)
        print(f"保存: {path}")

        if config.pages is not None and index >= config.pages:
            break

        pyautogui.press(key)
        time.sleep(config.delay_seconds)
        next_image = pyautogui.screenshot()

        if config.pages is None and _is_same_page(current, next_image):
            print("ページが変わらないため終了します。")
            break

        current = next_image
        index += 1

    return image_paths


def _images_to_pdf(image_paths: list[Path], output_pdf: Path) -> None:
    if not image_paths:
        raise ValueError("画像がありません。")

    images: list[Image.Image] = []
    try:
        for path in image_paths:
            img = Image.open(path).convert("RGB")
            images.append(img)
        first, rest = images[0], images[1:]
        first.save(output_pdf, save_all=True, append_images=rest)
    finally:
        for img in images:
            try:
                img.close()
            except Exception:
                pass


def _beep_end() -> None:
    try:
        winsound.Beep(880, 200)
        winsound.Beep(988, 200)
        winsound.Beep(1047, 250)
    except Exception:
        pass


def _focus_console() -> None:
    try:
        hwnd = ctypes.windll.kernel32.GetConsoleWindow()
        if hwnd:
            ctypes.windll.user32.SetForegroundWindow(hwnd)
    except Exception:
        pass


def _prepare_output_dirs(base_output: Path) -> Path:
    base_output.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    temp_dir = base_output / f"temp_{stamp}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    return temp_dir


def _confirm_cleanup() -> bool:
    root = tk.Tk()
    root.withdraw()
    result = messagebox.askyesno(
        "確認", "テンポラリーファイルを削除しますか？\n削除する場合はPDFを保存フォルダへ移動します。"
    )
    root.destroy()
    return result


def _cleanup_and_move(
    image_paths: list[Path], temp_dir: Path, pdf_path: Path, final_dir: Path
) -> Path:
    final_dir.mkdir(parents=True, exist_ok=True)
    final_pdf_path = final_dir / pdf_path.name

    moved_successfully = False

    for path in image_paths:
        try:
            path.unlink()
        except Exception:
            pass

    try:
        shutil.move(str(pdf_path), str(final_pdf_path))
        moved_successfully = True
    except Exception:
        final_pdf_path = pdf_path

    try:
        # PDFが移動できた場合は、OK後の要望どおりテンポラリを強制的に削除します。
        # （移動に失敗している場合は、pdfが temp_dir に残っているので消さない）
        if moved_successfully and temp_dir.exists() and temp_dir.is_dir():
            shutil.rmtree(temp_dir, ignore_errors=True)
        elif temp_dir.exists() and temp_dir.is_dir() and not any(temp_dir.iterdir()):
            temp_dir.rmdir()
    except Exception:
        pass

    return final_pdf_path


def _focus_cursor_window() -> None:
    # Cursor にフォーカスを戻す（OK後に「このcursor画面に戻る」挙動を狙う）
    # 実行環境によってプロセス名が変わる可能性があるため複数候補を試す。
    for process_name in ["Cursor.exe", "cursor.exe", "Cursor", "cursor"]:
        hwnd = _find_window_by_process(process_name) or _find_window_by_process_any(process_name)
        if not hwnd:
            continue
        try:
            win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
            win32gui.SetForegroundWindow(hwnd)
            win32gui.ShowWindow(hwnd, win32con.SW_MAXIMIZE)
            time.sleep(0.2)
            return
        except Exception:
            continue


def main(argv: list[str] | None = None) -> int:
    _ = argv
    config = _gui_prompt()
    if not config:
        return 0

    pdf_name = f"{_sanitize_filename(config.author)}_{_sanitize_filename(config.title)}.pdf"
    temp_dir = _prepare_output_dirs(config.output_dir)

    print("Kindle画面へ切り替えます。")
    hwnd = _activate_window()
    if not hwnd:
        messagebox.showerror("エラー", "Kindleのウィンドウが見つかりませんでした。")
        return 1
    _ensure_fullscreen(hwnd)
    time.sleep(0.5)

    config.output_dir = temp_dir
    image_paths = _capture_pages(config)

    pdf_path = temp_dir / pdf_name
    _images_to_pdf(image_paths, pdf_path)

    print(f"作成: {pdf_path}")
    _beep_end()
    _focus_console()

    if _confirm_cleanup():
        final_pdf = _cleanup_and_move(
            image_paths=image_paths,
            temp_dir=temp_dir,
            pdf_path=pdf_path,
            final_dir=config.final_dir,
        )
        print(f"移動: {final_pdf}")
        _focus_cursor_window()
    else:
        # 削除しない場合でも、少なくともCursor画面へ戻す。
        _focus_cursor_window()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
