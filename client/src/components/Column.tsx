import DeleteIcon from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
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
        <div style={{ padding: '10px', border: '1px solid black', minHeight: '400px', flexGrow: 1,borderRadius: '5px'}}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ textAlign: 'center' }}>{title}</h3>
                <Button onClick={() => setIsPopupOpen(true)} variant="outlined" color="error" sx={{margin: '10px'}} size="small"><DeleteIcon/></Button>
            </div>

            <div>
                {tickets.length > 0 ? (
                    tickets.map(ticket => (
                        <Ticket key={ticket._id} id={ticket._id} title={ticket.title} description={ticket.description} columnId={id}/>
                    ))
                ) : (
                    <p>No tickets yet</p>
                )}
            </div>
            {isPopupOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ background: 'rgb(37, 37, 37)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <h2>Sure you want to remove column?</h2>
                    <br/>
                    <Button variant="contained" color="success" sx={{margin: '5px'}} onClick={removeColumn}>Remove</Button>
                    <Button variant="outlined" color="error" sx={{margin: '5px'}} onClick={() => setIsPopupOpen(false)}>Cancel</Button>
                </div>
            </div>
            )}
        </div>
    )
}

export default Column