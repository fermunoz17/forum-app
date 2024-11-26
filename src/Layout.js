import React from 'react';
import TopBar from './TopBar';

const Layout = ({ children }) => {
  return (
    <div>
      <TopBar />
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;