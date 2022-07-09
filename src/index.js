import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from "react-redux";
import configureStore from "./store/store"
import { BrowserRouter } from "react-router-dom";
import {PersistGate} from "redux-persist/integration/react"
import {ToastContainer} from "react-toastify"

const { store, persistor } = configureStore()

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <PersistGate loading={<div>Loading</div>} persistor={persistor}>
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
    </React.StrictMode>
    </PersistGate>
  </Provider>
);