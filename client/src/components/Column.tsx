import * as React from 'react'
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Menu, MenuItem, TextField } from "@mui/material"
import { useState } from 'react'
import { ITicket, useBoard } from '../context/BoardContext'
import Ticket from './Ticket'
import { SortableContext, useSortable, verticalListSortingStrategy  } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import IconButton from '@mui/material/IconButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'

// ColumnProps interface
interface ColumnProps {
    id: string
    title: string
    tickets?: ITicket[]
    backgroundColor: string
}

const Column = ({ id, title, tickets: passedTickets, backgroundColor }: ColumnProps = {id: "", title: "", backgroundColor: ""}) => {
    // States and other things for the board and columns
    const { board, setBoard } = useBoard()
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false)
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false)
    const [columnTitle, setColumnTitle] = useState(title)
    const [columnColor, setColumnColor] = useState(backgroundColor || '#3b3b3b')
    const tickets = passedTickets || board?.columns.find(col => col._id === id)?.tickets || [];
    const column = board?.columns.find(col => col._id === id)
        
    // Column color options, gray, orange, green, blue, purple
    const colorOptions = ['#3b3b3b', '#37474f', '#546e7a', '#78909c', '#b0bec5']

    // DnD Kit things for the column
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        zIndex: isDragging ? 999 : 'auto',
    } 

    // States and functions for the ticket menu (...) button
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    // If board is not loaded yet, return empty fragment
    if (!board){
        return (
            <></>
        )
    }

    // Function to remove column with DELETE request sent to the server and removing the column from db
    const removeColumn = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/columns/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })

            // If backend ok, set the board with the column removed
            if (response.ok && board) {
                setBoard({
                    ...board,
                    _id: board._id ?? '',
                    title: board.title ?? '',
                    columns: board.columns.filter((col) => col._id !== id),
                })
            }
        } catch (error) {
            console.error('Error removing column:', error)
        }
    }
    
    // Function to edit column with PUT request sent to the server and updating the column in db
    const editColumn = async () => {
        if (!columnTitle.trim()) return
        try {
            const response = await fetch(`http://localhost:3000/api/columns/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    title: columnTitle,
                    backgroundColor: columnColor,
                }),
            })
            const updatedColumn = await response.json()
            // If response ok, update board state by editing the column
            if (response.ok && board) {
                setBoard({
                    ...board,
                    columns: board.columns.map(col =>
                        col._id === id ? { ...col, title: updatedColumn.title, backgroundColor: updatedColumn.backgroundColor } : col
                    ),
                })
            } else {
                console.error('Failed to edit ticket')
            }
        } catch (error) {
            console.error('Error editing ticket:', error)
        } finally {
            setIsEditPopupOpen(false)
        }
    }

    return (
        // Column component with header and button to remove it and also the list of tickets inside DnD Kit SortableContext
        <Box ref={setNodeRef} style={style} {...attributes} {...listeners} 
            sx={{ 
                backgroundColor: backgroundColor,
                p: 1.5,
                border: isDragging ? '2px dashed #666' : '1px solid black',
                minHeight: 400,
                width: 205,
                height: 'fit-content',
                flexGrow: 1,
                borderRadius: 1,
                transition: 'all .07s ease',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': { borderColor: tickets.length === 0 ? '#777' : 'inherit'},
                "@media (max-width: 1200px)": { width: 'calc(100% - 16px)' },
                "@media (max-width: 650px)": { width: 270 },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography onDoubleClick={() => {setIsEditPopupOpen(true); setColumnTitle(title)}} variant='h5' align="left">{title}</Typography>
                <IconButton id="basic-button" aria-controls={open ? 'basic-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={handleClick}>
                    <MoreVertIcon/>
                </IconButton>
                <Menu id="ticket-menu" anchorEl={anchorEl} open={open} onClose={handleClose} MenuListProps={{'aria-labelledby': 'basic-button',}}>
                    <MenuItem onClick={() => {setIsEditPopupOpen(true); setColumnTitle(title); handleClose()}}>Edit</MenuItem>
                    <MenuItem onClick={() => {setIsDeletePopupOpen(true); handleClose()}}>Delete</MenuItem>
                </Menu>
            </Box>
            <SortableContext items={column?.tickets?.map(ticket => ticket._id) || []} strategy={verticalListSortingStrategy}>
                <Box 
                    sx={{ flex: 1, minHeight: '300px', display: 'flex', flexDirection: 'column', 
                        ...(tickets.length === 0 && {
                            border: '2px dashed #666',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        })
                    }}
                >
                    {tickets.length > 0 ? (
                            <Box sx={{width: '100%'}}>
                                {(tickets.map(ticket => (
                                    <Ticket key={ticket._id} newTicket={ticket} columnId={id}/>
                                ))
                            )}
                            </Box>
                    ) : (
                        <Typography variant="body1" sx={{ color: '#888', userSelect: 'none', pointerEvents: 'none'}}>No Tickets!</Typography>
                    )}
                </Box>
            </SortableContext>
            
            {/* Confirmation Popup for deleting column */}
            <Dialog open={isDeletePopupOpen} onClose={() => setIsDeletePopupOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Sure you want to delete this column?</DialogTitle>
                <DialogContent>
                    <Typography>Deleting column named: {title}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={removeColumn} variant="contained" color="success">Delete</Button>
                    <Button onClick={() => setIsDeletePopupOpen(false)} variant="outlined" color="error">Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Column Popup */}
            <Dialog open={isEditPopupOpen} onClose={() => setIsEditPopupOpen(false)} fullWidth maxWidth="sm" aria-labelledby="delete-dialog-title" keepMounted={false} disablePortal>
                <DialogTitle>Edit Column</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Title" fullWidth value={columnTitle} onChange={(e) => setColumnTitle(e.target.value)}/>
                    <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                        {colorOptions.map((color) => (
                            <Box key={color} sx={{ width: 40, height: 40, borderRadius: 2, backgroundColor: color, cursor: 'pointer', boxShadow: columnColor === color ? 2 : 0, border: columnColor === color ? '2px solid #000' : 'none', }} onClick={() => setColumnColor(color)}/>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={editColumn} variant="contained" color="success">Confirm</Button>
                    <Button onClick={() => { setIsEditPopupOpen(false); setColumnTitle('')}} variant="outlined" color="error">Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default Column