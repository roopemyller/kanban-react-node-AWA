import DeleteIcon from '@mui/icons-material/Delete'
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material"
import { useState } from 'react'
import { useBoard } from '../context/BoardContext'
import Ticket from './Ticket'

import { SortableContext, useSortable, verticalListSortingStrategy  } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ColumnProps {
    id: string;
    title: string;
}

const Column = ({ id, title }: ColumnProps = {id: "", title: ""}) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const { board, setBoard } = useBoard();
    const tickets = board?.columns.find(col => col._id === id)?.tickets ||[]
    const column = board?.columns.find(col => col._id === id)
        
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        zIndex: isDragging ? 999 : 'auto',
    } 

    if (!board){
        return (
            <></>
        )
    }

    const removeColumn = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/columns/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })

            if (response.ok && board) {
                setBoard({
                    ...board,
                    _id: board._id ?? '',
                    title: board.title ?? '',
                    columns: board.columns.filter((col) => col._id !== id),
                });            }
        } catch (error) {
            console.error('Error removing column:', error)
        }
    }
    
    return (
        <Box 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            sx={{ 
                backgroundColor: '#3b3b3b',
                p: 2,
                border: isDragging 
                    ? '2px dashed #666' 
                    : '1px solid black',
                minHeight: 400,
                height: '100%',
                flexGrow: 1,
                borderRadius: 1,
                transition: 'all 0.05s',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                    backgroundColor: '#404040',
                    borderColor: tickets.length === 0 ? '#777' : 'inherit',
                }
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant='h5' align="left">{title}</Typography>
                <Button onClick={() => {setIsPopupOpen(true)}} variant="outlined" color="error" sx={{margin: '10px'}} size="small"><DeleteIcon/></Button>
            </Box>
            <SortableContext items={column?.tickets?.map(ticket => ticket._id) || []} strategy={verticalListSortingStrategy}>
                <Box 
                    sx={{ 
                        flex: 1,
                        minHeight: '300px',
                        display: 'flex',
                        flexDirection: 'column',
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
                                    <Ticket 
                                        key={ticket._id} 
                                        id={ticket._id} 
                                        title={ticket.title}
                                        description={ticket.description} 
                                        columnId={id} 
                                        backgroundColor={ticket.backgroundColor}
                                    />
                                ))
                            )}
                            </Box>
                    ) : (
                        <Typography variant="body1" sx={{ color: '#888', userSelect: 'none', pointerEvents: 'none'}}>No Tickets!</Typography>
                    )}
                </Box>
            </SortableContext>


            <Dialog open={isPopupOpen} onClose={() => setIsPopupOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Sure you want to delete this column?</DialogTitle>
                <DialogContent>
                    <Typography>Deleting column named: {title}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={removeColumn} variant="contained" color="success">Delete</Button>
                    <Button onClick={() => setIsPopupOpen(false)} variant="outlined" color="error">Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default Column