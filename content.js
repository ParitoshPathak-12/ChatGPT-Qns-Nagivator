let ATTRIBUTE_NAME = 'data-testid';
let ATTRIBUTE_VALUE_PREFIX = 'conversation-turn-';
let QUESTIONS_LIST = []
let lastUrl = location.href;
const qnNavigateBtnsContainer = document.createElement("div");
qnNavigateBtnsContainer.classList.add("qn-navigate-btns-container");
qnNavigateBtnsContainer.classList.add("hide");
document.body.appendChild(qnNavigateBtnsContainer);

function initVaribles() {
    ATTRIBUTE_NAME = 'data-testid';
    ATTRIBUTE_VALUE_PREFIX = 'conversation-turn-';
    QUESTIONS_LIST = []
}

/*
ChatGPT is a SPA. 
1 - So When a user clicks on new conversation/chat, the page does not refreshes. But in the URL we can observe some change.
2 - When we ask questions then also the page does not refresh, only the content changes.

So, MutationObserver is used for to notice those changes and act accordingly.
*/
const observer = new MutationObserver((mutationList) => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        if (!qnNavigateBtnsContainer.classList.contains("hide")) {
            qnNavigateBtnsContainer.classList.add("hide")
        }
        qnNavigateBtnsContainer.replaceChildren();
        initVaribles();
        setTimeout(() => {
            loadQuestionsAndAnswers();
            addPropertyToQuestions();
            createQnNagivateButtons();
        }, 3000);
    } else {
        for (const mutation of mutationList) {
            const addedNodes = Array.from(mutation.addedNodes);
            for (const node of addedNodes) {
                if (
                    node.nodeType === 1 &&
                    node.getAttribute?.(ATTRIBUTE_NAME)?.startsWith(ATTRIBUTE_VALUE_PREFIX)
                ) {
                    const id = +node.getAttribute(ATTRIBUTE_NAME).split(ATTRIBUTE_VALUE_PREFIX)[1];
                    if (id % 2 == 1) {
                        QUESTIONS_LIST.push(node);
                        addPropertyToQuestions();
                        const len = QUESTIONS_LIST.length;
                        const btn = createLinkButton(len, node);
                        qnNavigateBtnsContainer.appendChild(btn);
                    }
                }
            }
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

/*
createQuestionsListDisplayAndHideButton - It creates a button which when clicked shows/hides the questions list
*/
function createQuestionsListDisplayAndHideButton() {
    const showQnsListBtn = document.createElement("button");
    showQnsListBtn.textContent = "📚 Questions List";
    showQnsListBtn.classList.add("show-qns-btn");
    document.body.appendChild(showQnsListBtn);
    showQnsListBtn.addEventListener("click", () => {
        qnNavigateBtnsContainer.classList.toggle("hide");
    })
}

function createLinkButton(contentToShow, qn) {
    const btn = document.createElement("button");
    btn.textContent = `Q${contentToShow}`;
    btn.addEventListener("click", () => {
        qn.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });
    return btn;
}

/*
createQnNagivateButtons - creates small buttons like: Q1, Q2, Q3.... which when clicked, navigate to the question.
*/
function createQnNagivateButtons() {
    QUESTIONS_LIST.forEach((qn, idx) => {
        const btn = createLinkButton(idx + 1, qn);
        qnNavigateBtnsContainer.appendChild(btn);
    });
}

/*
addPropertyToQuestions - it adds the id attribute to each of the questions.
*/
function addPropertyToQuestions() {
    for (const q of QUESTIONS_LIST) {
        const id = +q.getAttribute(ATTRIBUTE_NAME).split(ATTRIBUTE_VALUE_PREFIX)[1];
        q.setAttribute('id', id);
    }
}

function loadQuestionsAndAnswers() {
    const questionsAndAnswers = document.querySelectorAll(`[${ATTRIBUTE_NAME}^="${ATTRIBUTE_VALUE_PREFIX}"]`);
    if (questionsAndAnswers.length > 0) {
        questionsAndAnswers.forEach(qa => {
            const id = +qa.getAttribute(ATTRIBUTE_NAME).split(ATTRIBUTE_VALUE_PREFIX)[1];
            if (id % 2 === 1) {
                QUESTIONS_LIST.push(qa);
            }
        });
    }
}

function loadQnAAfterPageContentLoad() {
    loadQuestionsAndAnswers();
    clearInterval(initialDelayCheck);
    initialDelayCheck = null;
    addPropertyToQuestions();
    createQuestionsListDisplayAndHideButton();
    createQnNagivateButtons();
}

let initialDelayCheck = null;

function startup(timeDelay) {
    initialDelayCheck = setInterval(loadQnAAfterPageContentLoad, timeDelay);
}

startup(3000);