import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function Refresh({ setIsAuth }) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (token) {
      setIsAuth(true)

      if (
        location.pathname === "/" ||
        location.pathname === "/login" ||
        location.pathname === "/signup"
      ) {
        navigate("/home", { replace: true })
      }
    }
  }, [location.pathname])

  return null
}

export default Refresh