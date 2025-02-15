import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import MuiCard from '@mui/material/Card'
import Link from '@mui/material/Link'
import {Link as RouterLink} from 'react-router-dom'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {jwtDecode} from 'jwt-decode'


interface LoginProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

// Login form
const Login = ({ setIsLoggedIn }: LoginProps) => {

  const navigate = useNavigate();

  // States for signup form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Handle user login
  const loginUser = async () => {

    // API call
    const response = await fetch('http://localhost:3000/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if(response.ok){
      /* 
      If response ok
      - get the data (token)
      - set token to local storage for use home page
      - set form empty
      - change page to home
      */
      const data = await response.json()
      console.log(data)

      localStorage.setItem('token', data.token)
      const decodedToken: any = jwtDecode(data.token)
      console.log("DecodedToken: ", decodedToken)
      localStorage.setItem('userName', decodedToken.name)

      setIsLoggedIn(true)

      setEmail('')
      setPassword('')

      // Change to Home page
      navigate('/')
      //window.location.reload()
    }else{
      setError('Invalid email or password')
    }
  }

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

                {error && (
                  <Typography color="error" textAlign="center">
                    {error}
                  </Typography>
                )}

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
                    onChange={e => setEmail(e.target.value)}
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
                    onChange={e => setPassword(e.target.value)}
                />

                <Button type='submit' variant='contained' onClick={loginUser}>Login</Button>

                {/* If user forgets password, this gives help :) */}
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
                

                {/* If user doesn't have an account, a link to SignUp form */}
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