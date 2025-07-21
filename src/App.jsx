import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { Home } from "./pages";

const App = () => {
    return (
        <div className="bg-black min-h-screen w-full">
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </Router>
        </div>
    );
};

export default App;
