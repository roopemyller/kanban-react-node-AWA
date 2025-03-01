import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import {Link, useNavigate} from 'react-router-dom'
import React from 'react'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import { Menu } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Divider from '@mui/material/Divider'
import { Logout } from '@mui/icons-material'

interface HeaderProps {
    isLoggedIn: boolean
    setIsLoggedIn: (value: boolean) => void
    setBoard: (value: null) => void
}

// Header
const Header = ({ isLoggedIn, setIsLoggedIn, setBoard }: HeaderProps) => {
    const navigate = useNavigate()
    // Profile pic for user
    const profilePicture = localStorage.getItem('profilePicture')

    // Profile settings dropdown handling
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    // Handle user logout
    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('userName')
        setIsLoggedIn(false)
        setBoard(null)
        navigate('/login')
    }
    return (
        // Header
        <Box sx={{ flexGrow: 1}}>
            <AppBar position="fixed">
                <Toolbar sx={{backgroundColor: "#124"}}>
                    <Typography variant="h4" component="div" sx={{ flexGrow: 1, color: 'white' }}>Kanban Board</Typography>
                    <Button color="inherit" component={Link} to="/">Home</Button>

                    {/* If user logged in -> show user profile settings, if not show login and signup*/}
                    {isLoggedIn ? (
                        <>
                            <Tooltip title="Profile settings">
                                <IconButton onClick={handleClick} size="small" sx={{ ml: 2 }} aria-controls={open ? 'account-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined}>
                                    <Avatar src={profilePicture ? `http://localhost:3000${profilePicture}` : undefined} sx={{ width: 32, height: 32 }}/>
                                </IconButton>
                            </Tooltip>

                            {/* Profile settings dropdown */}
                            <Menu anchorEl={anchorEl} id="account-menu" open={open} onClose={handleClose} onClick={handleClose}
                                slotProps={{
                                    paper: {
                                        elevation: 0,
                                        sx: {
                                            overflow: 'visible',
                                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                            mt: 1.5,
                                            '& .MuiAvatar-root': {
                                                width: 32,
                                                height: 32,
                                                ml: -0.5,
                                                mr: 1,
                                            },
                                            '&::before': {
                                                content: '""',
                                                display: 'block',
                                                position: 'absolute',
                                                top: 0,
                                                right: 14,
                                                width: 10,
                                                height: 10,
                                                bgcolor: 'background.paper',
                                                transform: 'translateY(-50%) rotate(45deg)',
                                                zIndex: 0,
                                            },
                                        },
                                    },
                                }}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <MenuItem component={Link} to="/profile" onClick={handleClose}>
                                    <Avatar src={profilePicture ? `http://localhost:3000${profilePicture}` : undefined}/>
                                    Profile
                                </MenuItem>
                                
                                <Divider />
                                
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <Logout fontSize="small" />
                                    </ListItemIcon>
                                    Logout
                                </MenuItem>
                            </Menu>
                        </>
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

export default Header