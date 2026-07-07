import { getCurrentWindow } from "@tauri-apps/api/window";
import type { CSSProperties } from "react";

// The window is borderless (decorations: false), so on Wayland there is no
// resize affordance. These invisible edge/corner handles call
// startResizeDragging so the window can be resized on every platform.
type Dir = "North" | "South" | "East" | "West" | "NorthEast" | "NorthWest" | "SouthEast" | "SouthWest";

const appWindow = getCurrentWindow();
const EDGE = 5; // px – edge thickness
const CORNER = 14; // px – corner box

const HANDLES: { dir: Dir; style: CSSProperties }[] = [
	{ dir: "North", style: { top: 0, left: CORNER, right: CORNER, height: EDGE, cursor: "ns-resize" } },
	{ dir: "South", style: { bottom: 0, left: CORNER, right: CORNER, height: EDGE, cursor: "ns-resize" } },
	{ dir: "West", style: { left: 0, top: CORNER, bottom: CORNER, width: EDGE, cursor: "ew-resize" } },
	{ dir: "East", style: { right: 0, top: CORNER, bottom: CORNER, width: EDGE, cursor: "ew-resize" } },
	{ dir: "NorthWest", style: { top: 0, left: 0, width: CORNER, height: CORNER, cursor: "nwse-resize" } },
	{ dir: "NorthEast", style: { top: 0, right: 0, width: CORNER, height: CORNER, cursor: "nesw-resize" } },
	{ dir: "SouthWest", style: { bottom: 0, left: 0, width: CORNER, height: CORNER, cursor: "nesw-resize" } },
	{ dir: "SouthEast", style: { bottom: 0, right: 0, width: CORNER, height: CORNER, cursor: "nwse-resize" } },
];

export default function ResizeHandles() {
	return (
		<div className="pointer-events-none fixed inset-0 z-[3000]">
			{HANDLES.map((h) => (
				<div
					key={h.dir}
					className="pointer-events-auto fixed"
					style={h.style}
					onMouseDown={(e) => {
						if (e.button !== 0) return;
						e.preventDefault();
						appWindow.startResizeDragging(h.dir).catch(() => {});
					}}
				/>
			))}
		</div>
	);
}
