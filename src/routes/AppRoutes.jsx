import React from 'react'
import {Route,Routes} from 'react-router-dom'
import Home from '../pages/Home'
import DecisionTree from '../pages/DecisionTree'

const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/" element={<DecisionTree/>} />
        <Route path="/resources" element={<Home/>} />
        <Route path="/decision-tree" element={<DecisionTree/>} />
    </Routes>
  )
}

export default AppRoutes