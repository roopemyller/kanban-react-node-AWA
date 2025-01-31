import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import {Link} from 'react-router-dom'


const Header = () => {
    return (
        <Box sx={{ flexGrow: 1}}>
            <AppBar position="fixed">
                <Toolbar sx={{backgroundColor: "#124"}}>
                    
                    <Typography variant="h4" component="div" sx={{ flexGrow: 1, color: 'white' }}>
                        Kanban Board                    
                    </Typography>

                    <Button color="inherit" component={Link} to="/">Home</Button>
                    <Button color="inherit" component={Link} to="/login">Login</Button>
                    <Button color="inherit" component={Link} to="/signup">Sign Up</Button>

                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default Header;