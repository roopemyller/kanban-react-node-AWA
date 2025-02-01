import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import MuiCard from '@mui/material/Card'
import Link from '@mui/material/Link';
import {Link as RouterLink} from 'react-router-dom'


// Login form
const Login = () => {
    

  // If you press Forgot password link
  const forgotPassword = () => {
    alert("Hint: it is your password!")
  }

    return (
        <>
        <MuiCard variant='outlined'>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding:"50px 120px" }}>
                <Typography variant='h3'>
                    Login
                </Typography>

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
                    autoFocus
                />
                
                <FormLabel>
                    Password
                </FormLabel>
                <TextField
                    required
                    fullWidth
                    id="email"
                    placeholder='Your Password'
                    type='password'
                    autoComplete='current-password'
                    variant='outlined'
                />

                <Button type='submit' variant='contained'>Login</Button>

                <Link
                  component="button"
                  type="button"
                  onClick={forgotPassword}
                  variant="body2"
                  sx={{ alignSelf: 'center', color:'black' }}
                >
                  Forgot your password?
                </Link>

                <Divider>
                    <Typography sx={{ color: 'text.secondary' }}>or</Typography>
                </Divider>

                <Typography sx={{ textAlign: 'center' }}>
                  Don&apos;t have an account?{' '}
                    <RouterLink
                      to="/signup"
                      style={{color:'#212121', textDecoration:"underline"}}
                    >
                      Sign up
                    </RouterLink>
                  </Typography>
            </Box>
        </MuiCard>
        </>
    )
  }
  
  export default Login