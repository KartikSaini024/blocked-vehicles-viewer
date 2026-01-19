import React from 'react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-4 mt-auto text-center border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                &copy; {currentYear} Kartik S.
            </p>
        </footer>
    );
}
