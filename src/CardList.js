import React, { useState, useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel'
import axios,{ post } from 'axios';
import { Button,InputGroup ,FormControl  } from 'react-bootstrap';
import {useNavigate, Link } from "react-router-dom"
import { AiOutlinePlusCircle, AiOutlineArrowLeft, AiOutlineUserSwitch, AiOutlinePlusSquare, AiOutlineCloseSquare } from "react-icons/ai";
import moment from 'moment';
import 'moment/locale/ko';	//대한민국
import giftcon from "./giftcon";
import { getDatabase, ref, onValue, push, update, set } from "firebase/database";
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import Modal from './Modal';

var Barcode = require('react-barcode');

function CardList() {
  // 로그인체크
  const ss_account = window.localStorage.getItem('ss_account');
  if(ss_account == null){
	  window.location.replace("/login");
  }
  // 현재 날짜
  const wtime = moment().format('YYYYMMDDHHmmss');

  const db = getDatabase();
  const cardRef = ref(db, 'card_list');

  const [account, setAccount] = useState(ss_account);
  const [name, setName] = useState('');
  const [groupKey, setGroupKey] = useState('');
  const [datas, setDatas] = useState([]);

  const [cardId, setCardId] = useState("");
  const [cardName, setCardName] = useState("");
  const [barcode, setBarcode] = useState("0");

  useEffect(() => {

	onValue(cardRef, (snapshot) => {
      const users = snapshot.val();
      const usersData = [];

      for(let id in users) {
		  if(users[id].ss_account == ss_account){
	        usersData.push({ ...users[id], id });
		  }
      }
	  console.log(usersData);
      setDatas(usersData);
    })
  }, []);
  
  const onClickRemove = (id) => {

	if (window.confirm("정말 삭제하시겠습니까?")) {

	  ToastsStore.success("삭제되었습니다.");
	  document.getElementById('modal').className = 'modal';

	  set(ref(db, 'card_list/'+id), null);			// set으로 null 값을 주어서 삭제

	}
  }
  
  const open = (cid, cname, bcode) => {
	setCardId(cid);
    setCardName(cname);
    setBarcode(bcode);
    document.getElementById('modal').className += ' openModal';
  }
  const close = () => {
    document.getElementById('modal').className = 'modal';
  }

  const onChange = (e) => {
    e.target.name === 'name' ? setName(e.target.value) : setGroupKey(ss_account);
  }


  return (   
    <div>
		<div>		
			<span className="leftSpan">
				<Link to="/">
					<AiOutlineArrowLeft size="30" />
				</Link>
			</span>
			<span className="rightSpan">
				<Link to="/cardadd">
					<AiOutlinePlusSquare size="30" />
				</Link>
			</span>
		</div>
	  <div className="share_list">
	      <br/>
	  </div>
	  {datas?.map(data => <div  className="card round" key={data.id} id={data.id} >
		  <div onClick={() => open(data.id, data.cardName, data.barcode)}><h1>{data.cardName}</h1></div>
	  </div>
	  )}
	  {datas.length == 0 ? (
		  <div className="tong">
		  <h3>등록된 카드가 없습니다.</h3>
			</div>
		  ): null}
	  <div id="modal" className={close ? 'modal' : 'openModal modal'}>
        {open ? (
          <section>
            <header>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{cardName}
              <button className="close" onClick={close}>
                &times;
              </button>
            </header>
            <main><Barcode value={barcode} height={40} /><br/></main>
            <footer>
              <button className="close" onClick={() => onClickRemove(cardId)}>
                삭제
              </button>
            </footer>
          </section>
        ) : null}
      </div>
		    <br/><br/><br/><br/><br/>

    </div>
  );
}

export default CardList;

