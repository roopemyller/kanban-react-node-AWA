import { useEffect, useState } from 'react'
import './App.css'
import Header from './components/Header'
import Home from './components/Home'
import Login from './components/Login'
import SignUp from './components/SignUp'
import Profile from './components/Profile'
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
    {/* Router component that has everything inside it like Header and Routes to Home/Login/Signup/Profile */}
    <BrowserRouter>
      <Header setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} setBoard={setBoard}/>
      <Routes>
        <Route path='/' element={<>
          <Home setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn}/>
          </>} />
          <Route path='/login' element={<>
            <Login setIsLoggedIn={setIsLoggedIn} />
            </>} />
          <Route path='/signup' element={<>
            <SignUp/>
          </>} />
          <Route path='/profile' element={<>
            <Profile/>
          </>} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

// AppContent is wrapped in BoardProvider to provide the context for the kanban board to work
const App: React.FC = () => {
  return (
    <BoardProvider>
      <AppContent />
    </BoardProvider>
  )
}

export default App
