import React, { useState, useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel'
import axios,{ post } from 'axios';
import { Button,InputGroup ,FormControl  } from 'react-bootstrap';
import {useNavigate} from "react-router-dom"
import { AiOutlinePlusCircle } from "react-icons/ai";
import moment from 'moment';
import 'moment/locale/ko';	//대한민국
import giftcon from "./giftcon";
import { getDatabase, ref, onValue, push, update } from "firebase/database";
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import Modal from './Modal';

function GroupList() {
  // 로그인체크
  const ss_account = window.localStorage.getItem('ss_account');
  if(ss_account == null){
	  window.location.replace("/login");
  }
  // 현재 날짜
  const wtime = moment().format('YYYYMMDDHHmmss');

  const db = getDatabase();
  const shareRef = ref(db, 'share_list');

  const [account, setAccount] = useState(ss_account);
  const [name, setName] = useState('');
  const [groupKey, setGroupKey] = useState('');
  const [datas, setDatas] = useState([]);

  useEffect(() => {

	onValue(shareRef, (snapshot) => {
      const users = snapshot.val();
      const usersData = [];

      for(let id in users) {
		  if(users[id].account == ss_account){
	        usersData.push({ ...users[id], id });
		  }
      }
	  console.log(usersData);
      setDatas(usersData);
    })
  }, []);
  
  const onClickAdd = () => {

	push(shareRef, {
	  account: account,
	  name: name,
	  groupKey: groupKey,
	  wtime: wtime
	})
	.then(() => {
	  // Data saved successfully!
	  console.log("성공");
	})
	.catch((error) => {
	  // The write failed...
	  console.log("오류 : "+error);
	});

    ToastsStore.success("등록했습니다.");

	
    document.getElementById('modal').className = 'modal';

    setName('');

  }
  
  const open = () => {
    document.getElementById('modal').className += ' openModal';
  }
  const close = () => {
    document.getElementById('modal').className = 'modal';
  }

  const onChange = (e) => {
    e.target.name === 'name' ? setName(e.target.value) : setGroupKey(ss_account);
  }

  const onUpdate = (id, groupKey, groupName) => {
	var imsiKey = "";
	if(groupKey == ''){
		const [user] = datas.filter(el => el.id === id);

		update(ref(db, 'share_list/'+id), {
		  groupKey: id
	    })
		
		imsiKey = id;
	}else{
		imsiKey = groupKey;
	}

	window.location.replace("/GroupListView/"+groupName+"/"+imsiKey);

  };


  return (   
    <div>
	  {datas?.map(data => <div  className="card" key={data.id} id={data.id}>
		  <div onClick={() => onUpdate(data.id, data.groupKey, data.name)}><h1>{data.name}</h1></div>
	  </div>
	  )}
	  <div className="share_list" onClick={open}>
	      <AiOutlinePlusCircle size="30" /><br/>공유폴더만들기
	  </div>
	  <div id="modal" className={close ? 'modal' : 'openModal modal'}>
        {open ? (
          <section>
            <header>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;공유폴더명
              <button className="close" onClick={close}>
                &times;
              </button>
            </header>
            <main><input type="text" name="name" value={name} className="gift_input" onChange={onChange} /></main>
            <footer>
              <button className="close" onClick={onClickAdd}>
                등록
              </button>
            </footer>
          </section>
        ) : null}
      </div>
		    <br/><br/><br/><br/><br/>

    </div>
  );
}

export default GroupList;

