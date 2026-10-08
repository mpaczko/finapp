import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { store } from "./store/store";
import { Provider } from "react-redux";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/ThemeProvider/ThemeProvider";
import {
  applyAccentColor,
  readStoredAccentColor,
  readStoredTheme,
} from "./components/ThemeProvider/themeContext";

document.documentElement.dataset.theme = readStoredTheme();
applyAccentColor(readStoredAccentColor());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <Provider store={store}>
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        </Provider>
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>,
);
