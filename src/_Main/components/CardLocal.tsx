import React from "react";
import { Label } from "@/components/ui/label";
import { getImageUrl, handleImageError } from "@/utils/utils";

interface CardLocalProps {
	item: {
		path: string;
		name: string;
		enabled: boolean;
		isDir: boolean;
	};
	selected: boolean;
	lastUpdated: number;
}

const CardLocal = React.memo(({ item, selected, lastUpdated }: CardLocalProps) => {
	const previewUrl = `${getImageUrl(item.path)}?${lastUpdated}`;

	return (
		<div
			className={`card-generic ${selected ? "selected-card" : ""}`}
			style={{
				borderColor: item.enabled ? "var(--accent)" : "",
			}}
		>
			<img
				style={{ filter: item.enabled ? "brightness(1) blur(8px) " : " blur(8px) brightness(0.5) saturate(0.5)" }}
				className="fadein object-cover w-full h-full pointer-events-none"
				src={previewUrl}
				onError={(e) => handleImageError(e, true)}
			/>
			<img
				style={{ filter: item.enabled ? "brightness(1)" : "brightness(0.5) saturate(0.5)" }}
				className="w-full fadein h-[calc(100%-3.5rem)] -mt-71.5 data-gxi:-mt-57.5  duration-200 rounded-t-lg data-gi:rounded-none pointer-events-none object-cover"
				src={previewUrl}
				onError={(e) => handleImageError(e)}
			/>
			<div className="bg-background/50 fadein backdrop-blur data-gxi:-mt-71.5 flex items-center w-full min-h-14 gap-2 px-4 py-1 header-img">
				<Label
					className="text-ellipsis w-56 overflow-hidden border-0 pointer-events-none select-none"
					style={{ backgroundColor: "#fff0", filter: item.enabled ? "brightness(1)" : "brightness(0.5) saturate(0.5)" }}
				>
					{item.name}
				</Label>
			</div>
		</div>
	);
});

CardLocal.displayName = "CardLocal";

export default CardLocal;
