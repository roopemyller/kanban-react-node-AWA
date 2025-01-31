import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import MuiCard from '@mui/material/Card'
import {Link} from 'react-router-dom'

const SignUp = () => {
    
    return (
        <>
        <MuiCard variant='outlined'>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding:"50px 120px" }}>
                <Typography variant='h3'>
                    Sign Up
                </Typography>

                <FormLabel>
                    Name
                </FormLabel>
                <TextField
                    required
                    fullWidth
                    id="name"
                    placeholder='Your Name'
                    autoComplete='name'
                    autoFocus
                    variant='outlined'
                />

                <FormLabel>
                    Email
                </FormLabel>
                <TextField
                    required
                    fullWidth
                    id="email"
                    type="email"
                    placeholder='Your Email'
                    autoComplete='email'
                    variant='outlined'
                />
                
                <FormLabel>
                    Password
                </FormLabel>
                <TextField
                    required
                    fullWidth
                    id="password"
                    type='password'
                    placeholder='Your Password'
                    autoComplete='new-password'
                    variant='outlined'
                />

                <Button type='submit' variant='contained'>Register</Button>

                <Divider>
                    <Typography sx={{ color: 'text.secondary' }}>or</Typography>
                </Divider>

                <Button color="inherit" component={Link} to="/login">Login</Button>

            </Box>
        </MuiCard>
        </>
    )
  }
  
  export default SignUp