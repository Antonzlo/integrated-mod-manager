// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#[cfg(not(dev))]
use std::env;
fn main() {
    #[cfg(not(dev))]
    {
        env::set_var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", "--ignore-gpu-blocklist --enable-gpu-rasterization");
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
        // By default, GPU hardware acceleration and compositing are enabled for smooth 60 FPS rendering.
        // If a user encounters GPU driver issues or requests a software fallback, honor IMM_DISABLE_GPU=1 or WEBKIT_DISABLE_COMPOSITING_MODE=1.
        let disable_gpu = std::env::var("IMM_DISABLE_GPU").map(|v| v == "1" || v == "true").unwrap_or(false)
            || std::env::var("WEBKIT_DISABLE_COMPOSITING_MODE").map(|v| v == "1" || v == "true").unwrap_or(false);

        if disable_gpu {
            std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
        } else if std::env::var("WEBKIT_FORCE_COMPOSITING_MODE").is_err() {
            std::env::set_var("WEBKIT_FORCE_COMPOSITING_MODE", "1");
        }

        // DMA-BUF stays enabled by default: without it, WebKitGTK on Wayland copies every frame back from the
        // GPU through shared memory, which makes scrolling very laggy. Its known hang (the sliding online
        // carousel) is avoided in the frontend. Users whose GPU stack misbehaves can opt out with
        // IMM_DISABLE_DMABUF=1. An explicit WEBKIT_DISABLE_DMABUF_RENDERER always wins.
        let disable_dmabuf = std::env::var("IMM_DISABLE_DMABUF").map(|v| v == "1" || v == "true").unwrap_or(false);
        if disable_dmabuf && std::env::var("WEBKIT_DISABLE_DMABUF_RENDERER").is_err() {
            std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
        }

        // With NVIDIA's driver on Wayland, DMA-BUF crashes at startup (Gdk "Error 71 (Protocol error)")
        // unless explicit sync is off. Only NVIDIA's driver reads this variable; Mesa (AMD/Intel) ignores it.
        // Set __NV_DISABLE_EXPLICIT_SYNC=0 to keep explicit sync on.
        if std::env::var("__NV_DISABLE_EXPLICIT_SYNC").is_err() {
            std::env::set_var("__NV_DISABLE_EXPLICIT_SYNC", "1");
        }
    }
    wuwa_mod_manager_lib::run()
}
