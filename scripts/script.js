

let messagesElement = document.querySelector('.container-messages');
let userName;
let firstLoad = true;
let stayConnectedIntervalID;

askUsername(true);
verifyUsername();

function askUsername(firstTry){
    if (firstTry) {
        userName = prompt('Qual seu nome?');    
    }
    else{
        userName = prompt('Este nome está sendo usado. Insira por favor um novo nome.');    
    }
    
}

function verifyUsername(){
    const promise = axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/participants',
    {
        name: userName
    });
    promise.then(onLoginSuccess);
    promise.catch(onLoginRejected);
}

function onLoginSuccess(value){
    stayConnectedIntervalID = setInterval(stayConnected,5000);
    retrieveMessages();
    setInterval(retrieveMessages,3000);
}

function onLoginRejected(value){
    askUsername(false);
    verifyUsername();
}

function stayConnected(){
    const promise = axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/status',
    {
        name: userName
    })
}

function retrieveMessages(){
    const promise = axios.get('https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages');
    promise.then(renderMessages);
}

function scrollChat(){
    messagesElement.lastChild.scrollIntoView();
}

function renderMessages(messages){
    let messageList = messages.data;
    
    messagesElement.innerHTML = '';

    for (let i = 0; i < messageList.length; i++) {
        if (messageList[i].type === 'status') {
            messagesElement.innerHTML += 
            `<li class="inline-message status">
                <span class="inline-message__timestamp">(${messageList[i].time})</span>
                <span class="inline-message__sender">${messageList[i].from}
                </span>${messageList[i].text}
            </li>`
        }
        else if(messageList[i].type === 'message'){
            messagesElement.innerHTML += 
            `<li class="inline-message public-message">
                <span class="inline-message__timestamp">(${messageList[i].time})</span>
                <span class="inline-message__sender">${messageList[i].from}</span>
                para
                <span class="inline-message__recipient">${messageList[i].to}</span>
                :
                <span>${messageList[i].text}</span>
            </li>`
        }
        else if (messageList[i].type === 'private') {
            messagesElement.innerHTML +=
            `<li class="inline-message private-message">
                <span class="inline-message__timestamp">(${messageList[i].time})</span>
                <span class="inline-message__sender">${messageList[i].from}</span>
                preservadamente para
                <span class="inline-message__recipient">${messageList[i].to}</span>
                :
                <span>${messageList[i].text}</span>
            </li>`
        }  
    }

    if (firstLoad) {
     scrollChat();
     firstLoad = false;
    }
}

function getMessageInput(){
    return {
        from: userName,
	    to: 'Todos',
	    text: document.querySelector('.container-send-message input').value,
	    type: "message"
    }
};



function sendMessage(){
   const promise = axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages', getMessageInput());
   promise.then(msgEnviada);
   promise.catch(msgErro);
}

function msgEnviada(){
    retrieveMessages();
}

function msgErro() { //Execute disconnect() into console to test this condition
    alert('Você não está mais online. Atualize a página...');
    window.location.reload();    
}

function disconnect(){
    clearInterval(stayConnectedIntervalID);
}