import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";

import './index.css'

export const Router = () => {
    return (
        <Routes>
            <Route index element={<Home />} />
            <Route path="*" element={<>Not Found</>} />
        </Routes>
    );
};