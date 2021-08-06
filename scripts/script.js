

let messagesElement = document.querySelector('.messages');
let firstLoad = true;

function retrieveMessages(){
    const promise = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages");
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


retrieveMessages();
setInterval(retrieveMessages,3000);

