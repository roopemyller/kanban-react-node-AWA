import { useEffect, useState } from 'react'
import {Link} from 'react-router-dom'
import Board from './Board'
import { fetchBoard } from '../context/BoardContext'
import { useBoard } from '../context/BoardContext'
import Button from '@mui/material/Button'
import { Typography, Box } from '@mui/material'

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
    <Box sx={{marginTop: 6}}>
      {/* Show user name if user is logged in, if not show text "login...."*/}
      <Typography variant="h5" sx={{textAlign: 'left'}}>{userName ? `Hello ${userName}` : 'Log in to see Kanban Board'}</Typography>
      <Box>
        {/* Show login button if user is not logged in */}
        {!userName && (
          <Link to="/login">
            <Button variant='contained' style={{ cursor: 'pointer' }}>Login</Button>
          </Link>
        )}
        {/* Show board if user is logged in */}
        {userName && (
          <Board></Board>
        )}
      </Box>
    </Box>
  )
}

export default Home;