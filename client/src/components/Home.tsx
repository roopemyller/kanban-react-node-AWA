import { useEffect, useState } from 'react'
import {Link} from 'react-router-dom'
import Board from './Board'

const Home = () => {
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Get stored name from localStorage
    const userName = localStorage.getItem('userName')
    if (userName) {
      setUserName(userName)
    }
  }, [])

  return (
    <>
      <h2>{userName ? `Hello ${userName}` : 'Log in to see Kanban Board'}</h2>
      
      {/* Show login button if user is not logged in */}
      {!userName && (
        <Link to="/login">
          <button style={{ cursor: 'pointer' }}>Login</button>
        </Link>
      )}
      {userName && (
        <Board></Board>
      )}
    </>
  )
}

export default Home;