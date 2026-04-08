import React from 'react'
import { Routes, Route ,Navigate} from 'react-router-dom'
import { useState } from 'react'
import Home from './page/Home'
import Login from './page/Login'
import Signup from './page/Signup'
import Refresh from './util/Refresh'
import Task from './page/Task'
import './App.css'
//Routes, Route
const PrivateRoute = ({ children, isAuth }) => {
  return isAuth ? children : <Navigate to="/login" replace />
}

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"))

  return (
    <div>
      <Refresh setIsAuth={setIsAuth}/>
      <Routes>
        <Route path='/' element={<Navigate to={"login"} />}/>
        <Route
          path="/home"
          element={
            <PrivateRoute isAuth={isAuth}>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/task"
          element={
            <PrivateRoute isAuth={isAuth}>
              <Task />
            </PrivateRoute>
          }
        />
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
      </Routes>
    </div>
  )
}
// Bottome_home
export default App
