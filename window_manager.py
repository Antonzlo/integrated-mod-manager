import webview
import sys
import pydirectinput
import win32con
import win32gui
import win32process
import win32api

window=None
def pyqt(type,opacity):
    global window
    window=webview.create_window("WWMM Launcher", "http://127.0.1:2110/", width=int(win32api.GetSystemMetrics(0)*0.8), height=int(win32api.GetSystemMetrics(1)*0.8), resizable=True,on_top=True,frameless=True if type==1 else False,fullscreen=True if type==2 else False)
    window.on_top=False
    
    # window.expose
    webview.start()
    

def change_opacity(opacity):
    pass
def change_type(type):
    global window
    print(type)
    if window:
        old_window = window
        window=webview.create_window("WWMM Launcher", "http://127.0.1:2110/", width=int(win32api.GetSystemMetrics(0)*0.8), height=int(win32api.GetSystemMetrics(1)*0.8), resizable=True,on_top=True,frameless=True if type==1 else False,fullscreen=True if type==2 else False)
        old_window.destroy()
        window.on_top=False

def get_focused_window_title():
    """Retrieves the title of the currently focused window."""
    hwnd = win32gui.GetForegroundWindow()
    return win32gui.GetWindowText(hwnd)

def find_window_by_title(title_substring):
    """
    Return the handle of the first top‐level window whose title contains the given substring.
    """
    def enum_handler(hwnd, found):
        if win32gui.IsWindowVisible(hwnd):
            text = win32gui.GetWindowText(hwnd)
            if title_substring.lower() in text.lower():
                found.append(hwnd)
    hwnds = []
    win32gui.EnumWindows(enum_handler, hwnds)
    return hwnds[0] if hwnds else None


def activate_window(hwnd):
    """
    Bring the window to the front and give it keyboard focus.
    """
    # If minimized, restore it
    win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
    # Bring to foreground
    win32gui.SetForegroundWindow(hwnd)
    #
    # foreground_thread = win32process.GetWindowThreadProcessId(win32gui.GetForegroundWindow())[0]
    # target_thread     = win32process.GetWindowThreadProcessId(hwnd)[0]
    # if foreground_thread != target_thread:
    #     win32gui.SetForegroundWindow(hwnd)


def press_f10():
    """
    Send a single F10 keystroke via pydirectinput.
    """
    print("Pressing F10")
    pydirectinput.press('f10')

