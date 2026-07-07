// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#[cfg(not(dev))]
use std::env;
fn main() {
    env::set_var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", "--ignore-gpu-blocklist --enable-gpu-rasterization");
    #[cfg(not(dev))]
    {
        // On Linux the executable can live anywhere (~/.local/bin, an AppImage
        // mount, /usr/bin, ...), so storing configs next to it is unstable and
        // can pollute arbitrary directories. Use a stable XDG data directory
        // instead — the same per-user location the frontend's `getCwd()` is
        // meant to point at (localDataDir + product name).
        #[cfg(target_os = "linux")]
        {
            let data_dir = env::var_os("XDG_DATA_HOME")
                .map(std::path::PathBuf::from)
                .filter(|p| p.is_absolute())
                .or_else(|| {
                    env::var_os("HOME").map(|home| std::path::PathBuf::from(home).join(".local/share"))
                })
                .map(|base| base.join("Integrated Mod Manager (IMM)"));
            if let Some(dir) = data_dir {
                if let Err(e) = std::fs::create_dir_all(&dir) {
                    eprintln!("Failed to create data directory: {}", e);
                }
                if let Err(e) = env::set_current_dir(&dir) {
                    eprintln!("Failed to set working directory: {}", e);
                }
            }
        }
        // On Windows/macOS keep the existing behaviour: the working directory is
        // the executable's location. On Windows the default NSIS (currentUser)
        // install typically places the exe under %LOCALAPPDATA%, so configs
        // already live in a stable per-user location; either way this path keeps
        // Windows behaviour byte-identical so existing configs are never
        // relocated.
        #[cfg(not(target_os = "linux"))]
        if let Ok(exe_path) = env::current_exe() {
            // Get the directory containing the executable
            if let Some(exe_dir) = exe_path.parent() {
                // Set the current working directory to the exe's location
                if let Err(e) = env::set_current_dir(exe_dir) {
                    eprintln!("Failed to set working directory: {}", e);
                }
            }
        }
    }
    #[cfg(target_os = "linux")]
    unsafe {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
        std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
    }
    wuwa_mod_manager_lib::run()
}
