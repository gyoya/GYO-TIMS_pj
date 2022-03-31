

let news = []
let page = 1;
let total_pages = 1;
let menus = document.querySelectorAll(".menus button");
menus.forEach((menu) => menu.addEventListener("click", (event)=>getNewsByTopic(event)));

let sideMenus = document.querySelectorAll("#menu-list button");
    sideMenus.forEach((menu) =>
    menu.addEventListener("click", (e) => getNewsByTopic(e))
);

let searchButton = document.getElementById("search-button");
let url;

//[간략한 코드로 바꿔보자!]
// 각 함수에서 url을 만든다.
// api 호출 함수를 부른다.

/* 
[try and catch]
try{
    //소스코드를 쓴다. 이 안에서 에러가 발생하면

}catch(){
    // catch가 에러를 잡아준다.
}
*/

const getNews = async() => {
    try{
        let header = new Headers({'x-api-key':'cUrAsFOvYJbYfv3XfwT9_nK2STltKofMgbQ9oNzckuo'});
        
        //URLSearchParams() : query에 있는 파리미터들을 추가하거나, 삭제하거나, 값을 가져오는 등 다양한 작업이 가능. &page=
        url.searchParams.set('page', page);
        console.log("url은",url);
        
        let response = await fetch(url,{headers:header}); 
        let data = await response.json(); //json : 서버통신에서 사용하는 자료형. 텍스트 형태의 객체라고 볼 수 있음.
        
        if(response.status == 200){
            if(data.total_hits == 0){
                throw new Error("검색된 결과값이 없습니다.");
            }
            news = data.articles;
            total_pages = data.total_pages;
            page = data.page;
            console.log(news);
            render();
            pagination();
        }else {
            throw new Error(data.message);
        };

    }catch(error){
        console.log("잡힌 에러는", error.message);
        errorRender(error.message); 
    };
};

/* 
[가장 최근 뉴스 가져오기]
async와 await은 set
*/
const getLatestNews = async() => {
    /* URL(``) : url을 분석해주고 url과 관련된 메서드를 사용할 수 있게 해줌. */
    url = new URL(`https://api.newscatcherapi.com/v2/latest_headlines?countries=KR&topic=business&page_size=5`)

    getNews();
};

/*
[카테고리 토픽별로 뉴스 가져오기]
*/
const getNewsByTopic = async(event) =>{
    console.log("클릭됨", event.target.textContent);
    let topic = event.target.textContent.toLowerCase();
    url = new URL(`https://api.newscatcherapi.com/v2/latest_headlines?countries=KR&page_size=5&topic=${topic}`)

    getNews();

};

const openSearchBox = () => {
  let inputArea = document.getElementById("input-area");
  if (inputArea.style.display === "inline") {
    inputArea.style.display = "none";
  } else {
    inputArea.style.display = "inline";
  }
};

/*
[검색한 키워드 대로 뉴스 가져오기]
*/
const getNewsByKeyword = async() => {
    //1. 인풋창의 검색 키워드 읽어오기
    //2. url에 검색 키워드 붙이기
    //3. 헤더 준비
    //4. url 부르기
    //5. 데이터 가져오기
    
    let keyword = document.getElementById("search-input").value;
    console.log("keyword", keyword);
    url = new URL(
        `https://api.newscatcherapi.com/v2/search?countries=KR&q=${keyword}&page_size=5`
        );
    
    getNews();

};

const render = () => {
    let newsHTML = "";
    // news는 array이고 array는 각각의 item을 (item)변수로 가져올 것이다.
    newsHTML = news.map((item)=>{
        return `<div class="row news"> 
        <div class="col-lg-4">
            <img class="news-img-size" src="${item.media}"/>
        </div>
        <div class="col-lg-8">
            <h2>${item.title}</h2>
            <p>
                ${item.summary}
            </p>
            <div>
                ${item.twitter_account} * ${item.published_date}
            </div>
        </div>
    </div>`;
    }).join(''); // mep의 특성상 array로 출력하므로 ,를 없애주기 위해 join을 적용함.

    document.getElementById("news-board").innerHTML= newsHTML;
};

const errorRender = (message) => {
    let errorHTML = `<div class="alert alert-danger text-center" role="alert">
    ${message}</div>`;
    document.getElementById("news-board").innerHTML = errorHTML;
};

const openNav = () => {
    document.getElementById("mySidenav").style.width = "250px";
  };
  
  const closeNav = () => {
    document.getElementById("mySidenav").style.width = "0";
  };

/* 
페이지네이션 

(api)total_page:15 
(api)page:12

1-5 6-10 11-15
 1   2     3

1. page 정보 기준으로 내가 몇번째 그룹인지 안다. ex) 3
-> Math.ceil(): 올림 함수 사용! ex) Math.ceil(page/5)

2. 그 그룹의 첫번째와 마지막 페이지를 안다. ex) 11,15
-> 첫번째: 마지막 페이지숫자-4 / 마지막: 그룹숫자*5

3. 첫번째 ~ 마지막 페이지까지 그려준다. ex) 11,12,13,14,15
for(첫번째-마지막) <a>pageNumber</a>

조건)
유저는 5개의 페이지를 한번에 볼 수 있다.
현재 보고있는 페이지는 갈색박스로 표시가 된다.
< > 버튼을 통해 다음 페이지로 이동할 수 있다.
<< >> 버튼을 통해 제일 처음과 제일 끝 페이지로 이동할 수 있다.
첫 페이지 그룹에 있으면 (1~5) << < 버튼은 사라진다.
제일 끝 페이지 그룹에 있으면 > >> 버튼은 사라진다.
*/
const pagination = () => {
    let paginationHTML = ``;
    // total_page
    // page

    let pageGroup = Math.ceil(page/5);
    let last = pageGroup * 5;
    let first = last - 4 <= 0 ? 1 : last -4;

    // total page 3일 경우 3개의 페이지만 프린트하는법. last, first
    if (last > total_pages) {
        last = total_pages;
    };

    // <<, <, >, >> 버튼 만들어주기. 기능도 구현.
    if (first >= 6) {
    paginationHTML = `<li class="page-item">
      <a class="page-link" href="#" aria-label="Previous" onclick="pageClick(1)">
        <span aria-hidden="true">&lt;&lt;</span>
      </a>
    </li>
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Previous" onclick="moveToPage(${page - 1})">
        <span aria-hidden="true">&lt;</span>
      </a>
    </li>`;
    }
    
    for(let i=first; i<=last; i++) {
        //현재 페이지 표시하기
        paginationHTML += `<li class="page-item ${page == i ? "active" : ""}">
        <a class="page-link" href="#" onclick="moveToPage(${i})">${i}
        </a>
        </li>`
    }

    // &lt; < / &gt; >
    if (last < total_pages){
    paginationHTML += `
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Next" onclick="moveToPage(${page + 1})">
        <span aria-hidden="true">&gt;</span> 
      </a>
    </li>
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Next" onclick="moveToPage(${total_pages})">
        <span aria-hidden="true">&gt;&gt;</span>
      </a>
    </li>`;
    }

    document.querySelector(".pagination").innerHTML = paginationHTML;
};

// 내가 첫번째 그룹일 때 << < 버튼이 사라짐.
// 내가 마지막 그룹일 때 > >> 버튼이 사라짐.

const moveToPage = (pageNum) => {
    // 이동하고싶은 페이지를 알아야함
    page = pageNum;
    //이동하고싶은 페이지를 가지고 api를 다시 호출해주자. 
    getNews();
}

/* 
함수는 정의 된 이후에 사용이 가능. 
const나 let을 사용하여 일반 변수처럼 함수를 만드는 ES6의 ""=>문법"의 경우, 
호이스팅이 적용되지 않으므로 로직의 순서가 매우 중요해짐.
그러므로 getNewsByKeyword 함수를 선언한 이후에 addEventListener 효과를 적용시키기 위해서 맨 하단으로 옮긴 것. */
searchButton.addEventListener("click", getNewsByKeyword);
getLatestNews();