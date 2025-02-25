import { useBoard } from '../context/BoardContext'
import { useState } from 'react'
import Column from './Column'
import { MenuItem, Container, Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material"
import ReactQuill from "react-quill-new"
import "react-quill/dist/quill.snow.css"
import {DndContext, closestCorners, useSensor, useSensors, MouseSensor } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useNavigate } from 'react-router-dom'

const Board = () => {
    const navigate = useNavigate()
    // States and other things for the board
    const { board, setBoard } = useBoard()
    const [boardName, setBoardName] = useState('')
    const [columnTitle, setColumnTitle] = useState('')
    const [ticketTitle, setTicketTitle] = useState('')
    const [ticketDesc, setTicketDesc] = useState('')
    const [ticketColor, setTicketColor] = useState<string>('#3b3b3b')
    const [isColumnPopupOpen, setIsColumnPopupOpen] = useState(false)
    const [isTicketPopupOpen, setIsTicketPopupOpen] = useState(false)
    const [selectedColumnId, setSelectedColumnId] = useState<string>('')

    // Ticket color options, gray, orange, green, blue, purple
    const colorOptions = ['#3b3b3b', '#f28c28', '#4caf50', '#2196f3', '#9c27b0']

    // Drag and drop sensors
    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 10,
        }
    })
    const sensors = useSensors(mouseSensor)

    const handleUnauthorized = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('userName')
        navigate('/login')
    }

    // Function to create a new board, takes the board name and sends a POST request to the backend
    const createBoard = async () => {
        const response = await fetch('http://localhost:3000/api/boards/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ title: boardName})
        })

        if (response.status === 401) {
            handleUnauthorized()
            return
        }

        const data = await response.json()

        // If backend ok, set the board with fetched data
        if (response.ok) {
            setBoard(data)
        }
    }

    // Function to add a column to the board, takes the column title and board Id and sends a POST request to the backend
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

        if (response.status === 401) {
            handleUnauthorized()
            return
        }

        const data = await response.json()

        // If backend ok, add the column to the board and reset the column title and close the popup
        if (response.ok) {
          if (!board) {
              return <p>Loading board...</p>
          } 
          setBoard({ ...board, columns: [...board.columns, { ...data, tasks: data.tasks || [] }] })
          setColumnTitle('')
          setIsColumnPopupOpen(false)
        }
    }

    // Function to add a ticket to the board, takes the ticket title, description, columnId and background color and sends a POST request to the backend
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

        if (response.status === 401) {
            handleUnauthorized()
            return
        }

        const data = await response.json()

        // If backend ok, set the board by adingd the ticket to the selected column and reset the ticket title, description, color and close the popup
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
            setTicketColor('#3b3b3b')
            setSelectedColumnId('')
            setIsTicketPopupOpen(false)
        }else {
            console.error("Failed to add ticket", data)
        }
    }

    // If there is no board for the user in db, present the user with an option to create a new board
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

    // Function to handle the drag and drop of columns and tickets
    const handleDragEnd = async (event: any) => {
        // Get the droppable and draggable elements
        const { active, over } = event
        if (!over) {
            return
        }
    
        if (active.data.current?.columnId) {
            // Moving a ticket

            // Get active and over column ids and columns from the board
            const activeColumnId = active.data.current.columnId
            const overColumnId = over.data.current?.columnId || over.id          
            const activeColumn = board.columns.find(col => col._id === activeColumnId)
            const overColumn = board.columns.find(col => col._id === overColumnId)
            if (!activeColumn || !overColumn) {
                return
            }

            // Get the active ticket that is dragged/moved
            const activeTicket = activeColumn.tickets.find(ticket => ticket._id === active.id)
            if (!activeTicket) {
                return
            }
            
            // Save the updated columns to a variable
            let updatedColumns = [...board.columns]

            if (activeColumn._id === overColumn._id) {
                // Moving ticket within the same column
                // Get the index of the active column, get the tickets from the active column and find the index of the dragged/active ticket
                const columnIndex = updatedColumns.findIndex(col => col._id === activeColumn._id)
                const updatedTickets = [...activeColumn.tickets]
                const oldIndex = updatedTickets.findIndex(t => t._id === active.id)
                
                // If dropping on a ticket, use its position, otherwise append to the end
                const newIndex = over.data.current?.columnId 
                    ? updatedTickets.findIndex(t => t._id === over.id)
                    : updatedTickets.length

                // Remove the ticket from the old index and add it to the new index 
                updatedTickets.splice(oldIndex, 1)
                updatedTickets.splice(newIndex, 0, activeTicket)

                // Update the active column with the updated tickets
                updatedColumns[columnIndex] = {
                    ...activeColumn,
                    tickets: updatedTickets
                }
                const finalTicketOrder = updatedTickets

                // Send a POST request to the backend to update the ticket order in db
                try {
                    const response = await fetch('http://localhost:3000/api/tickets/reorder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: JSON.stringify({
                            sourceColumnId: activeColumn._id,
                            destinationColumnId: overColumn._id,
                            ticketId: active.id,
                            newOrder: finalTicketOrder.map((t: { _id: string }) => t._id)
                        }),
                    })
                    if (response.status === 401) {
                        handleUnauthorized()
                        return
                    }
                    if (response.ok) {
                        console.log('Ticket order updated successfully')
                    } else {
                        console.error('Failed to update ticket order in backend')
                    }
                } catch (error) {
                    console.error('Error updating ticket order:', error)
                }
            } else {
                // Moving ticket between columns
                // Get the index of the active and over columns
                const sourceColumnIndex = updatedColumns.findIndex(col => col._id === activeColumn._id)
                const targetColumnIndex = updatedColumns.findIndex(col => col._id === overColumn._id)
    
                // Remove ticket from source column
                const updatedSourceTickets = activeColumn.tickets.filter(t => t._id !== active.id)
                updatedColumns[sourceColumnIndex] = {
                    ...activeColumn,
                    tickets: updatedSourceTickets
                }
    
                // Add to target column
                const updatedTargetTickets = [...overColumn.tickets]

                // Check the position of ticket in over column
                if (over.data.current?.columnId) {
                    // Dropping on a specific ticket
                    const overIndex = updatedTargetTickets.findIndex(t => t._id === over.id)
                    updatedTargetTickets.splice(overIndex, 0, activeTicket)
                } else {
                    // Dropping anywhere on the column
                    updatedTargetTickets.unshift(activeTicket)
                }
                
                // Update the over column with the updated tickets
                updatedColumns[targetColumnIndex] = {
                    ...overColumn,
                    tickets: updatedTargetTickets
                }

                // Send a POST request to the backend to update the ticket order in db
                try {
                    const response = await fetch('http://localhost:3000/api/tickets/reorder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: JSON.stringify({
                            sourceColumnId: activeColumn._id,
                            destinationColumnId: overColumn._id,
                            ticketId: active.id,
                            newOrder: updatedTargetTickets.map((t: { _id: string }) => t._id)
                        }),
                    })
                    if (response.status === 401) {
                        handleUnauthorized()
                        return
                    }
        
                    if (response.ok) {
                        console.log('Ticket order updated successfully')
                    } else {
                        console.error('Failed to update ticket order in backend')
                    }
                } catch (error) {
                    console.error('Error updating ticket order:', error)
                }
            }

            // Set the board with the updated columns
            setBoard({ ...board, columns: updatedColumns })

        } else {
            // Moving a column
            // Get the old and new index of the columns
            const oldIndex = board.columns.findIndex((col) => col._id === active.id)
            const newIndex = board.columns.findIndex((col) => col._id === over.id)
    
            // Update the columns with the new order and set the board with new columns / order
            const newColumns = arrayMove(board.columns, oldIndex, newIndex)
            setBoard({ ...board, columns: newColumns })
    
            // Take new column order and send a POST request to the backend to update the column order in db
            const columnOrder = newColumns.map((col) => col._id)
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
                })
                if (response.status === 401) {
                    handleUnauthorized()
                    return
                }
    
                const data = await response.json()
                if (response.ok) {
                    console.log('Columns reordered successfully')
                } else {
                    console.error('Failed to reorder columns', data)
                }
            } catch (error) {
                console.error('Error sending reordered columns:', error)
            }
        }
    }

    return (
        <Container maxWidth="xl" sx={{  padding: '2', border: '2px solid grey', borderRadius: '5px', backgroundColor: 'rgb(59, 59, 59)' }}>

            {/* Board title and buttons to add columns and tickets */}
            <Box sx={{ display: 'flex', alignItems: 'center', margin: 2, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>
                    <Typography variant='h4' align="left">{board.title}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Button sx={{marginLeft: 2, marginRight: 2}} variant="contained" onClick={() => setIsTicketPopupOpen(true)}>Add Ticket</Button>
                    <Button variant="contained" onClick={() => setIsColumnPopupOpen(true)}>Add Column</Button>
                </Box>
            </Box>

            {/* Drag and drop context and sortable context for columns and tickets, also the columns and tickets themselves */}
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <SortableContext items={board.columns.map(col => col._id)} strategy={verticalListSortingStrategy}>
                    <Box sx={{ 
                        display: "flex", 
                        overflowX: "auto", 
                        gap: 2, 
                        padding: 2, 
                        minHeight: "80vh",

                        "@media (max-width: 1200px)": {
                            // Between 785px and 1200px - 2x2 grid
                            display: "grid",
                            gap: 2,
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gridAutoFlow: "row",
                        },

                        "@media (max-width: 785px)": {
                            // Between 650px and 785px - 2x2 grid
                            display: "grid",
                            gap: 2,
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gridAutoFlow: "row",
                        },

                        "@media (max-width: 650px)": {
                            display: "flex", 
                            overflowX: "auto", 
                            gap: 2, 
                            padding: 2, 
                            minHeight: "80vh",
                            flexDirection: "column", 
                            alignItems: "center",
                        },
                        
                    }}>
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

            {/* If "Add ticket" button is pressed, a popup is presented with option to give ticket a name, description using rich text editor, setting the column of the ticket and the color, options for adding or canceling*/}
            <Dialog open={isTicketPopupOpen} onClose={() => setIsTicketPopupOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add New Ticket</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Title" fullWidth value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)}/>
                    <ReactQuill placeholder="Description" style={{ marginBottom: 10, marginTop: 5 }} value={ticketDesc} onChange={setTicketDesc}/>
                    <TextField id="outlined-select" onChange={(e) => setSelectedColumnId(e.target.value)} select defaultValue="" label="Column" helperText="Please select a column" fullWidth>
                        {board.columns.map((col) => (
                            <MenuItem key={col._id} value={col._id}>
                                {col.title}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                        {colorOptions.map((color) => (
                            <Box key={color} sx={{ width: 40, height: 40, borderRadius: 2, backgroundColor: color, cursor: 'pointer', boxShadow: ticketColor === color ? 2 : 0, border: ticketColor === color ? '2px solid #000' : 'none', }} onClick={() => setTicketColor(color)}/>
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