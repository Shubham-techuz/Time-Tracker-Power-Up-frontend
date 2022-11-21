let t = window.TrelloPowerUp.iframe();

function timeDifference(value) {
  let time_diff = '';
  let hours = Math.floor((value % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = Math.floor((value % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((value % (1000 * 60)) / 1000);
  let hr = hours;
  let min = minutes;
  let sec = seconds;

  sec = parseInt(sec);
  min = parseInt(min);
  hr = parseInt(hr);

  sec = sec + 1;

  if (sec == 60) {
    min = min + 1;
    sec = 0;
  }
  if (min == 60) {
    hr = hr + 1;
    min = 0;
    sec = 0;
  }

  if (sec < 10 || sec == 0) {
    sec = '0' + sec;
  }
  if (min < 10 || min == 0) {
    min = '0' + min;
  }
  if (hr < 10 || hr == 0) {
    hr = '0' + hr;
  }
  if (hr == 0) {
    time_diff =  min + 'min ' + sec + 'sec';
  } else {
    time_diff = hr + 'hr ' + min + 'min ' + sec + 'sec';
  }

  return time_diff;
}

document.getElementById("track-time").addEventListener("click", function(event){
    return t.get('card', 'shared', 'startTime')
    .then(async function(startTime){
        if(!startTime) {
            try {
                let startTime = Date();
                let startTimestamp = new Date().getTime();
                let cardData = await t.card('id', 'name', 'desc');
                let cardId = cardData.id;
                let cardName = cardData.name;
                let cardDescription = cardData.desc;
                console.log("on click description---> ", cardDescription);
                // console.log('cardId ==> ', cardId, ' name==> ', cardName);
                return t.set('card', 'shared', { cardId: cardId, cardName: cardName, cardDescription: cardDescription, startTime: startTime, startTimestamp: startTimestamp });
            } catch(err) {
                console.log("Error===>", err);
            }
        } else {
            try {
                document.getElementById('track-time').disabled = true;
                let message = document.getElementById('card-description');
                let cardDescription = message.value;
                // console.log("Description value----->", message.value);
                
                let stopTime = Date();
                let stopTimestamp = new Date().getTime();
                let sharedData = await t.getAll();
                let {card: {shared: {cardId, cardName, startTime, startTimestamp}}} = sharedData;

                let timestampDifference = stopTimestamp - startTimestamp;
                let totalTime = timeDifference(timestampDifference);
                let fullTimeOnCard = "00 : 00 : 00";
                // GET Timestamp
                let previousTimeStampRes = await fetch(`https://trello-power-up-backend.herokuapp.com/timestamp/${cardId}`);
                previousTimeStampRes = await previousTimeStampRes.json();
                console.log("previousTimeStampRes ====>", previousTimeStampRes);

                if(previousTimeStampRes.cardId){
                    let fullTimestampOnCard = parseInt(previousTimeStampRes.completeTime) + timestampDifference;
                    let completeTime = fullTimestampOnCard;
                    fullTimeOnCard = timeDifference(fullTimestampOnCard);

                    // PUT Timestamp
                    let timestampPutRes = await fetch(`https://trello-power-up-backend.herokuapp.com/timestamp/${cardId}`, {
                        method: "Put", 
                        body: JSON.stringify({completeTime}),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                    timestampPutRes = await timestampPutRes.json();
                    console.log("timestampPutRes ====>",timestampPutRes);
                }else {
                    // POST Timestamp
                    fullTimeOnCard = totalTime;
                    let completeTime = timestampDifference;
                    let timestampPostRes = await fetch('https://trello-power-up-backend.herokuapp.com/timestamp', {
                        method: 'post',
                        body: JSON.stringify({cardId, completeTime}),
                        headers: {
                            'Content-Type': 'application/json'
                        }, 
                    })
                    timestampPostRes = await timestampPostRes.json();
                    console.log("timestampPostRes =====>", timestampPostRes);
                }

                
                
                //Post Api
                let result = await fetch('https://trello-power-up-backend.herokuapp.com/', {
                    method: 'post',
                    body: JSON.stringify({cardId, cardName, cardDescription, startTime, stopTime, totalTime}),
                    headers: {
                        'Content-Type': 'application/json'
                    }, 
                })
                result = await result.json();
                console.log("Result======> ",result);
                
                return t.set('card', 'shared', {totalTime: totalTime, stopTime: stopTime, fullTimeOnCard:  fullTimeOnCard});
            } catch(err) {
                console.log("Error===>", err);
            } finally{
                document.getElementById('track-time').disabled = false;
            }
        }
    })
    .then(function() {
        return t.closeModal();
    })
});

document.getElementById("clear-time").addEventListener("click", function(event){
    return t.remove('card', 'shared', ['cardId', ' cardName', 'cardDescription', 'startTime', 'stopTime', 'totalTime'])
    .then(function() {
        return t.closeModal();
    })
});


t.render(function(){
    return t.getAll('card', 'shared')
    .then(async function(sharedDate){
        console.log("---Render---");
        
        let cardData = await t.card('name', 'desc');
        document.getElementById('card-name').textContent = cardData.name;
        document.getElementById('card-description').innerHTML = cardData.desc;
        
        if(Object.keys(sharedDate).length > 0) {
            let {card: {shared: {stopTime, startTime, totalTime, cardName, cardDescription}}} = sharedDate;
            document.getElementById('card-name').textContent = cardName;
            document.getElementById('card-description').textContent = cardDescription;
            if(startTime && stopTime) {
                document.getElementById('start-time').getElementsByClassName('time')[0].textContent = startTime;
                document.getElementById('stop-time').getElementsByClassName('time')[0].textContent = stopTime;
                document.getElementById('track-time').classList.add("hidden");
                document.getElementById('time-interval-heading').classList.add("show");
                document.getElementById('time-interval').textContent = totalTime;
                
            }else if(startTime) {
                document.getElementById('start-time').getElementsByClassName('time')[0].textContent = startTime;
                document.getElementById('time-interval-heading').classList.add("hidden");
                const button = document.getElementById('track-time');
                button.classList.add("mod-danger");
                button.classList.add("mod-primary");
                button.textContent = 'Stop Time';
                
            }
        }
    })
    // .then(function(){
    //     t.sizeTo('#content').done();   
    // })
});

// {_id: '63760d79e25a1120dc2b7a7c', cardId: '636a02014cd95b01886e3e5a', completeTime: '6696', __v: 0}