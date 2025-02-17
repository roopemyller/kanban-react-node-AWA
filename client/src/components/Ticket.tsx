
import * as React from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useBoard } from '../context/BoardContext'

interface TicketProps {
    id: string
    title: string
    description: string
    columnId: string
}

const Ticket = ({ id, title, description, columnId }: TicketProps) => {
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
        <div key={id} style={{ padding: '5px', border: '1px solid grey', borderRadius: '5px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{marginLeft: '20px'}}>{title}</h3>
                <IconButton id="basic-button" aria-controls={open ? 'basic-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={handleClick}>
                    <MoreVertIcon/>
                </IconButton>
                <Menu
                    id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose} MenuListProps={{'aria-labelledby': 'basic-button',}}
                >
                    <MenuItem onClick={handleClose}>Edit</MenuItem>
                    <MenuItem onClick={() => { handleClose(); setIsDeletePopupOpen(true)}}>Delete</MenuItem>
                </Menu>
            </div>
            <p>{description}</p>

            {/* Confirmation Popup */}
            {isDeletePopupOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: 'rgb(37, 37, 37)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                        <h2>Are you sure you want to delete this ticket?</h2>
                        <br />
                        <Button variant="contained" color="success" sx={{ margin: '5px' }} onClick={deleteTicket}>Delete</Button>
                        <Button variant="outlined" color="error" sx={{ margin: '5px' }} onClick={() => setIsDeletePopupOpen(false)}>Cancel</Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Ticket