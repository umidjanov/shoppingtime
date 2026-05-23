import React from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ToastContainer from '../ui/ToastContainer';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 page-enter">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
      <ScrollRestoration />
    </div>
  );
}
