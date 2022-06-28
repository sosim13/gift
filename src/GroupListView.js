import React, { useState, useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel'
import axios,{ post } from 'axios';
import { Button,InputGroup ,FormControl  } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { AiOutlineArrowLeft, AiOutlineUserSwitch, AiOutlineFrown, AiOutlineTeam, AiOutlineCloseCircle, AiFillLock, AiFillNotification, AiOutlineDelete } from "react-icons/ai";
import moment from 'moment';
import 'moment/locale/ko';	//대한민국
import giftcon from "./giftcon";
import { getDatabase, ref, onValue, push, update, set } from "firebase/database";
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import Modal from './Modal';

var Barcode = require('react-barcode');
var displayId = "";
var chk_data = [];
var tot_cnt = 0;

const GroupListView = () => {
  // 로그인체크
  const ss_account = window.localStorage.getItem('ss_account');
  if(ss_account == null){
	  window.location.replace("/login");
  }
  // 현재 날짜
  const wtime = moment().format('YYYYMMDDHHmmss');
  const useTime = moment().format('YYYYMMDDHHmmss');

  const [paramType, setParamType] = useState(useParams().type);		// 그룹사용건수
  var groupParamName = useParams().name;
  var groupParamKey = useParams().key;
  
  const db = getDatabase();
  const giftRef = ref(db, 'gift_list');
  const shareRef = ref(db, 'share_list');

  const [account, setAccount] = useState('');
  const [name, setName] = useState(groupParamName);
  const [groupKey, setGroupKey] = useState(groupParamKey);
  const [ornner, setOrnner] = useState(groupParamName);
  const [datas, setDatas] = useState([]);
  const [shares, setShares] = useState([]);


  useEffect(() => {

	onValue(giftRef, (snapshot) => {
      const users = snapshot.val();
      const usersData = [];
      var cnt = 0;
      for(let id in users) {
		  if(users[id].groupKey == groupParamKey){
	        if(paramType == 2){		// 사용
				if(users[id].useYn == 'Y'){
					usersData.push({ ...users[id], id });
					cnt = cnt +1;
				}
			}else{							// 미사용
				if(users[id].useYn != 'Y'){
					usersData.push({ ...users[id], id });
					cnt = cnt +1;
				}
			}	
			tot_cnt = tot_cnt +1;
		  }		
      }
	  // orderBy 정렬순서
	  
	  usersData.sort(function(a, b) {
		  if(a.expired == ""){
			  a.expired = 0;
		  }
		  if(b.expired == ""){
			  b.expired = 0;
		  }
		  var aorder = parseInt(a.expired.toString().replace(/[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/gi, ""));
		  var border = parseInt(b.expired.toString().replace(/[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/gi, ""));
	    return aorder - border;
	  });
	  console.log("cnt : "+cnt);
	  if(cnt == 0){
		document.getElementById("tong2").style.display = "block";
		document.getElementById("tong").style.display = "none";
	  }else{
		document.getElementById("tong2").style.display = "none";
		document.getElementById("tong").style.display = "none";
	  }
      setDatas(usersData);
    })


	onValue(shareRef, (snapshot) => {
      const users = snapshot.val();
      const usersData = [];

      for(let id in users) {
		  if(users[id].account != ss_account){
		    if(users[id].groupKey == groupParamKey){
				if(paramType == 2){		// 사용
					if(users[id].useYn == 'Y'){
						usersData.push({ ...users[id], id });
					}
				}else{							// 미사용
					if(users[id].useYn != 'Y'){
						usersData.push({ ...users[id], id });
					}
				}		
			  chk_data.push(users[id].account);
		    }		

			if(users[id].groupKey == id){
				setOrnner(users[id].groupKey);
			}
		  }
      }

      setShares(usersData);
    })
  }, []);

  const onBack = () => {
    window.location.replace("/GroupList");
  };
	
  
  const open = () => {
    document.getElementById('modal').className += ' openModal';
  }
  const close = () => {
    document.getElementById('modal').className = 'modal';
  }

  const onChange = (e) => {
    e.target.name === 'account' ? setAccount(e.target.value) : setGroupKey(groupParamKey);
  }
  
  const onClickAdd = () => {
	 
	if(account == ''){
		alert("공유할 아이디를 입력해주세요.");
		return false;
	}

	var reg_email = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
      if(!reg_email.test(account)) {
	    alert("이메일로 된 아이디를 입력해주세요.");
        return false;
      }
      if(chk_data.indexOf(account) >= 0){
		alert("이미 공유된 아이디 입니다.");
        return false;
	  }
	  chk_data.push(account);

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

	
//    document.getElementById('modal').className = 'modal';

    setAccount('');

  }

  
  const handleClick = (id) => {
	
	var elements = document.getElementsByClassName('show');
		
	var n = elements.length;
	for (var i = 0; i < n; i++){
		var e = elements[i];
		e.className = "card";
	}
	if(displayId != id){  
		document.getElementById(id).className += ' show';
		displayId = id;
	}else{
		displayId = "";
	}
  }

  const onUpdate = (id, statusVal) => {
//    const [user] = datas.filter(el => el.id === id);


    if(statusVal == 'Y'){
	    update(ref(db, 'gift_list/'+id), {
		  useYn: statusVal,
		  useTime: useTime
	    })
        .then(() => {
		  // Data saved successfully!
		  console.log("성공");
		})
		.catch((error) => {
		  // The write failed...
		  console.log("오류 : "+error);
		});

	}else{
		update(ref(db, 'gift_list/'+id), {
		  useYn: statusVal,
		  useTime: ''
	    })
        .then(() => {
		  // Data saved successfully!
		  console.log("성공");
		})
		.catch((error) => {
		  // The write failed...
		  console.log("오류 : "+error);
		});
	}

//    setDatas(datas.map(el => el.id === id ? {...el, useYn: statusVal} : el));
  };

  const onClickRemove = (id) => {

	if (window.confirm("정말 삭제하시겠습니까?")) {

	  ToastsStore.success("삭제되었습니다.");

	  set(ref(db, 'gift_list/'+id), null);			// set으로 null 값을 주어서 삭제

	}
  }

  const onClickShareRemove = (id) => {

	if (window.confirm("정말 삭제하시겠습니까?")) {

	  ToastsStore.success("삭제되었습니다.");

      set(ref(db, 'share_list/'+id), null);
	}
  }

  const onClickFolderRemove = (id) => {

	if (window.confirm("정말 삭제하시겠습니까?")) {

	  ToastsStore.success("삭제되었습니다.");

      set(ref(db, 'share_list/'+id), null);

      window.location.replace("/GroupList");

	}
  }

  

  const goEdit = (id) => {

	window.location.replace("/GiftEdit/"+id);

  };

  

  const onLink = (name, key) => {
	  window.location.replace('/GroupListView/'+name+'/'+key+'/2');
  }

   return (
	<div>
		<div>		
			<span className="leftSpan" onClick={onBack}><AiOutlineArrowLeft size="30" /></span>
			<span className="rightSpan" onClick={open}><AiOutlineUserSwitch size="30" /></span>
		</div>
	   
	    <h1>{groupParamName}</h1>
	    <div id="modal" className={close ? 'modal' : 'openModal modal'}>
        {open ? (
          <section>
            <header>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;공유아이디
              <button className="close" onClick={close}>
                &times;
              </button>
            </header>
            <main className="shareMember">
			  {shares?.map(data => <div key={data.id}>
				<h4>{data.account}&nbsp;&nbsp;&nbsp;{ornner == data.id ? <AiFillLock /> : <span className="shareDelBtn" onClick={() => onClickShareRemove(data.id)}><AiOutlineCloseCircle /></span>}</h4>
			  </div>
			  )}
			</main>
            <footer>
				<input type="text" name="account" value={account} className="gift_input" onChange={onChange} placeholder="공유할 아이디" className='shareInput' />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <button className="close" onClick={onClickAdd}>
                등록
              </button>
            </footer>
          </section>
        ) : null}
	  </div>
	  <div id="tong" className="tong">
		  &nbsp;
	  </div>
	  <div id="tong2" className="tong">
		  <h3> {paramType == 2 ? '사용한' : '등록된'} 기프트콘이 없습니다.</h3><br />
		  공유방법 : 기프트콘 > 수정 > 공유폴더 선택<br /><br /><br />	
	{tot_cnt == 0 ? 
		  <span onClick={() => onClickFolderRemove(groupParamKey)}>[폴더삭제]</span>
		  : null }
	  </div>

		  
	  <div className="cards">
	{datas?.map(data => <div  className="card" key={data.id} id={data.id}>
			<div className="card__image-holder">
			{data.useYn == 'Y' ? (<>
			  <img className="card__image" src={data.url != null ? data.url.replace('/upload/','/upload/e_blur:300/l_text:Arial_100_bold:사용완료,co_red/') : null} alt={data.barcode}/>			
			</>)
			: 
			(<>
			  <img className="card__image" src={data.url != null ? data.url : null} alt={data.barcode}/>
			  </>)}
			</div>
			<div className="card-title">
			  <a href={'#'+data.id} className="toggle-info btn" onClick={() => handleClick(data.id)}>
				<span className="left"></span>
				<span className="right"></span>
			  </a>
			  <h2>
				  {data.brand} 
				  <small>{data.useYn == 'Y' ? "(사용완료)" : (<>{data.expired != '' ? data.expired : "기한 없음"}</>)}</small>
				  
			  </h2>
			</div>
			<div className="card-flap flap1">
			  <div className="card-description">
				<Barcode value={data.barcode} height={40} /><br/>
				{data.product != '' ? <>{data.product}<br/></> : null}
				{data.price != '' ? <>{data.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</> : null}
			  </div>
			  <div className="card-flap flap2">
				<div className="card-actions">
				</div>
				{data.useYn != 'Y' ?
				<div className="card-actions">
					{data.ss_account == ss_account ?
						<>
							<a href={'#'+data.id} className="btn" onClick={() => goEdit(data.id)}>수정</a>&nbsp;
							<a href={'#'+data.id} className="btn" onClick={() => onClickRemove(data.id)}>삭제</a>&nbsp;
						</>
					: null
					}
				  <a href={'#'+data.id} className="btn" onClick={() => onUpdate(data.id, 'Y')}>사용</a>&nbsp;
				</div>
			    :
				<div className="card-actions">		
				{data.ss_account == ss_account ?
					<>
						<a href={'#'+data.id} className="btn" onClick={() => onClickRemove(data.id)}>삭제</a>&nbsp;
					</>
					: null
					}
				  <a href={'#'+data.id} className="btn" onClick={() => onUpdate(data.id, 'N')}>사용취소</a>
				</div>				 
				}
			  </div>
			</div>
		  </div>
	)}		
	{/*
	{paramType !=2 ? 
	  <div className="share_list" onClick={() => onLink(groupParamName, groupParamKey)}>
	      <AiOutlineDelete size="30" /><br/>사용완료조회
	  </div>
		: null } */}
		</div>
		    <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
		<ToastsContainer className='toast' store={ToastsStore} lightBackground/>
	</div>
    );
};
 
export default GroupListView;