import { useState } from 'react'
import { Outlet } from 'react-router'

import Header from "./partials/Header"
import Footer from "./partials/Footer"

export default function App() { 

  return <>
    <Header />
    <main> <Outlet /></main>
    <Footer />
  </>;
}
