import React from 'react';
import TopBar from './TopBar';

const Layout = ({ children }) => {
  return (
    <div>
      <TopBar />
      <main style={{ marginTop: '100px' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;