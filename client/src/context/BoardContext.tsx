
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

// Define the types
export interface IColumn {
    _id: string
    title: string
    tickets: ITicket[]
    backgroundColor: string
}
export interface IBoard {
    _id: string
    title: string
    columns: IColumn[]
}
export interface ITicket {
    _id: string
    title: string
    description: string;
    backgroundColor: string
    date: string
    modifiedAt: string
 }

// Define the context type
interface BoardContextType {
    board: IBoard | null
    setBoard: React.Dispatch<React.SetStateAction<IBoard | null>>
}
// Create the context
const BoardContext = createContext<BoardContextType | null>(null);

// Create the hooks
export const useBoard = () => {
    const context = useContext(BoardContext)
    if (!context) {
        throw new Error('useBoard must be used within a BoardProvider');
    }
    return context
}

// Create the fetchBoard function
export const fetchBoard = async (setBoard: React.Dispatch<React.SetStateAction<IBoard | null>>) => {
    try {
        // GET request to get the board
        const response = await fetch('http://localhost:3000/api/boards/get', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        // If the response is ok, set the board
        const data = await response.json()
        if (response.ok) {
            setBoard(data[0])
        }
    } catch (error) {
        console.error('Error fetching board:', error)
    }
}

// Create the BoardProvider component
export const BoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [board, setBoard] = useState<IBoard | null>(null)
    // Fetch the board on page load
    useEffect(() => {
        fetchBoard(setBoard)
    }, [])
    // Return the provider
    return (
        <BoardContext.Provider value={{ board, setBoard }}>
            {children}
        </BoardContext.Provider>
    );
}

