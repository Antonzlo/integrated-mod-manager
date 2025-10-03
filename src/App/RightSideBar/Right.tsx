import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import RightOnline from "@/App/RightSideBar/RightOnline";
import RightLocal from "@/App/RightSideBar/RightLocal";
function RightSidebar() {
	return (
		<Sidebar side="right">
			<SidebarContent className="flex flex-row w-full h-full gap-0 p-0 overflow-hidden border border-l-0">
				<RightLocal />
				<RightOnline />
			</SidebarContent>
		</Sidebar>
	);
}
export default RightSidebar;