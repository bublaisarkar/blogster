import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

function MainLayout() {
    return (

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Navbar />

            <main>
                <Outlet />
            </main>

            <Footer />
        </div>

    );
}

export default MainLayout;