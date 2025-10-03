import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./components/theme-provide";
import { Provider } from "jotai";
import { store } from "./utils/vars";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<Provider store={store}>
		<ThemeProvider defaultTheme="dark">
			<App />
		</ThemeProvider>
	</Provider>
);