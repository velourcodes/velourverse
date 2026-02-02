import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import PlatformSwitcher from './PlatformSwitcher';
import './Layout.css';

const Layout = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    // Determine context
    const isVox = location.pathname.startsWith('/tweets');
    const context = isVox ? 'vox' : 'vortex';

    return (
        <div className={`app-layout ${context}-context`}>
            <Header context={context} />
            <div className="app-body">
                {!isHomePage && <Sidebar context={context} />}
                <main className={`app-main ${isHomePage ? 'full-width' : ''}`}>
                    <Outlet />
                </main>
            </div>
            <PlatformSwitcher />
        </div>
    );
};

export default Layout;
