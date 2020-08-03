const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const API_KEY = '1f59f24a14db6afb099692a4423e7dc3';
const REQUEST = 'https://api.themoviedb.org/3/movie/550?api_key=1f59f24a14db6afb099692a4423e7dc3'
const SERVER = 'https://api.themoviedb.org/3';
const PROXY  = 'https://cors-anywhere.herokuapp.com/';

const leftMenu = document.querySelector('.left-menu'),
      hamburger =  document.querySelector('.hamburger'),
      tvShowList = document.querySelector('.tv-shows__list'),
      modal =  document.querySelector('.modal'),
      tvShows = document.querySelector('.tv-shows'),
      tvCardImg = document.querySelector('.tv-card__img'),
      modalTitle = document.querySelector('.modal__title'),
      genresList = document.querySelector('.genres-list'),
      rating = document.querySelector('.rating'),
      description = document.querySelector('.description'),
      modalLink = document.querySelector('.modal__link'),
      searchFormInput =  document.querySelector('.search__form-input'),  
      searchForm =  document.querySelector('.search__form'),
      preloader =  document.querySelector('.preloader'),
      dropdown = document.querySelectorAll('.dropdown'),
      tvShowsHead = document.querySelector('.tv-shows__head'),
      posterWrapper =  document.querySelector('.poster__wrapper'),
      modalContent =  document.querySelector('.modal-content')
      pagination =  document.querySelector('.pagination');



const loading = document.createElement('div');
loading.className = 'loading';

const closeDropdown = ()=>{
    dropdown.forEach(item=>{
        item.classList.remove('active')
    })
}


hamburger.addEventListener('click', ()=>{
leftMenu.classList.toggle('openMenu')
hamburger.classList.toggle('open')
closeDropdown()
});

document.body.addEventListener('click', e=>{
    
    if(!e.target.closest('.left-menu')){
        leftMenu.classList.remove('openMenu')
        hamburger.classList.remove('open')
        closeDropdown()
        

    }
});

leftMenu.addEventListener('click',(e)=>{
    const target = e.target;
    const dropdown =  e.target.closest('.dropdown')
    if(dropdown){
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu')
        hamburger.classList.add('open')
    }

    if(target.closest('#top-rated')){
        new DBService().getTopRated().then((response)=>renderCard(response, target));
    
    }

    if(target.closest('#popular')){
        new DBService().getPopular().then((response)=>renderCard(response, target))
    
    }

    if(target.closest('#week')){
        new DBService().getWeek().then((response)=>renderCard(response, target))
    
    }
    if(target.closest('#today')){
        new DBService().getToday().then((response)=>renderCard(response, target))
    
    }

    if(target.closest('#search')){
        tvShowList.textContent = '';
        tvShowsHead.textContent = '';
    }


});





modal.addEventListener('click', e=>{
    if(e.target.closest('.cross') 
    || e.target.classList.contains('modal')){
        document.body.style.overflow = '';
        modal.classList.add('hide')

    }

});



const DBService = class{
    getData = async (url)=>{
        const res = await fetch(url);
        console.dir(fetch)
        if(res.ok){
           return res.json()
        }
        else{
            throw new Error(` Не удалось получить данные
            по адресу ${url}`)
        }       
    }
    getTestData = async ()=>{
         return await this.getData('test.json')
    }

    getTestCard =()=>{
        return this.getData('card.json');
    }
    getSearchResult =(query)=>{
        this.temp = `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`

        return this.getData(`https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`)
    }
    getNextPage =(page, query)=>{
        return this.getData(`https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU&page=${page}`)
         
    }

    getTvShow = id=>{
    //return this.getData(`${PROXY}${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`)
    return this.getData (`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=ru-RU`)
    }

    getToday = ()=> this.getData(`https://api.themoviedb.org/3/tv/airing_today?api_key=${API_KEY}&language=ru-RU?`)

    getPopular = ()=> this.getData(`https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=ru-RU?`)

    getTopRated = ()=> this.getData(`https://api.themoviedb.org/3/tv/top_rated?api_key=${API_KEY}&language=ru-RU?`)

getWeek = ()=> this.getData(`https://api.themoviedb.org/3/tv/on_the_air?api_key=${API_KEY}&language=ru-RU?`)
}



const renderCard = (response, target)=>{
    tvShowList.textContent = '';
    console.log(response)



if(!response.total_results){
    loading.remove();
    tvShowsHead.style.cssText = 'color: red; '
    tvShowsHead.textContent = 'К сожалениею по вашему запросу ничего не найдено'
    return
}

tvShowsHead.style.cssText = 'color: green; '
tvShowsHead.textContent = target? target.textContent: 'Результат поиска';
    response.results.forEach(item=>{
        const {
             backdrop_path: backdrop,
             name: title, 
             poster_path: poster, 
             vote_average: vote,
             id,
             } = item

        const posterImg = poster ? IMG_URL+poster: 'img/no-poster.jpg';
        const backdropImg = backdrop ? IMG_URL+backdrop:'img/no-poster.jpg';
        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>`: '';
        const card = document.createElement('li');
        card.idTv = id;

        card.classList.add('tv-shows__item');
        card.innerHTML=`
        <a href="#" class="tv-card" id="${id}">
            ${voteElem}
            <img class="tv-card__img"
                src="${posterImg}"
                data-backdrop="${IMG_URL}/${backdrop}"
                alt="#${title}">
            <h4 class="tv-card__head">${title}</h4>
            </a>
        `
             loading.remove();
            tvShowList.insertAdjacentElement('afterbegin', card)
    });

    pagination.innerHTML = '';
    if(response.total_pages>1){
        for(let i=1; i<=response.total_pages; i++){
            pagination.innerHTML +=`
            <li><a href="#" class="pages">${i}</a></li>`
        }
    }
}


searchForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const value = searchFormInput.value.trim();
    if(value){
        tvShows.append(loading);
        new DBService().getSearchResult(value).then(renderCard);
    }
    
    searchFormInput.value = '';

});





tvShowList.addEventListener('click', e=>{
    e.preventDefault();
    const target = e.target;
    const card =  target.closest('.tv-card')
    console.log(card.id)
    if(card){
        preloader.style.display = 'block'
        new DBService().getTvShow(card.id)
            .then(response=>{

                console.log(response)
                if(response.poster_path){
                    tvCardImg.src = IMG_URL + response.poster_path;
                    posterWrapper.style.display = '';
                }
                else{
                    posterWrapper.style.display = 'none';
                }
                
                
                modalTitle.textContent = response.name;
                genresList.innerHTML = '';
                for(const item of response.genres){
                    genresList.innerHTML +=`<li>${item.name}</li>`;

                }
                rating.innerHTML =  response.vote_average;
                description.innerHTML = response.overview;
                modalLink.href = response.homepage;
              })
              .then(()=>{
                document.body.style.overflow = 'hiiden';
                modal.classList.remove('hide')
              })
              .then(()=>{
                  preloader.style.display = 'none';
              })
    }
});




{   tvShows.append(loading);
    new DBService().getTestData().then(renderCard);
}

pagination.addEventListener('click', (e)=>{
    e.preventDefault();
    if(e.target.classList.contains('pages')){
        new DBService().getNextPage(e.target.textContent, searchFormInput.value.trim()).then(renderCard)


    }

});