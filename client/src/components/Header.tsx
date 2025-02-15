import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import {Link, useNavigate} from 'react-router-dom'

interface HeaderProps {
    isLoggedIn: boolean
    setIsLoggedIn: (value: boolean) => void
    setBoard: (value: null) => void
}

// Header
const Header = ({ isLoggedIn, setIsLoggedIn, setBoard }: HeaderProps) => {
    const navigate = useNavigate()

    // Handle user logout
    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('userName')
        setIsLoggedIn(false)
        setBoard(null)
        navigate('/login')
    }
    return (
        <Box sx={{ flexGrow: 1}}>
            <AppBar position="fixed">
                <Toolbar sx={{backgroundColor: "#124"}}>
                    
                    <Typography variant="h4" component="div" sx={{ flexGrow: 1, color: 'white' }}>
                        Kanban Board                    
                    </Typography>

                    <Button color="inherit" component={Link} to="/">Home</Button>

                    {/* If user logged in -> show Logout, if not show login and signup*/}
                    {isLoggedIn ? (
                        <Button color="inherit" onClick={handleLogout}>Logout</Button>
                    ) : (
                        <>
                            <Button color="inherit" component={Link} to="/login">Login</Button>
                            <Button color="inherit" component={Link} to="/signup">Sign Up</Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default Header;