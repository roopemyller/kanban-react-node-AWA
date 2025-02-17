import { useEffect, useState } from 'react'
import {Link} from 'react-router-dom'
import Board from './Board'
import { fetchBoard } from '../context/BoardContext'
import { useBoard } from '../context/BoardContext'
import Button from '@mui/material/Button'
import { Container, Typography, Box } from '@mui/material'

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
    <Container maxWidth="xl" sx={{marginTop: 6}}>
      <Typography variant="h5" sx={{textAlign: 'left'}}>{userName ? `Hello ${userName}` : 'Log in to see Kanban Board'}</Typography>
      <Box>
        {/* Show login button if user is not logged in */}
        {!userName && (
          <Link to="/login">
            <Button variant='contained' style={{ cursor: 'pointer' }}>Login</Button>
          </Link>
        )}
        {userName && (
          <Board></Board>
        )}
      </Box>
    </Container>
  )
}

export default Home;