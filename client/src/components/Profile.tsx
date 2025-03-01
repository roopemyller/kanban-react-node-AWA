import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import MuiCard from '@mui/material/Card'
import React, { useEffect, useState } from 'react'
import { Avatar, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'

// UserData interface
interface UserData {
  name: string
  email: string
  createdAt: string
  profilePicture?: string
}

// Profile settings page
const Profile = () => {
    // States for data, errors, editing user profile
    const [userData, setUserData] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isEditMode, setIsEditMode] = useState(false)
    const [editedName, setEditedName] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>('')
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Handle user profile picture file selecting
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file){
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    // Handle profile editing
    const editProfile = async () => {
        try {
            // Edited fields to FormData
            const formData = new FormData()
            formData.append('name', editedName)
            if (selectedFile) {
                formData.append('profilePicture', selectedFile)
            }
            const response = await fetch('http://localhost:3000/api/users/edit', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData
            })
            // If response is ok, get the updated user and set it, set new username and profilepicture to localstorage
            if (response.ok) {
                const updatedUser = await response.json()
                setUserData(updatedUser)
                setIsEditMode(false)
                setSelectedFile(null)
                setPreviewUrl('')
                localStorage.setItem('userName', updatedUser.name)
                localStorage.setItem('profilePicture', updatedUser.profilePicture)
            } else {
                alert("Error while editing profile, most likely not a image file or filesize over 5Mb")
            }
        } catch (err) {
            console.log("Error updating user data")
        }
    }

    // Fetch userdata on page load
    useEffect(() => {
        const fetchUserData = async () => {
            try {
              const response = await fetch('http://localhost:3000/api/users/profile', {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              })
      
              if (!response.ok) {
                console.log('Failed to fetch user data');
              }
              const data = await response.json();
              setEditedName(data.name)
              setUserData(data)
              setError('')
            } catch (err) {
                console.log("Error loading user data")
            } finally {
              setLoading(false)
            }
          }
      
          fetchUserData()
        }, [])

    // Return something else when data is still loading/error in the data or no data at all
    if (loading) return <Typography>Loading...</Typography>
    if (error) return <Typography color="error">{error}</Typography>
    if (!userData) return <Typography>No user data found</Typography>

    return (
        <>
        {/* Profile settings */}
        <MuiCard variant='outlined'>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding:"50px 120px" , alignItems: 'center'}}>
                <Avatar src={userData?.profilePicture ? `http://localhost:3000${userData.profilePicture}` : undefined} sx={{width: 120, height: 120}}></Avatar>
                <Typography variant='h3'>User Profile</Typography>
                <Box sx={{ width: '100%', maxWidth: 400 }}>
                <Box sx={{ mb: 2 }}>
                    <FormLabel>Name</FormLabel>
                    <Typography variant="body1">{userData.name}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mb: 2 }}>
                    <FormLabel>Email</FormLabel>
                    <Typography variant="body1">{userData.email}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mb: 2 }}>
                    <FormLabel>User Since</FormLabel>
                    <Typography variant="body1">
                    {new Date(userData.createdAt).toLocaleDateString()}
                    </Typography>
                </Box>
                    <Button onClick={() => setIsEditMode(true)} variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                        Edit Profile
                    </Button>
                </Box>
            </Box>
            {/* If "Edit profile" button is pressed, a popup is presented with option to edit profile user name and profile picture*/}
            <Dialog open={isEditMode} onClose={() => setIsEditMode(false)} fullWidth maxWidth="sm" aria-labelledby="delete-dialog-title" keepMounted={false} disablePortal>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogContent sx={{alignContent: 'center', alignItems: 'center'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, p: 2, alignItems: 'center'}}>
                        <Avatar 
                            src={previewUrl || (userData?.profilePicture ? `http://localhost:3000${userData.profilePicture}` : undefined)} 
                            sx={{ width: 120, height: 120, cursor: 'pointer', '&:hover': {opacity: 0.8}}}
                            onClick={() => fileInputRef.current?.click()}
                        />
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileSelect}/>
                    </Box>
                    <Typography>Max file size 5Mb</Typography>
                    <TextField autoFocus margin="dense" label="Name" fullWidth value={editedName} onChange={(e) => setEditedName(e.target.value)}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={editProfile} variant="contained" color="success">Add</Button>
                    <Button onClick={() => { setIsEditMode(false); setEditedName(''); setPreviewUrl('') }} variant="outlined" color="error">Cancel</Button>
                </DialogActions>
            </Dialog>
        </MuiCard>
        </>
    )
  }
  
  export default Profile