import { useEffect, useState } from 'react'
import './App.css'
import Header from './components/Header'
import Home from './components/Home'
import Login from './components/Login'
import SignUp from './components/SignUp'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { BoardProvider, useBoard } from './context/BoardContext'

const AppContent: React.FC = () => {
  const { setBoard } = useBoard()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Get user token on page load
  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token) //If token exists, user is logged in
}, [])

  return (
    <>
    <BrowserRouter>
      <Header setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} setBoard={setBoard}/>
      <Routes>
        <Route path='/' element={<>
          <Home/>
          </>} />
          <Route path='/login' element={<>
            <Login setIsLoggedIn={setIsLoggedIn} />
            </>} />
          <Route path='/signup' element={<>
            <SignUp/>
          </>} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

const App: React.FC = () => {
  return (
    <BoardProvider>
      <AppContent />
    </BoardProvider>
  )
}

export default App
