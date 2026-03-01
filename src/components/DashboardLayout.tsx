import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    const handleSidebarToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="min-h-screen bg-background flex overflow-hidden">
            <DashboardSidebar isOpen={sidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <DashboardHeader onSidebarToggle={handleSidebarToggle} />

                <main className={`flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="mx-auto max-w-7xl"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
