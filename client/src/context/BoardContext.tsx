
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface IColumn {
    _id: string
    title: string
    tickets: ITicket[]
}

interface IBoard {
    _id: string
    title: string
    columns: IColumn[]
}
 interface ITicket {
    _id: string
    title: string
    description: string;
    backgroundColor: string
 }

// Define the context type
interface BoardContextType {
    board: IBoard | null
    setBoard: React.Dispatch<React.SetStateAction<IBoard | null>>
}

const BoardContext = createContext<BoardContextType | null>(null);

export const useBoard = () => {
    const context = useContext(BoardContext)
    if (!context) {
        throw new Error('useBoard must be used within a BoardProvider');
    }
    return context
}

export const fetchBoard = async (setBoard: React.Dispatch<React.SetStateAction<IBoard | null>>) => {
    try {
        const response = await fetch('http://localhost:3000/api/boards/get', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        const data = await response.json()
        console.log("Get board data: ", data)
        if (response.ok) {
            setBoard(data[0])
        }
    } catch (error) {
        console.error('Error fetching board:', error)
    }
}

export const BoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [board, setBoard] = useState<IBoard | null>(null)

    useEffect(() => {
        const fetchBoard = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/boards/get', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                })
                const data = await response.json()
                console.log("Get board data: ", data)
                if (response.ok) {
                    setBoard(data[0])
                }
            } catch (error) {
                console.error('Error fetching board:', error)
            }
        }

        fetchBoard()
    }, [])
    return (
        <BoardContext.Provider value={{ board, setBoard }}>
            {children}
        </BoardContext.Provider>
    );
}

