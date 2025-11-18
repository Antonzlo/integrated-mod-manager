import ReactDOM from "react-dom/client";
import { store } from "./utils/vars";
import { ThemeProvider } from "./components/theme-provide";
import { Provider } from "jotai";
import App from "./App";
/*
import ErrorBoundary from "./ErrorBoundary";

<ErrorBoundary>
	<App />
</ErrorBoundary>
*/
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<Provider store={store}>
		<ThemeProvider defaultTheme="dark">
			<App />
		</ThemeProvider>
	</Provider>
);
