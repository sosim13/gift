import React, { useState, useEffect } from 'react';
import { authService, firebaseInstance  } from './../FireBase';
import { FcGoogle } from 'react-icons/fc';
import firebase from './../FireBase';
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';

const Login = () => {	
  // 로그인체크
  const ss_email = window.sessionStorage.getItem('ss_email');
  const ss_reg_id = window.sessionStorage.getItem('ss_reg_id');
  const ss_reg_type = window.sessionStorage.getItem('ss_reg_type');
  const authenticated = ss_email != null && ss_email != '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newAccount, setNewAccount] = useState(true);	// 새로운 유저인지 확인(초기값: true)
  
  const memberRef = firebase.database().ref('member_list');
  const alarmRef = firebase.database().ref('member_alarm');
  
  const onChange = (event) => {
    const {target: {name, value}} = event;
    if (name==='email') {
      setEmail(value)
    } else if (name=== "password") {
      setPassword(value);
    }
  }
  
  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      let data;
	  console.log("newAccount : "+newAccount);
      if (!newAccount) {
        // create account
        data = await authService.createUserWithEmailAndPassword(email, password);
		console.log("회원가입");
		window.localStorage.setItem('ss_account', data.user.email);
		window.location.replace("/");
      } else {
        // login
        data = await authService.signInWithEmailAndPassword(email, password);
		console.log("로그인");
		window.localStorage.setItem('ss_account', data.user.email);

		memberRef.orderByChild('email').equalTo(data.user.email).once('value', snapshot => {
		  const members = snapshot.val();
		  for(let id in members) {
			console.log(members[id].reg_id+' / '+id)
		    if(ss_reg_type != null){
			  memberRef.child(id).update({
			    reg_id: ss_reg_id,
				reg_type: ss_reg_type
			  });
		    }
		  }
		})

		alarmRef.orderByChild('email').equalTo(data.user.email).once('value', snapshot => {
		  const alarms = snapshot.val();
		  for(let id in alarms) {
			console.log(alarms[id].reg_id+' / '+id)
		    if(ss_reg_type != null){
			  alarmRef.child(id).update({
			    reg_id: ss_reg_id,
				reg_type: ss_reg_type
			  });
		    }
		  }
		})

		ToastsStore.success("Success");
		setTimeout(function(){
			window.location.replace("/");
		}, 1000);
		
      }
    } catch(error) {
      console.log("오류");
      console.log(error.code)
	  if(error.code == 'auth/user-not-found'){
		  alert("user-not-found.");
	  }else if(error.code == 'auth/wrong-password'){
		  alert("wrong-password.");
	  }else if(error.code == 'auth/email-already-in-use'){
		  alert('email-already-in-use');
	  }else if(error.code == 'auth/too-many-requests'){
		  alert('too-many-requests.');
	  }else if(error.code == null){
		  alert('try to again later.');
	  }else{
		  alert(error.message);
	  }
    }
  }
  
  const toggleAccount = () => setNewAccount((prev) => !prev);

  // 소셜로그인
  const onGoogleClick = async (event) => {
  try
    {
      const {target: {name}} = event;
	  console.log("event : "+event);
      let provider;

      if (name === 'google') {
        provider = new firebaseInstance.auth.GoogleAuthProvider();
      }
      const data = await authService.signInWithPopup(provider);
	  window.sessionStorage.setItem('ss_email', data.user.email);
	  window.location.replace("/");
	  console.log(data);
    }
  catch (error)
    {
	  console.log(error)
    }
  }

  // 로그인에서는 안씀 마이페이지에 넣었음.
  const onLogOutClick = () => {
    authService.signOut();
	
	console.log("로그아웃");
	window.sessionStorage.setItem('ss_email', '');
	window.location.replace("/");
  }

  return (	  
    <div className='bg'>	
	  <div className='container'>
        <h1 className='title'>GIFTWALLET</h1>
        <form className='form' onSubmit={onSubmit}>
          <input name="email" type="email" placeholder="Email" required value={email} onChange={onChange}/>
          <input name="password" type="password" placeholder="password" required value={password} onChange={onChange}/>
          <input className={ newAccount ? 'login' : 'newAccount' } type="submit" value={ newAccount ? "LOGIN" : "JOIN" } />
        </form>
        <span className='account' onClick={toggleAccount}>{newAccount ? "Don't you have account?" : "Do you have account?"}</span><br/>
	{/*<button className='googleLogin' name='google' onClick={onGoogleClick}>
          <FcGoogle size="20" className='icon' />
          구글 계정으로 로그인
        </button>*/}
		<br/>
		<div><font color="red"><b>테스트아이디 : test@m.mm</b></font></div>
		<div><font color="red"><b>테스트비밀번호 : 321321</b></font></div>
      </div>
		<ToastsContainer className='toast' store={ToastsStore} lightBackground/>
    </div>
  )
}

export default Login;