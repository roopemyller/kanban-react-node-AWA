import { useEffect, useState } from 'react'

const Home = () => {
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Get stored name from localStorage
    const userName = localStorage.getItem('userName')
    if (userName) {
      setUserName(userName)
    }
  }, [])

  return (
    <>
      <h1>Hello {userName || ''}</h1>
      <h2>Here is a Kanban board</h2>
    </>
  )
}

export default Home;