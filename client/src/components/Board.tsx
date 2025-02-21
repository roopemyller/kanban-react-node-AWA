import { useBoard } from '../context/BoardContext'
import { useState } from 'react'
import Column from './Column'
import { MenuItem, Container, Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material"
import ReactQuill from "react-quill-new"
import "react-quill/dist/quill.snow.css"

import {DndContext, closestCorners, KeyboardSensor, useSensor, useSensors, MouseSensor } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'


const Board = () => {
    const { board, setBoard } = useBoard()
    const [boardName, setBoardName] = useState('')
    const [columnTitle, setColumnTitle] = useState('')
    const [ticketTitle, setTicketTitle] = useState('')
    const [ticketDesc, setTicketDesc] = useState('')
    const [ticketColor, setTicketColor] = useState<string>('#3b3b3b')
    const [isColumnPopupOpen, setIsColumnPopupOpen] = useState(false)
    const [isTicketPopupOpen, setIsTicketPopupOpen] = useState(false)
    const [selectedColumnId, setSelectedColumnId] = useState<string>('')
    const colorOptions = ['#3b3b3b', '#f28c28', '#4caf50', '#2196f3', '#9c27b0']

    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 10,
        }
    })
    
    const sensors = useSensors(mouseSensor, useSensor(KeyboardSensor))
    

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
                backgroundColor: ticketColor,
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
            setTicketColor('#ffffff')
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

    // Handlign the reordering with drag and drop
    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        if (!over) return;
    
        if (active.data.current?.columnId) {
            // Moving a ticket
            const activeColumnId = active.data.current.columnId;
            // When dropping on a column, use the column's id directly
            const overColumnId = over.data.current?.columnId || over.id;
            
            const activeColumn = board.columns.find(col => col._id === activeColumnId);
            const overColumn = board.columns.find(col => col._id === overColumnId);
    
            if (!activeColumn || !overColumn) return;
    
            const activeTicket = activeColumn.tickets.find(ticket => ticket._id === active.id);
            if (!activeTicket) return;
    
            let updatedColumns = [...board.columns];
    
            if (activeColumn._id === overColumn._id) {
                // Moving within the same column
                const columnIndex = updatedColumns.findIndex(col => col._id === activeColumn._id);
                const updatedTickets = [...activeColumn.tickets];
                const oldIndex = updatedTickets.findIndex(t => t._id === active.id);
                
                // If dropping on a ticket, use its position, otherwise append to the end
                const newIndex = over.data.current?.columnId 
                    ? updatedTickets.findIndex(t => t._id === over.id)
                    : updatedTickets.length;
    
                updatedTickets.splice(oldIndex, 1);
                updatedTickets.splice(newIndex, 0, activeTicket);
    
                updatedColumns[columnIndex] = {
                    ...activeColumn,
                    tickets: updatedTickets
                };
            } else {
                // Moving between columns
                const sourceColumnIndex = updatedColumns.findIndex(col => col._id === activeColumn._id);
                const targetColumnIndex = updatedColumns.findIndex(col => col._id === overColumn._id);
    
                // Remove from source column
                const updatedSourceTickets = activeColumn.tickets.filter(t => t._id !== active.id);
                updatedColumns[sourceColumnIndex] = {
                    ...activeColumn,
                    tickets: updatedSourceTickets
                };
    
                // Add to target column
                const updatedTargetTickets = [...overColumn.tickets];
                
                if (over.data.current?.columnId) {
                    // Dropping on a specific ticket
                    const overIndex = updatedTargetTickets.findIndex(t => t._id === over.id);
                    updatedTargetTickets.splice(overIndex, 0, activeTicket);
                } else {
                    // Dropping anywhere on the column - add to the beginning
                    updatedTargetTickets.unshift(activeTicket);
                }
    
                updatedColumns[targetColumnIndex] = {
                    ...overColumn,
                    tickets: updatedTargetTickets
                };
            }
    
            setBoard({ ...board, columns: updatedColumns });
        } else {
            // Moving a column
            const oldIndex = board.columns.findIndex((col) => col._id === active.id);
            const newIndex = board.columns.findIndex((col) => col._id === over.id);
    
            const newColumns = arrayMove(board.columns, oldIndex, newIndex);
            setBoard({ ...board, columns: newColumns });
    
            const columnOrder = newColumns.map((col) => col._id);
    
            try {
                const response = await fetch('http://localhost:3000/api/columns/reorder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                        boardId: board._id,
                        columnOrder,
                    }),
                });
    
                const data = await response.json();
                if (response.ok) {
                    console.log('Columns reordered successfully');
                } else {
                    console.error('Failed to reorder columns', data);
                }
            } catch (error) {
                console.error('Error sending reordered columns:', error);
            }
        }
    };

    return (
        <Container maxWidth="xl" sx={{  padding: '2', border: '2px solid grey', borderRadius: '5px', backgroundColor: 'rgb(59, 59, 59)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', margin: 2, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>
                    <Typography variant='h4' align="left">{board.title}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Button sx={{marginLeft: 2, marginRight: 2}} variant="contained" onClick={() => setIsTicketPopupOpen(true)}>Add Ticket</Button>
                    <Button variant="contained" onClick={() => setIsColumnPopupOpen(true)}>Add Column</Button>
                </Box>
            </Box>

            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <SortableContext items={board.columns.map(col => col._id)} strategy={verticalListSortingStrategy}>
                    <Box sx={{ display: "flex", overflowX: "auto", gap: 2, padding: 2, minHeight: "80vh", "@media (max-width: 600px)": { flexDirection: "column", alignItems: "center", }, }}>
                        {board.columns.map((col) => (
                            <Column key={col._id} id={col._id} title={col.title} />
                        ))}
                    </Box>
                </SortableContext>
            </DndContext>


            {/* If "Add column" button is pressed, a popup is presented with option to give column a name and add it*/}
            <Dialog open={isColumnPopupOpen} onClose={() => setIsColumnPopupOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add New Column</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Title" fullWidth value={columnTitle} onChange={(e) => setColumnTitle(e.target.value)}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={addColumn} variant="contained" color="success">Add</Button>
                    <Button onClick={() => setIsColumnPopupOpen(false)} variant="outlined" color="error">Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* If "Add ticket" button is pressed, a popup is presented with option to give ticket a name and add it*/}
            <Dialog open={isTicketPopupOpen} onClose={() => setIsColumnPopupOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add New Ticket</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Title" fullWidth value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)}/>
                    <ReactQuill 
                        placeholder="Description" 
                        style={{ marginBottom: 10, marginTop: 5 }} 
                        value={ticketDesc} 
                        onChange={setTicketDesc} 
                    />
                    <TextField id="outlined-select" onChange={(e) => setSelectedColumnId(e.target.value)} select defaultValue="" label="Column" helperText="Please select a column" fullWidth>
                        {board.columns.map((col) => (
                            <MenuItem key={col._id} value={col._id}>
                                {col.title}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                        {colorOptions.map((color) => (
                            <Box
                                key={color}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    backgroundColor: color,
                                    cursor: 'pointer',
                                    boxShadow: ticketColor === color ? 2 : 0,
                                    border: ticketColor === color ? '2px solid #000' : 'none',
                                }}
                                onClick={() => setTicketColor(color)}
                            />
                        ))}
                    </Box>


                </DialogContent>
                <DialogActions>
                    <Button onClick={addTicket} variant="contained" color="success">Add</Button>
                    <Button onClick={() => { setIsTicketPopupOpen(false); setTicketDesc(''); setTicketTitle('')}} variant="outlined" color="error">Cancel</Button>
                </DialogActions>
            </Dialog>
        </Container>
    )
}

export default Board