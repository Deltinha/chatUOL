

let messagesElement = document.querySelector('.container-messages');
let userName;
let isFirstRender = true;
let isUserSendingMessage = false;
let stayConnectedIntervalID;

function showLoader(){
    document.querySelector('.login-screen__form').classList.add('hidden');
    document.querySelector('.login-screen__loader').classList.remove('hidden');
}

function hideLoader(){
    document.querySelector('.login-screen__form').classList.remove('hidden');
    document.querySelector('.login-screen__loader').classList.add('hidden');
}

function getUsername(){
    userName = document.querySelector('.login-screen__form input').value;
    showLoader();
    verifyUsername();
}

function verifyUsername(){
    const promise = axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/participants',
    {
        name: userName
    });
    promise.then(onLoginSuccess);
    promise.catch(onLoginRejected);
}

function showChatScreen(){
    document.querySelector('.login-screen').classList.add('hidden');
    document.querySelector('.chat-screen').classList.remove('hidden');
}

function onLoginSuccess(value){
    showChatScreen();
    stayConnectedIntervalID = setInterval(stayConnected,5000);
    retrieveMessages();
    setInterval(retrieveMessages,3000);
}

function onLoginRejected(value){
    hideLoader();
    alert('Este nome já está em uso. Insira outro.')
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

function scrollChat(){ //Scrolls chat to last message
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
                <span class="inline-message__receiver">${messageList[i].to}</span>
                :
                <span>${messageList[i].text}</span>
            </li>`
        }
        else if (messageList[i].type === 'private_message' && (messageList[i].to === userName || messageList[i].from === userName)) {
            messagesElement.innerHTML +=
            `<li class="inline-message private-message">
                <span class="inline-message__timestamp">(${messageList[i].time})</span>
                <span class="inline-message__sender">${messageList[i].from}</span>
                preservadamente para
                <span class="inline-message__receiver">${messageList[i].to}</span>
                :
                <span>${messageList[i].text}</span>
            </li>`
        }  
    }

    if (isFirstRender){
      scrollChat();
      isFirstRender = false;
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
   promise.then(sendSuccess);
   promise.catch(sendRejected);
}

function sendSuccess(value){
    isUserSendingMessage = true;
    retrieveMessages();
    
}

function sendRejected() { 
    alert('Você não está mais online. Atualize a página...'); //To test this condition, execute disconnect() into console.
    window.location.reload();    
}

function disconnect(){
    clearInterval(stayConnectedIntervalID);
}