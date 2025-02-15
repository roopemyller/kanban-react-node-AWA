import { useEffect, useState } from 'react'
import {Link} from 'react-router-dom'
import Board from './Board'
import { fetchBoard } from '../context/BoardContext'
import { useBoard } from '../context/BoardContext'
import Button from '@mui/material/Button'

const Home = () => {
  const [userName, setUserName] = useState('')
  const { setBoard } = useBoard()
  

  useEffect(() => {
    // Get stored name from localStorage
    const userName = localStorage.getItem('userName')
    if (userName) {
      setUserName(userName)
      fetchBoard(setBoard)
    }
  }, [])

  return (
    <div>
      <h2 style={{textAlign: 'left'}}>{userName ? `Hello ${userName}` : 'Log in to see Kanban Board'}</h2>
      <div>
        {/* Show login button if user is not logged in */}
        {!userName && (
          <Link to="/login">
            <Button variant='contained' style={{ cursor: 'pointer' }}>Login</Button>
          </Link>
        )}
        {userName && (
          <Board></Board>
        )}
      </div>
    </div>
  )
}

export default Home;