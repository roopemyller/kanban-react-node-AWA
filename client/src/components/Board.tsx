import { useBoard } from '../context/BoardContext'
import { useState } from 'react'
import Column from './Column'
import CheckIcon from '@mui/icons-material/Check'
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb'
import { MenuItem, Container, Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Typography } from "@mui/material";



const Board = () => {
    const { board, setBoard } = useBoard()
    const [boardName, setBoardName] = useState('')
    const [columnTitle, setColumnTitle] = useState('')
    const [ticketTitle, setTicketTitle] = useState('')
    const [ticketDesc, setTicketDesc] = useState('')
    const [isColumnPopupOpen, setIsColumnPopupOpen] = useState(false)
    const [isTicketPopupOpen, setIsTicketPopupOpen] = useState(false)
    const [selectedColumnId, setSelectedColumnId] = useState<string>('');

    const createBoard = async () => {
        const response = await fetch('http://localhost:3000/api/boards/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ title: boardName})
        })

        const data = await response.json()
        if (response.ok) setBoard(data)
    }

    const addColumn = async () => {
        if (!columnTitle.trim()) return
        const response = await fetch('http://localhost:3000/api/columns/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ title: columnTitle, boardId: board?._id }),
        })

        const data = await response.json();
        if (response.ok) {
          if (!board) return <p>Loading board...</p>;
          setBoard({ ...board, columns: [...board.columns, { ...data, tasks: data.tasks || [] }] })
          setColumnTitle('')
          setIsColumnPopupOpen(false)
        }
    }

    const addTicket = async () => {
        if (!ticketTitle.trim() || !selectedColumnId || !board) return

        const response = await fetch('http://localhost:3000/api/tickets/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
                title: ticketTitle,
                description: ticketDesc,
                columnId: selectedColumnId,
            }),
        })

        const data = await response.json()
        if (response.ok) {
            setBoard((prevBoard) => ({
                ...prevBoard!,
                columns: prevBoard?.columns?.map(col =>
                    col._id === selectedColumnId
                        ? { ...col, tickets: [...(col.tickets || []), data.ticket] }
                        : col
                ) || [],
            }))
            setTicketTitle('')
            setTicketDesc('')
            setSelectedColumnId('')
            setIsTicketPopupOpen(false)
        }else {
            console.error("Failed to add ticket", data)
        }
    }

    if (!board) {
        return (
            <Container maxWidth="xl" sx={{  padding: '1', border: '2px solid grey', borderRadius: '5px', backgroundColor: 'rgb(59, 59, 59)' }}>
                <Box style={{ textAlign: 'left', margin: 20}}>
                    <Typography variant='h6'>Start by creating your own Kanban Board!</Typography>
                    <br/>
                    <TextField
                        variant="outlined" value={boardName} onChange={(e) => setBoardName(e.target.value)} label="Board Name" autoFocus fullWidth
                    />
                    <br/><br/>
                    <Button onClick={createBoard} variant='contained'>Create Board</Button>
                </Box>
            </Container>
        )
    }

    return (
        <Container maxWidth="xl" sx={{  padding: '2', border: '2px solid grey', borderRadius: '5px', backgroundColor: 'rgb(59, 59, 59)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', margin: 2, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>
                    <Typography variant='h4'>{board.title}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Button sx={{marginLeft: 2, marginRight: 2}} variant="contained" onClick={() => setIsTicketPopupOpen(true)}>Add Ticket</Button>
                    <Button variant="contained" onClick={() => setIsColumnPopupOpen(true)}>Add Column</Button>
                </Box>
            </Box>
            <Box sx={{ display: "flex", overflowX: "auto", gap: 2, padding: 2, minHeight: "80vh", "@media (max-width: 600px)": { flexDirection: "column", alignItems: "center", }, }}>
                {board.columns.map((col) => (
                    <Column key={col._id} id={col._id} title={col.title} />
                ))}
            </Box>

            {/* If "Add column" button is pressed, a popup is presented with option to give column a name and add it*/}
            {isColumnPopupOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ background: 'rgb(72, 72, 72)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <h2>Add Column</h2>
                    <TextField
                        variant="outlined" value={columnTitle} onChange={(e) => setColumnTitle(e.target.value)} label="Column Title" autoFocus fullWidth
                    />
                    <br/><br/>
                    <Button sx={{margin: '5px'}} variant="contained" color="success" onClick={addColumn}><CheckIcon/></Button>
                    <Button sx={{margin: '5px'}} variant="outlined" color="error" onClick={() => { setIsColumnPopupOpen(false); setColumnTitle('')}}><DoNotDisturbIcon/></Button>
                </div>
            </div>
            )}

            {/* If "Add ticket" button is pressed, a popup is presented with option to give ticket a name and add it*/}
            {isTicketPopupOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ background: 'rgb(72, 72, 72)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <h2>Add Ticket</h2>
                    <TextField
                        variant="outlined" value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)} label="Ticket Title" autoFocus fullWidth
                    />
                    <br/><br/>
                    <TextField
                        multiline maxRows={6} variant="outlined" value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)} label="Ticket Description" fullWidth
                    />
                    <br/><br/>
                    <TextField
                        id="outlined-select-currency" onChange={(e) => setSelectedColumnId(e.target.value)} select defaultValue="" label="Column" helperText="Please select a column" fullWidth
                    >
                        {board.columns.map((col) => (
                            <MenuItem key={col._id} value={col._id}>
                                {col.title}
                            </MenuItem>
                        ))}
                    </TextField>
                    <br/><br/>
                    <Button sx={{margin: '5px'}} variant="contained" color="success" onClick={addTicket}><CheckIcon/></Button>
                    <Button sx={{margin: '5px'}} variant="outlined" color="error" onClick={() => {setIsTicketPopupOpen(false); setTicketDesc(''); setTicketTitle('')}}><DoNotDisturbIcon/></Button>
                </div>
            </div>
            )}
        </Container>
    )
}

export default Board