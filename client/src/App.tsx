import { useEffect, useState } from 'react'
import './App.css'
import Header from './components/Header'
import Home from './components/Home'
import Login from './components/Login'
import SignUp from './components/SignUp'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

const App: React.FC = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  // Get user token on page load
  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token) //If token exists, user is logged in
}, [])


  return (
    <>
      <BrowserRouter>
      <Header setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn}/>
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

export default App
