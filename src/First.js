import React, { useEffect, useState } from 'react';
import moment from 'moment';
import 'moment/locale/ko';	//대한민국
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import { getDatabase, ref, onValue, update, set, remove } from "firebase/database";

var Barcode = require('react-barcode');
// file:///C:/Users/soo/Desktop/Noname7.html#
// /e_blur:500/l_text:Montserrat_150_bold:사용완료

function First() {
  // 로그인체크
  const ss_account = window.localStorage.getItem('ss_account');
  const db = getDatabase();
  const giftRef = ref(db, 'gift_list');


  const [barcode, setBarcode] = useState("");
  // 현재 날짜
  const useTime = moment().format('YYYYMMDDHHmmss');

  const [datas, setDatas] = useState([]);

  useEffect(() => {

    onValue(giftRef, (snapshot) => {
      const users = snapshot.val();
      const usersData = [];
	  var cnt = 0;
      for(let id in users) {
		if(users[id].ss_account == ss_account){
			if(users[id].groupKey == ''){
				usersData.push({ ...users[id], id });
				cnt = cnt +1;
			}
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
	  if(cnt == 0){
		document.getElementById("tong2").style.display = "block";
		document.getElementById("tong").style.display = "none";
	  }else{
		document.getElementById("tong2").style.display = "none";
		document.getElementById("tong").style.display = "none";
	  } 
      setDatas(usersData);
    })
  }, []);


  var displayId = "";
  const handleClick = (id) => {
    
		var elements = document.getElementsByClassName('show');
		console.log(elements.length);
		var n = elements.length;
		for (var i = 0; i < n; i++){
			var e = elements[i];
			e.className = 'card';
		}

	if(displayId != id){  
		document.getElementById(id).className += ' show';
		displayId = id;
	}else{
		displayId = "";
	}
  }


  const onUpdate = (id, statusVal) => {
    const [user] = datas.filter(el => el.id === id);


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

    setDatas(datas.map(el => el.id === id ? {...el, useYn: statusVal} : el));
  };

  const onClickRemove = (id) => {

	if (window.confirm("정말 삭제하시겠습니까?")) {

	  ToastsStore.success("삭제되었습니다.");

	  set(ref(db, 'gift_list/'+id), null);			// set으로 null 값을 주어서 삭제
	  
	}
  }

  // 로그아웃
  const onLogin = () => {
	window.localStorage.clear();
	window.location.replace("/login");
  }

  return ( 
	<div className="App" id="App">
	  	    
	  <div id="tong" className="tong">
		  &nbsp;
	  </div>
	  <div id="tong2" className="tong">
		{ss_account != null ? (
			  <><h3>등록된 기프트콘이 없습니다.</h3><br />
			  기프트콘 등록 후 이용해주세요.</>
			) : (
			  <><h3>로그인이 필요합니다.</h3><br />
			  <button onClick={onLogin}>로그인</button></>
			)
		}
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
					{/*<a href={'#'+data.id} className="btn" onClick={() => onUpdate(data.id, 'Y')}>수정</a>&nbsp;*/}
				  <a href={'#'+data.id} className="btn" onClick={() => onClickRemove(data.id)}>삭제</a>&nbsp;
				  <a href={'#'+data.id} className="btn" onClick={() => onUpdate(data.id, 'Y')}>사용</a>&nbsp;
				</div>
			    :
				<div className="card-actions">					
				  <a href={'#'+data.id} className="btn" onClick={() => onClickRemove(data.id)}>삭제</a>&nbsp;
				  <a href={'#'+data.id} className="btn" onClick={() => onUpdate(data.id, 'N')}>사용취소</a>
				</div>				 
				}
			  </div>
			</div>
		  </div>
	)}		  
		</div>
		    <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
		<ToastsContainer className='toast' store={ToastsStore} lightBackground/>
	</div>
  );
}

export default First;

