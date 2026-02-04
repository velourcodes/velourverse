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
    const searchParams = new URLSearchParams(location.search);
    const isVoxQuery = searchParams.get('context') === 'vox';

    const isVox = isVoxQuery ||
        location.pathname.startsWith('/tweets') ||
        location.pathname.startsWith('/explore') ||
        location.pathname.startsWith('/notifications') ||
        location.pathname.startsWith('/trending') ||
        location.pathname.startsWith('/my-tweets-vox') ||
        location.pathname.startsWith('/create-tweet') ||
        location.pathname.startsWith('/edit-tweet') ||
        location.pathname.startsWith('/delete-all-tweets');
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
            {!isHomePage && <PlatformSwitcher context={context} />}
        </div>
    );
};

export default Layout;
