import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { authService, firebaseInstance  } from './FireBase';
import { AiFillGift, AiOutlineGift, AiOutlineCreditCard, AiFillBell, AiOutlineBell, AiOutlineImport } from "react-icons/ai";

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
  }else if(location == "/cardlist"){
	  linkNo = 4;
  }else if(location == "/cardadd"){
	  linkNo = 4;
  }else if(location == "/mypage"){
	  linkNo = 5;
  }else{
	  linkNo =0;
  }

  // 로그아웃
  const onLogOutClick = () => {
    authService.signOut();
	
	console.log("로그아웃");
	window.localStorage.clear();
	window.location.replace("/login");
  }

  return (
    <div className="App">

      <div className="top_wrapper">
		 <div className="header">
			<div className="gift-link"><img src="https://res.cloudinary.com/dv8img/image/upload/c_scale,w_920/v1650423539/web/gift_kvvce7.png" width="25" /> GIFT WALLET</div>
			<div className="top-link">		  
			<Link to="/cardlist" className={linkNo === 4 ? "nav-link active" : "nav-link"}>
				<AiOutlineCreditCard size="25" />
			</Link>
			</div>
			<div className="top-link" onClick={onLogOutClick}>

				<AiOutlineImport size="25" />

			</div>
		 </div>
		 <hr/>
		  </div>
    </div>
  );
}

export default BottomNav;

