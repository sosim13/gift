import React from 'react';
import ReactDOM from 'react-dom/client';
import './common/index.css';
import App from './App';
import TopNav from "./TopNav";
import BottomNav from "./BottomNav";
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <TopNav />
      <BottomNav />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
