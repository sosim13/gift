import React, { useState, useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel'
import axios,{ post } from 'axios';
import { Button,InputGroup ,FormControl  } from 'react-bootstrap';
import {useNavigate} from "react-router-dom"
//import 'bootstrap/dist/css/bootstrap.css
import { AiOutlinePlusSquare } from "react-icons/ai";
import moment from 'moment';
import 'moment/locale/ko';	//대한민국
import giftcon from "./giftcon";
import { getDatabase, ref, onValue, push } from "firebase/database";
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';

var Barcode = require('react-barcode');

var rBrand = "";
var rProduct = "";
var rPrice = "";

function Second() {
  // 로그인체크
  const ss_account = window.localStorage.getItem('ss_account');
  if(ss_account == null){
	  window.location.replace("/login");
  }
  // 현재 날짜
  const wtime = moment().format('YYYYMMDDHHmmss');

  const db = getDatabase();
  const giftRef = ref(db, 'gift_list');
  const shareRef = ref(db, 'share_list');
 
  const [gongbak, setGongbak] = useState("");
  const [url, setUrl] = useState("");
  const [barcode, setBarcode] = useState("");
  
  const [brand, setBrand] = useState('');
  const [product, setProduct] = useState('');
  const [price, setPrice] = useState('');
  const [expired, setExpired] = useState('');
  const [groupKey, setGroupKey] = useState('');
  const [groupName, setGroupName] = useState('');

  const [datas, setDatas] = useState([]);
  const [chk_data, setChk_data] = useState([]);

  useEffect(() => {
	onValue(shareRef, (snapshot) => {
      const users = snapshot.val();
      const usersData = [];

      for(let id in users) {
		  if(users[id].account == ss_account){
	        usersData.push({ ...users[id], id });
		  }
      }
      setDatas(usersData);
    });

	
	onValue(giftRef, (snapshot) => {
	  const users = snapshot.val();
	  for(let id in users) {
		const users = snapshot.val();
		for(let id in users) {
		  if(users[id].ss_account == ss_account){
//			console.log(users[id].ss_account+" : "+users[id].barcode);

			chk_data.push(users[id].barcode);
		  }
		}
	  }
	});
  }, []);

  let navigate = useNavigate(); 
  const [imgBase64, setImgBase64] = useState([]); // 파일 base64
  const [imgFile, setImgFile] = useState(null);	//파일	
  var images = []
 
  const handleChangeFile = (event) => {
    console.log(event.target.files[0]);
	uploadImage(event.target.files[0]);
	uploadImage(event.target.files);
    setImgFile(event.target.files);
    //fd.append("file", event.target.files)

	factory();

    setImgBase64([]);
    for(var i=0;i<event.target.files.length;i++){
		if (event.target.files[i]) {
		  let reader = new FileReader();
		  reader.readAsDataURL(event.target.files[i]); // 1. 파일을 읽어 버퍼에 저장합니다.
		  // 파일 상태 업데이트
		  reader.onloadend = () => {
			// 2. 읽기가 완료되면 아래코드가 실행됩니다.
			const base64 = reader.result;
			if (base64) {
				//  images.push(base64.toString())
				var base64Sub = base64.toString()
				   
				setImgBase64(imgBase64 => [...imgBase64, base64Sub]);
				//  setImgBase64(newObj);
				  // 파일 base64 상태 업데이트
				//  console.log(images)
				
			}
		  }
		}
    }
	
  }


  useEffect(() => {
	  WriteBoard()
  }, [imgFile]);

  const WriteBoard = async()=> {
	if(imgFile == null){
		return false;
	}
    const fd = new FormData();
    Object.values(imgFile).forEach((file) => fd.append("image", file));

    const fd2 = new FormData();
    await axios.post('https://dapi.kakao.com/v2/vision/text/ocr', fd, {
	  headers: {
		Authorization: `KakaoAK b7e80494b2e4956447d4885bfae95ff9`,
		"Content-Type": `multipart/form-data; `,
	  }
	})
	.then((response) => {
	   
		//console.log(response.data.result.length);
		//console.log(response.data.result[0].recognition_words);
		//console.log(response.status);
		//console.log(JSON.stringify(response.data.result));

		var word = {};
		var wordArray = [];
		var resWordAll = "";
		var beforeNum = 0;

		for (let i = 0; i < response.data.result.length; i++) {
			var resWord = String(response.data.result[i].recognition_words).replace('번호복사','').replace('상품명','').replace('사용장소','');
			
			console.log("처음: "+resWord);
			var resBox = String(response.data.result[i].boxes);
			var boxArray=resBox.split(',');

			if(beforeNum >= parseInt(boxArray[1]) -3 && beforeNum <= parseInt(boxArray[1]) +3){
				resWordAll = resWordAll + " " + resWord;
//				console.log("워드1: "+resWordAll);
			}else{
				resWordAll = resWord;
//				console.log("워드2: "+resWordAll.replace(/[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/gi, ""));
			}

			beforeNum = parseInt(boxArray[1]);

			if(!isNaN(resWordAll.replace(/[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/gi, ""))){
				var numberString = resWordAll.replace(/[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/gi, "");
				if(numberString.length > 11){
					setBarcode(numberString);
				}
			}
			if(resWordAll.indexOf(',') > 0){
				if(!isNaN(resWordAll.replace(/\s,/gi, ""))){
					setPrice(resWordAll);
					setProduct("상품권");
				}
			} 
			if(resWordAll.split('.').length == 3){
				setExpired(resWordAll.replace('까지','').replace('유효기간','').replace('사용기한','').replace('*','').replace(':','').replace('~','').replace('년','.').replace('월','.').replace('일','').replace(/\s/gi, ""));
			}
			if(resWordAll.indexOf('월') > 0 && resWordAll.indexOf('일') > 0){
				setExpired(resWordAll.replace('까지','').replace('유효기간','').replace('사용기한','').replace('*','').replace(':','').replace('~','').replace('년','.').replace('월','.').replace('일','').replace(/\s/gi, ""));
			}

			getBrand(resWord);
			getProduct(resWordAll);
			if(rProduct == ''){
				var productArray=resWord.split('(');
				getProduct(productArray[0]);
			}

			word.id = (i + 1);
			word.name = response.data.result[i].recognition_words;
			wordArray.push({...word});

		}

//		console.log("test: "+wordArray);
	})
	.catch((error) => {
	  // 예외 처리
	  console.log(error)
	})

  }

  // 클라우디너리 이미지 업로드
  const uploadImage = (image) => {

		const data = new FormData()
		data.append("file", image)
		data.append("upload_preset", "giftReact")
		data.append("cloud_name","dv8img")
		fetch("https://api.cloudinary.com/v1_1/dv8img/upload",{
			method:"post",
			body: data
		})
			.then(resp => resp.json())
			.then(data => {
			setUrl(data.url.replace('http://','https://'))
		})
		.catch(err => console.log(err))
	}
  
  const onChange = (e) => {
    e.target.name === 'barcode' ? setBarcode(e.target.value) : setGongbak('');
    e.target.name === 'brand' ? setBrand(e.target.value) : setGongbak('');
    e.target.name === 'product' ? setProduct(e.target.value) : setGongbak('');
    e.target.name === 'price' ? setPrice(e.target.value) : setGongbak('');
    e.target.name === 'expired' ? setExpired(e.target.value) : setGongbak('');
  }

  const onSelectChange = (e) => {
	  setGroupKey(e.target.value); 
	  var target = document.getElementById("groupSelect");
	  setGroupName(target.options[target.selectedIndex].text);
  }


  function factory(){
	setBrand('');
    setProduct('');
    setPrice('');
	setExpired('');
  }


  function getBrand(search){
//	  console.log('겟브랜드:'+search);
	  search = search.replace(/[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/gi, "");
	  const result = giftcon.map((item, index) => item.brand == search ? (rBrand=item.brand) : null);
  }
  useEffect(() => {
	  setBrand(rBrand);
  }, [rBrand]);
  function getProduct(search){
	  var imsiBrand = "";
	  const result = giftcon.map((item, index) => item.product.replace(/\s/gi, "") == search.replace(/\s/gi, "") ? (imsiBrand=item.brand, rProduct=item.product, rPrice=item.price) : null);
	  if(rBrand == ""){
		  rBrand = imsiBrand;
	  }
	  console.log("시작");
	  console.log(search);
	  console.log(rPrice);
  }
  useEffect(() => {
	  setProduct(rProduct);
  }, [rProduct]);
  useEffect(() => {
	  setPrice(rPrice);
  }, [rPrice]);

  useEffect(() => {
	  factory();
  }, []);

  const onClickAdd = () => {

	const set = new Set(chk_data);
	const uniqueArr = [...set];

    if(uniqueArr.indexOf(barcode) >= 0){
		alert("이미 등록된 기프트콘입니다.");
        return false;
	}

	if(barcode == ''){
		alert('이미지가 없거나 인식되지 않는 이미지 입니다.');
		return false;
	}

	if(brand == ''){		
		alert('브랜드명을 입력해주세요.');
		return false;
	}

//	if(url == ''){		
//		alert('이미지 업로드 중입니다. 잠시 후 다시 시도해주세요.');
//		return false;
//	}

	push(ref(db, 'gift_list'), {
	  ss_account: ss_account,
	  url: url,
	  barcode: barcode,
	  brand: brand,
	  product: product,
	  price: price,
	  expired: expired,
	  wtime: wtime,
	  groupKey: groupKey,
	  groupName: groupName
	})
	.then(() => {
	  // Data saved successfully!
      ToastsStore.success("등록했습니다.");
	  window.location.replace("/second");
	})
	.catch((error) => {
	  // The write failed...
	  console.log("오류 : "+error);
	  ToastsStore.success("오류가 발생하였습니다. ("+error+")");
	});	

  }

  return (
    <div className="App">
	  <div className="product-title">
		  <div className="product-img-div">
			<label htmlFor="file">
			  <div  style={{width:'80%', marginTop:'10px',marginLeft:'10%',border:'0px solid black'}}>
			  { imgFile == null && <AiOutlinePlusSquare size="150" /> }<br/>

			  {imgBase64.map((item) => { 
			   return(
					<img
					  className="product-img"
					  src={item}
					  alt="IMAGE"
					  style={{width:"80%"}}
					/>
					)
					}) }
			  </div>
			  </label>
			  <input type="file" id="file" style={{display:'none'}} onChange={handleChangeFile} multiple="multiple"  />	
			</div>
		</div>
		<div>
			{barcode != '' ? <Barcode value={barcode} height={40} /> : null}
			<br/><input type="text" name={'barcode'} className="gift_input" value={barcode} onChange={onChange} placeholder="바코드"/>
		</div>
		<div>
			<input type="text" name={'brand'} className="gift_input" value={brand} onChange={onChange} placeholder="브랜드"/>
		</div>
		<div>
			<input type="text" name={'product'} className="gift_input" value={product} onChange={onChange} placeholder="상품명"/>
		</div>
		<div>
			<input type="text" name={'price'} className="gift_input" value={price} onChange={onChange} placeholder="가격"/>
		</div>
		<div>
			<input type="text" name={'expired'} className="gift_input" value={expired} onChange={onChange} placeholder="유효기간"/>
		</div>
		<select name="groupKey" id="groupSelect" className="gift_input_select" onChange={onSelectChange}>
			<option value="">공유안함</option>
		{datas?.map(data => <option value={data.id} key={data.id}>
			{data.name}
		</option>
		)}
		</select>
		<div>
			{barcode != '' ? (
			<button onClick={onClickAdd} style={{border:'2px solid black',width:'200px',fontSize:'20px', marginTop:'10px'}}>UPLOAD</button>
			) : (
				null
			)}
		</div>
        <br/><br/><br/><br/><br/><br/><br/>
    <ToastsContainer className='toast' store={ToastsStore} lightBackground/>
    </div>
  );
}

export default Second;

