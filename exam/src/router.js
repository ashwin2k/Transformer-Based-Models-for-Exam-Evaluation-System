import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import Add from "./Add";
import App from "./App";

export default function RoutesSpecs() {
    return (
      <Router>
          <Routes>
            <Route path="/" element={<App/>}/> 

            <Route path="/Add" element={<Add/>} />
          </Routes>
      </Router>
    );
  }