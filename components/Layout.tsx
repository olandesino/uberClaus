import React from 'react'

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{backgroundImage: "url('/night-city-drive.gif')"}}>
      <div className="min-h-screen bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="container mx-auto p-4">
          {children}
        </div>
      </div>
    </div>
  )
}