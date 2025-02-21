
import * as React from 'react'
import IconButton from '@mui/material/IconButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useBoard } from '../context/BoardContext'
import { Menu, MenuItem, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";

import { useSortable  } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TicketProps {
    id: string
    title: string
    description: string
    columnId: string
    backgroundColor: string
}

const Ticket = ({ id, title, description, columnId, backgroundColor }: TicketProps) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const { board, setBoard } = useBoard()
    const [ isDeletePopupOpen, setIsDeletePopupOpen ] = React.useState(false)

    const open = Boolean(anchorEl)
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { columnId } });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        zIndex: isDragging ? 999 : 'auto',
    }

    const deleteTicket = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/tickets/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })

            if (response.ok && board) {
                // Update board state by removing the ticket from the correct column
                setBoard({
                    ...board,
                    columns: board.columns.map(col =>
                        col._id === columnId
                            ? { ...col, tickets: col.tickets.filter(ticket => ticket._id !== id) }
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

    
    return (
        <Box ref={setNodeRef} style={style} {...attributes} {...listeners} key={id} sx={{ p: 1, border: "1px solid grey", borderRadius: 1, mb: 2, backgroundColor: backgroundColor }}>
            <Box  sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography  variant="h6" style={{marginLeft: '20px'}}>{title}</Typography >
                <IconButton id="basic-button" aria-controls={open ? 'basic-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={handleClick}>
                    <MoreVertIcon/>
                </IconButton>
                <Menu
                    id="ticket-menu" anchorEl={anchorEl} open={open} onClose={handleClose} MenuListProps={{'aria-labelledby': 'basic-button',}}
                >
                    <MenuItem onClick={handleClose}>Edit</MenuItem>
                    <MenuItem onClick={() => { handleClose(); setIsDeletePopupOpen(true)}}>Delete</MenuItem>
                </Menu>
            </Box>
            <Typography variant='body2' align="left" dangerouslySetInnerHTML={{ __html: description }}/>

            {/* Confirmation Popup for deleting ticket */}
            <Dialog open={isDeletePopupOpen} onClose={() => setIsDeletePopupOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Sure you want to delete this ticket?</DialogTitle>
                <DialogContent>
                    <Typography>Deleting ticket with title "{title}"</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={deleteTicket} variant="contained" color="success">Delete</Button>
                    <Button onClick={() => setIsDeletePopupOpen(false)} variant="outlined" color="error">Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default Ticket