import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { store } from "./store/store";
import { Provider } from "react-redux";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <ProtectedRoute>
          <App />
        </ProtectedRoute>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
);
