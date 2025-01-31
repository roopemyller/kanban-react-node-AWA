import './App.css'
import Header from './components/Header'
import Home from './components/Home'
import Login from './components/Login'
import SignUp from './components/SignUp'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

const App = () => {

  return (
    <>
      <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/' element={<>
          <Home/>
          </>} />
          <Route path='/login' element={<>
            <Login/>
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
