import DeleteIcon from '@mui/icons-material/Delete'
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import Ticket from './Ticket';

interface ColumnProps {
    id: string;
    title: string;
}

const Column = ({ id, title }: ColumnProps) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const { board, setBoard } = useBoard();
    const tickets = board?.columns.find(col => col._id === id)?.tickets ||[]

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
        <Box sx={{ p: 2, border: "1px solid black", minHeight: 400, flexGrow: 1, borderRadius: 1 }}>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant='h5' align="left">{title}</Typography>
                <Button onClick={() => setIsPopupOpen(true)} variant="outlined" color="error" sx={{margin: '10px'}} size="small"><DeleteIcon/></Button>
            </Box>

            <Box>
                {tickets.length > 0 ? (
                    tickets.map(ticket => (
                        <Ticket key={ticket._id} id={ticket._id} title={ticket.title} description={ticket.description} columnId={id} backgroundColor={ticket.backgroundColor}/>
                    ))
                ) : (
                    <Typography variant="body1">No tickets yet</Typography>
                )}
            </Box>

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