import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import MuiCard from '@mui/material/Card'
import {Link, useNavigate} from 'react-router-dom'
import { useState } from 'react'

// Signup form
const SignUp = () => {
    const navigate = useNavigate();
    // States for users and signup form fields
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    // Add user function, called when form is submitted
    const addUser = async () => {
        const response = await fetch('http://localhost:3000/api/user/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        })

        if(response.ok){
            /* 
            If response ok
            - get the data (created new user)
            - set form empty
            - change page to home
            */
            const newUser = await response.json()
            console.log(newUser)
            setName('')
            setEmail('')
            setPassword('')
            navigate('/login')
          }else{
            setError('Error trying to sign up')
          }
      }
    return (
        <>
        <MuiCard variant='outlined'>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding:"50px 120px" }}>
                <Typography variant='h3'>
                    Sign Up
                </Typography>

                {error && (
                  <Typography color="error" textAlign="center">
                    {error}
                  </Typography>
                )}

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
                    onChange={e => setName(e.target.value)}
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
                    onChange={e => setEmail(e.target.value)}
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
                    onChange={e => setPassword(e.target.value)}
                />

                <Button type='submit' variant='contained' onClick={addUser}>Register</Button>

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