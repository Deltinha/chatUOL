//let messagesElement = document.querySelector('.container-messages');
let userName;
let isFirstRender = true;
let isUserSendingMessage = false;
let stayConnectedIntervalID;
let lastCheckedAddressee = 'Todos';

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
    document.querySelector('.chat-room').classList.remove('hidden');
}

function onLoginSuccess(value){
    showChatScreen();
    stayConnectedIntervalID = setInterval(stayConnected,5000);
    retrieveMessages();
    setInterval(retrieveMessages,3000);
    retrieveParticipants();
    setInterval(retrieveParticipants,10000);
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

function scrollChat(messagesElement){ //Scrolls chat to last message
    messagesElement.lastChild.scrollIntoView();
}

function renderMessages(messages){
    
    let messagesElement = document.querySelector('.container-messages');
    messagesElement.innerHTML = '';

    for (let i = 0; i < messages.data.length; i++) {

        if (messages.data[i].type === 'status') {

            messagesElement.innerHTML += 
            `<li class="inline-message status">
                <span class="inline-message__timestamp">(${messages.data[i].time})</span>
                <span class="inline-message__sender">${messages.data[i].from}
                </span>${messages.data[i].text}
            </li>`
        }
        else if(messages.data[i].type === 'message'){

            messagesElement.innerHTML += 
            `<li class="inline-message public-message">
                <span class="inline-message__timestamp">(${messages.data[i].time})</span>
                <span class="inline-message__sender">${messages.data[i].from}</span>
                para
                <span class="inline-message__receiver">${messages.data[i].to}</span>
                :
                <span>${messages.data[i].text}</span>
            </li>`
        }
        else if (messages.data[i].type === 'private_message' && (messages.data[i].to === userName || messages.data[i].from === userName)) {
            
            messagesElement.innerHTML +=
            `<li class="inline-message private-message">
                <span class="inline-message__timestamp">(${messages.data[i].time})</span>
                <span class="inline-message__sender">${messages.data[i].from}</span>
                reservadamente para
                <span class="inline-message__receiver">${messages.data[i].to}</span>
                :
                <span>${messages.data[i].text}</span>
            </li>`
        }  
    }

    if (isFirstRender){  //Scroll only on first render
        scrollChat(messagesElement);
        isFirstRender = false;
    }
    if (isUserSendingMessage){  //Scroll chat if user just sent a message
        scrollChat(messagesElement);
        isUserSendingMessage = false;
    }
}

function getAddressee(){
    lastCheckedAddressee = document.querySelector('.participants__menu__send-to input:checked').value;
    return lastCheckedAddressee;
}

function getMessageType(){
    return document.querySelector('.participants__menu__visibility input:checked').value;
}

function getMessageInput(){
    return document.querySelector('.form-send-message input').value;
}

function sendMessage(){
   const promise = axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages',
   {
        from: userName,
        to: lastCheckedAddressee,    //To preserve the checked addressee after an update on participants list 
        text: getMessageInput(),  //I had to use lastCheckedAddressee instead of calling getAddressee().
        type: getMessageType()
   });
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

function toggleParticipantsMenu(){
    document.querySelector('.participants__menu').classList.toggle('hidden');
    document.querySelector('.participants__black-overlay').classList.toggle('hidden');
}

function retrieveParticipants(){
    const promise = axios.get('https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/participants');
    promise.then(renderParticipants);
}

function renderParticipants(participants){
    let participantsElement = document.querySelector('.participants__menu__send-to');
    participantsElement.innerHTML = 
    `
        <div>
            <input onclick="getAddressee();" type="radio" name="send-to" id="everyone" value="Todos" class="hidden" ${autoCheckAddressee('everyone')}>
                <label for="everyone">
                    <ion-icon name="people-circle"></ion-icon>    
                    <span>Todos</span>
                </label>
            </input>
        </div>
    `;

    for (let i = 0; i < participants.data.length; i++) {
        

        participantsElement.innerHTML +=
        `
            <div>
                <input onclick="getAddressee();" type="radio" name="send-to" id='${participants.data[i].name}' value='${participants.data[i].name}' class="hidden" ${autoCheckAddressee(participants.data[i].name)}>
                    <label for='${participants.data[i].name}'>
                        <ion-icon name="person-circle"></ion-icon>
                        <span>${participants.data[i].name}</span>
                    </label>
                </input>
            </div>
        `
        
    }
}

function autoCheckAddressee(checkTarget){
    if (checkTarget === 'everyone') {
        if (lastCheckedAddressee === 'Todos') {
            return 'checked';
        }
        else{
            return;
        } 
    }
    else {
        if (checkTarget === 'Todos') {  //Do not auto check if the target is a participant called Todos
            return
        }
        else if (checkTarget === lastCheckedAddressee) {
            return 'checked';
        }
        else{
            return;
        }
    }
    
}