import React, { useEffect, useState } from 'react';
import moment from 'moment';
import 'moment/locale/ko';	//대한민국
import { useParams, useNavigate, Link } from 'react-router-dom';
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';
import { getDatabase, ref, onValue, update, set, remove } from "firebase/database";
import { AiOutlineWallet } from "react-icons/ai";

var Barcode = require('react-barcode');
var displayId = "";
// file:///C:/Users/soo/Desktop/Noname7.html#
// /e_blur:500/l_text:Montserrat_150_bold:사용완료

function First() {
  // 로그인체크
  const ss_account = window.localStorage.getItem('ss_account');
  const db = getDatabase();
  const giftRef = ref(db, 'gift_list');
  const shareRef = ref(db, 'share_list');

  const [paramType, setParamType] = useState(useParams().type);		// 그룹사용건수
//var groupParamName = useParams().name;

  const [barcode, setBarcode] = useState("");
  // 현재 날짜
  const useTime = moment().format('YYYYMMDDHHmmss');

  const [datas, setDatas] = useState([]);
  const [totalCnt, setTotalCnt] = useState(0);					// 총건수
  const [myCnt, setMyCnt] = useState(0);					// 내건수
  const [useCnt, setUseCnt] = useState(0);					// 사용건수
  const [groupCnt, setGroupCnt] = useState(0);				// 공유건수
  const [groupUseCnt, setGroupUseCnt] = useState(0);		// 그룹사용건수
  const [chk_data, setChk_data] = useState([]);

 

  useEffect(() => {

	  
	onValue(shareRef, (snapshot) => {
      const users = snapshot.val();
      for(let id in users) {
		  if(users[id].account == ss_account){
			chk_data.push(users[id].groupKey);
		  }
      }
    })

    onValue(giftRef, (snapshot) => {
      const users = snapshot.val();
      const usersData = [];
	  var cnt = 0;

	  var cnt1 = 0;
	  var cnt2 = 0;
	  var cnt3 = 0;
	  var cnt4 = 0;

      for(let id in users) {
		if(users[id].ss_account == ss_account){
			if(users[id].groupKey == ''){
				cnt = cnt +1;
				if(users[id].useYn == 'Y'){		// 사용
					if(paramType == 2){
						usersData.push({ ...users[id], id });
					}
					cnt2 = cnt2+1;
				}else{							// 미사용
					if(paramType != 2 && paramType != 3){
						usersData.push({ ...users[id], id });
					}
					cnt1 = cnt1+1;
				}
			}else{
				if(users[id].useYn == 'Y'){
					cnt4 = cnt4+1;
				}else{
					cnt3 = cnt3+1;
				}
			}
		}


		const set = new Set(chk_data);
		const uniqueArr = [...set];
		// 공유된 기프트콘 있는지 확인
		if(uniqueArr.indexOf(users[id].groupKey  ) >= 0){
			if(paramType != 1 && paramType != 2 && paramType != 3){
				if(users[id].useYn != 'Y'){		// 미사용
					usersData.push({ ...users[id], id });
				}else{
					cnt2 = cnt2+1;
				}
			}else if(paramType == 1){
				if(users[id].useYn == 'Y'){		// 사용
					cnt2 = cnt2+1;
				}
			}else if(paramType == 2){
				if(users[id].useYn == 'Y'){		// 사용
					usersData.push({ ...users[id], id });
					cnt2 = cnt2+1;
				}
			}else if(paramType == 3){
				if(users[id].useYn != 'Y'){		// 사용
					usersData.push({ ...users[id], id });
				}else{
					cnt2 = cnt2+1;
				}
			}
			if(users[id].ss_account != ss_account){
				if(users[id].useYn == 'Y'){
					cnt4 = cnt4+1;
				}else{
					cnt3 = cnt3+1;
				}
			}
			
		}		
      }

	  
      cnt= cnt1 + cnt3;
	  setTotalCnt(cnt);
	  setMyCnt(cnt1);
	  setUseCnt(cnt2);
	  setGroupCnt(cnt3);
	  setGroupUseCnt(cnt4);


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
      setDatas(usersData);




//	  if(cnt == 0){
	if(paramType != 1 && paramType != 2){
	  if(cnt1+cnt3 == 0){
		document.getElementById("tong2").style.display = "block";
		document.getElementById("tong").style.display = "none";
	  }else{
		document.getElementById("tong2").style.display = "none";
		document.getElementById("tong").style.display = "none";
	  } 
	}else if(paramType == 1){
	  if(cnt1 == 0){
		document.getElementById("tong2").style.display = "block";
		document.getElementById("tong").style.display = "none";
	  }else{
		document.getElementById("tong2").style.display = "none";
		document.getElementById("tong").style.display = "none";
	  } 
	}else{
	  if(cnt2 == 0){
		document.getElementById("tong2").style.display = "block";
		document.getElementById("tong").style.display = "none";
	  }else{
		document.getElementById("tong2").style.display = "none";
		document.getElementById("tong").style.display = "none";
	  } 
	}



    })

	

  }, []);


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

  const goEdit = (id) => {

	window.location.replace("/GiftEdit/"+id);

  };

  // 로그아웃
  const onLogin = () => {
	window.localStorage.clear();
	window.location.replace("/login");
  }

  const onLink = (link) => {
	  window.location.replace(link);
  }

  return ( 
	<div className="App" id="App">
	  <div>
	    <ul className="tabs">
		  <li className={paramType != 1 && paramType != 2 && paramType != 3 ? "tab-link current" : "tab-link"} data-tab="tab-1"><span onClick={() => onLink('/')}><AiOutlineWallet className='icon-middle' /> : {totalCnt}</span></li>
		  <li className={paramType == 1 ? "tab-link current" : "tab-link"} data-tab="tab-1"><span onClick={() => onLink('/first/1')} className='icon-middle'>내지갑 : {myCnt}</span></li>
		  <li className={paramType == 2 ? "tab-link current" : "tab-link"} data-tab="tab-2"><span onClick={() => onLink('/first/2')} className='icon-middle'>사용 : {useCnt}</span></li>
		  <li className={paramType == 3 ? "tab-link current" : "tab-link"} data-tab="tab-3"><span onClick={() => onLink('/first/3')} className='icon-middle'>공유 : {groupCnt}</span></li>
		{/*<li className="tab-link" data-tab="tab-4"><span onClick={() => onLink('/grouplist')}>사용 : {groupUseCnt}</span></li>*/}
		</ul>
	  </div>
	  	    
	  <div id="tong" className="tong">
		  &nbsp;
	  </div>
	  <div id="tong2" className="tong">
		{ss_account != null ? (
			  <><h3>{paramType == 2 ? '사용한' : '등록된'} 기프트콘이 없습니다.</h3><br />
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
				{data.groupName != '' ? <>[{data.groupName}]</> : null}  {data.brand} 
				  <small>{data.useYn == 'Y' ? "(사용완료)" : (<>{data.expired != '' ? data.expired.substring(0,4)+'-'+data.expired.substring(4,6)+'-'+data.expired.substring(6,8) : "기한 없음"}</>)}</small>
				  
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
				  <a href={'#'+data.id} className="btn" onClick={() => goEdit(data.id)}>수정</a>&nbsp;
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

