import React from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen w-full bg-[#f0f2f5] relative overflow-x-hidden font-sans">
            {/* Abstract Background Blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-200/40 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-200/40 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-pink-200/40 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col h-full min-h-screen">

                {/* Header Section (Logo/Title if needed) from image looks like text 'Redefina o que...' is part of main content */}

                <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 md:pt-4 mb-6 pb-48">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
