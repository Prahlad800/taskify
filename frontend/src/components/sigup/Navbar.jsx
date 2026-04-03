import React from 'react'
import "./navbar.css"
function Navbar(props) {
  return (
    <div className='nav'>
      <div className='nav1'>
        <h1>{props.name}</h1>
      </div>
    </div>
  )
}

export default Navbar
