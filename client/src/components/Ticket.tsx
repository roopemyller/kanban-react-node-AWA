
import * as React from 'react'
import IconButton from '@mui/material/IconButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useBoard } from '../context/BoardContext'
import { Menu, MenuItem, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField } from "@mui/material";
import { useSortable  } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react';
import ReactQuill from 'react-quill-new';


// TicketProps interface
interface TicketProps {
    newTicket: {
        _id: string
        title: string
        description: string
        backgroundColor: string
        date: string
    }
    columnId: string
}

const Ticket = ({ newTicket, columnId }: TicketProps) => {

    // States and other things for the ticket
    const { board, setBoard } = useBoard()
    const [ isDeletePopupOpen, setIsDeletePopupOpen ] = React.useState(false)
    const [ticketTitle, setTicketTitle] = useState('')
    const [ticketDesc, setTicketDesc] = useState('')
    const [ticketColor, setTicketColor] = useState<string>('#3b3b3b')
    const [isTicketPopupOpen, setIsTicketPopupOpen] = useState(false)

    // Ticket color options, gray, orange, green, blue, purple
    const colorOptions = ['#3b3b3b', '#f28c28', '#4caf50', '#2196f3', '#9c27b0']

    // States and functions for the ticket menu (...) button
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    const formattedDate = new Date(newTicket.date).toLocaleDateString('fi-FI', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    const formattedTime = new Date(newTicket.date).toLocaleTimeString('fi-FI', {
        hour: '2-digit',
        minute: '2-digit',
    });

    // DnD Kit things for the ticket
    const id = newTicket._id
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { columnId }, disabled: isDeletePopupOpen || isTicketPopupOpen });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        zIndex: isDragging ? 999 : 'auto',
    }
    
    // Function to remove ticket with DELETE request sent to the server and removing the ticket from db
    const deleteTicket = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/tickets/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            
            // If response ok, update board state by removing the ticket from the correct column
            if (response.ok && board) {
                setBoard({
                    ...board,
                    columns: board.columns.map(col =>
                        col._id === columnId
                            ? { ...col, tickets: col.tickets.filter(ticket => ticket._id !== newTicket._id) }
                            : col
                    ),
                })
            } else {
                console.error('Failed to remove ticket')
            }
        } catch (error) {
            console.error('Error removing ticket:', error)
        } finally {
            setIsDeletePopupOpen(false)
        }
    }

    // Function to edit ticket with PUT request sent to the server and updating the ticket in db
    const editTicket = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/tickets/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    title: ticketTitle,
                    description: ticketDesc,
                    backgroundColor: ticketColor,
                }),
            })
            // If response ok, update board state by updating the ticket in the correct column
            if (response.ok && board) {
                setBoard({
                    ...board,
                    columns: board.columns.map(col =>
                        col._id === columnId
                            ? {
                                ...col,
                                tickets: col.tickets.map(ticket =>
                                    ticket._id === newTicket._id
                                        ? {
                                            ...ticket,
                                            title: ticketTitle,
                                            description: ticketDesc,
                                            backgroundColor: ticketColor,
                                        }
                                        : ticket
                                ),
                            }
                            : col
                    ),
                })
            } else {
                console.error('Failed to edit ticket')
            }
        } catch (error) {
            console.error('Error editing ticket:', error)
        } finally {
            setIsTicketPopupOpen(false)
        }
    }
    
    return (
        // Ticket component with title, description as rich text and menu button to edit or delete the ticket
        <Box ref={setNodeRef} style={style} {...attributes} {...listeners} key={newTicket._id} sx={{ p: 1, border: "1px solid grey", borderRadius: 1, mb: 2, backgroundColor: newTicket.backgroundColor, '&:hover': { borderColor: 'inherit'},}}>
            <Box  sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography  variant="h6">{newTicket.title}</Typography >
                <IconButton id="basic-button" aria-controls={open ? 'basic-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={handleClick}>
                    <MoreVertIcon/>
                </IconButton>
                <Menu
                    id="ticket-menu" anchorEl={anchorEl} open={open} onClose={handleClose} MenuListProps={{'aria-labelledby': 'basic-button',}}
                >
                    <MenuItem onClick={() => {
                        handleClose()
                        setTicketTitle(newTicket.title)
                        setTicketDesc(newTicket.description)
                        setTicketColor(newTicket.backgroundColor)
                        setIsTicketPopupOpen(true)
                    }}>Edit</MenuItem>
                    <MenuItem onClick={() => { handleClose(); setIsDeletePopupOpen(true)}}>Delete</MenuItem>
                </Menu>
            </Box>
            <Typography variant='body2' align="left" dangerouslySetInnerHTML={{ __html: newTicket.description }}/>
            <Typography variant='body2' sx={{fontSize: 12}} align="left">Created:<br/>{formattedDate} at {formattedTime}</Typography>

            {/* Confirmation Popup for deleting ticket */}
            <Dialog open={isDeletePopupOpen} onClose={() => setIsDeletePopupOpen(false)} fullWidth maxWidth="sm" aria-labelledby="delete-dialog-title" keepMounted={false} disablePortal>
                <DialogTitle>Sure you want to delete this ticket?</DialogTitle>
                <DialogContent>
                    <Typography>Deleting ticket with title "{newTicket.title}"</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={deleteTicket} variant="contained" color="success">Delete</Button>
                    <Button onClick={() => setIsDeletePopupOpen(false)} variant="outlined" color="error">Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* If "Edit ticket" button is pressed, a popup is presented with option to edit ticket a name, description using rich text editor, and the color, options for adding changes or canceling*/}
            <Dialog open={isTicketPopupOpen} onClose={() => setIsTicketPopupOpen(false)} fullWidth maxWidth="sm" aria-labelledby="delete-dialog-title" keepMounted={false} disablePortal>
                <DialogTitle>Edit Ticket</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Title" fullWidth value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)}/>
                    <ReactQuill placeholder="Description" style={{ marginBottom: 10, marginTop: 5 }} value={ticketDesc} onChange={setTicketDesc}/>
                    <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                        {colorOptions.map((color) => (
                            <Box key={color} sx={{ width: 40, height: 40, borderRadius: 2, backgroundColor: color, cursor: 'pointer', boxShadow: ticketColor === color ? 2 : 0, border: ticketColor === color ? '2px solid #000' : 'none', }} onClick={() => setTicketColor(color)}/>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={editTicket} variant="contained" color="success">Add</Button>
                    <Button onClick={() => { setIsTicketPopupOpen(false); setTicketDesc(''); setTicketTitle('')}} variant="outlined" color="error">Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default Ticket