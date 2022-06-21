import React, { useState, useEffect } from 'react';
import { Route, Routes } from "react-router-dom";
import First from "./First";
import Second from "./Second";
import GroupList from "./GroupList";
import GroupListView from "./GroupListView";
import CardList from "./CardList";
import CardAdd from "./CardAdd";
import Calendar from "./Calendar";
import GiftEdit from "./GiftEdit";
import Login from './login/Login';

function App() {	

  const  modalOpen = false;

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<First />} exact />
        <Route path={`/First/:type`} element={<First />} exact />
        <Route path="/second" element={<Second />} />
        <Route path="/grouplist" element={<GroupList />} />
        <Route path="/cardlist" element={<CardList />} />
        <Route path="/cardadd" element={<CardAdd />} />
        <Route path={`/GroupListView/:name/:key`} element={<GroupListView />} />
        <Route path={`/GroupListView/:name/:key/:type`} element={<GroupListView />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path={`/GiftEdit/:id`} element={<GiftEdit />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
