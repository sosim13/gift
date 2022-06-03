import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AiFillHome, AiOutlineCloudUpload, AiOutlineTeam, AiOutlineWallet } from "react-icons/ai";

function BottomNav() {
  var linkNo = 0;
  const location = useLocation().pathname;
  let [a, b] = location.split('/');

  if(location == "/"){
	  linkNo = 1;
  }else if(location == "/second"){
	  linkNo = 2;
  }else if(location == "/grouplist"){
	  linkNo = 3;
  }else if(String(b) == "GroupListView"){
	  linkNo = 3;
  }else{
	  linkNo =0;
  }

  return (
    <div className="App">
      <nav className="wrapper">
		  <div>
			<Link to="/" className={linkNo === 1 ? "nav-link active" : "nav-link"}>
			<AiOutlineWallet size="30" />
			</Link>
		  </div> 
		  <div>
			<Link to="/second" className={linkNo === 2 ? "nav-link active" : "nav-link"}>
			<AiOutlineCloudUpload size="30" />
			</Link>
		  </div>
		  <div>
			<Link to="/grouplist" className={linkNo === 3 ? "nav-link active" : "nav-link"}>
			<AiOutlineTeam size="30" />
			</Link>
		  </div>
	  </nav>
    </div>
  );
}

export default BottomNav;

